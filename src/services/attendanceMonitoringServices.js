import { Op } from "sequelize";
import db from "../models/index.js";

const {
  Schedule,
  Class,
  Subject,
  LessonTime,
  User,
  Student,
  AttendanceSession,
  AttendanceDetail,
  TeacherPermission,
} = db;

class MonitoringService {
  static async getMonitoring({ date, class_id }) {
    console.log("=== [SERVICE] Attendance Monitoring Start ===");
    console.log("[SERVICE] Input:", { date, class_id });

    function getLocalDate() {
      const now = new Date();
      return new Date(now.getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
    }

    const selectDate = date || getLocalDate();

    const day = new Date(selectDate)
      .toLocaleDateString("id-ID", { weekday: "long" })
      .toLowerCase();

    console.log("[SERVICE] Converted Day:", day);

    const schedules = await Schedule.findAll({
      where: { day, ...(class_id && { class_id }) },
      include: [
        { model: Class, attributes: ["id", "name"] },
        { model: Subject, attributes: ["id", "name"] },
        {
          model: LessonTime,
          attributes: ["id", "order", "name", "start_time", "end_time"],
        },
        { model: User, as: "teacher", attributes: ["id", "name"] },
      ],
      order: [[LessonTime, "order", "ASC"]],
    });

    console.log("[SERVICE] Schedules found:", schedules.length);

    const sessions = await AttendanceSession.findAll({
      where: { date: selectDate },
    });

    console.log("[SERVICE] Sessions found:", sessions.length);

    const permissions = await TeacherPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: selectDate },
        end_date: { [Op.gte]: selectDate },
      },
    });

    console.log("[SERVICE] Permissions found:", permissions.length);

    const today = getLocalDate();
    let dateType = "today";

    if (selectDate < today) dateType = "past";
    else if (selectDate > today) dateType = "future";

    console.log("[SERVICE] Date Type:", dateType);

    const result = schedules.map((s) => {
      const session = sessions.find((sess) => sess.schedule_id === s.id);

      const permission = permissions.find((p) => p.teacher_id === s.teacher_id);

      const is_submitted = !!session || !!permission;

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      const start = s.LessonTime.start_time?.slice(0, 5);
      const end = s.LessonTime.end_time?.slice(0, 5);

      let status = "alpha";

      if (dateType === "future") {
        status = "belum_mulai";
      } else if (dateType === "today") {
        if (currentTime < start) {
          status = "belum_mulai";
        } else if (currentTime >= start && currentTime <= end) {
          if (permission) {
            status = "izin";
          } else if (session) {
            status = session.is_teacher_present ? "hadir" : "alpha";
          } else {
            status = "berlangsung";
          }
        } else {
          // sudah lewat
          if (permission) {
            status = "izin";
          } else if (session) {
            status = session.is_teacher_present ? "hadir" : "alpha";
          } else {
            status = "alpha";
          }
        }
      } else {
        // past
        if (permission) {
          status = "izin";
        } else if (session) {
          status = session.is_teacher_present ? "hadir" : "alpha";
        } else {
          status = "alpha";
        }
      }

      console.log(`[SERVICE] Schedule ${s.id} → Status: ${status}`);

      return {
        id: s.id,
        class: { id: s.Class.id, name: s.Class.name },
        subject: { id: s.Subject.id, name: s.Subject.name },
        teacher: { id: s.teacher.id, name: s.teacher.name },
        lesson_time: {
          id: s.LessonTime.id,
          order: s.LessonTime.order,
          name: s.LessonTime.name,
          start_time: s.LessonTime.start_time,
          end_time: s.LessonTime.end_time,
        },
        status,

        is_submitted,
      };
    });

    console.log("=== [SERVICE] Monitoring Done ===");

    return { date: selectDate, total: result.length, data: result };
  }

  static async editAttendance({
    schedule_id,
    date,
    attendances,
    is_teacher_present,
    adminId,
  }) {
    console.log("=== [SERVICE] EDIT Attendance Start ===");
    console.log("[SERVICE] Input:", {
      schedule_id,
      date,
      is_teacher_present,
      total_students: attendances?.length,
    });

    const schedule = await Schedule.findByPk(schedule_id);

    if (!schedule) {
      throw new Error("Jadwal tidak di temukan");
    }

    const students = await Student.findAll({
      where: { class_id: schedule.class_id },
      attributes: ["id"],
    });

    const studentIds = students.map((s) => s.id);

    const isValid = attendances.every((a) => studentIds.includes(a.student_id));

    if (!isValid) {
      throw new Error("Ada siswa tidak sesuai kelas");
    }

    let session = await AttendanceSession.findOne({
      where: { schedule_id, date },
    });
    console.log("[SERVICE] Existing session:", session?.id || "NONE");

    if (!session) {
      console.log("[SERVICE] Creating new session...");
      const lastMeeting = await AttendanceSession.max("meeting_number", {
        where: { schedule_id },
      });

      const meetingNumber = lastMeeting ? lastMeeting + 1 : 1;

      session = await AttendanceSession.create({
        schedule_id,
        meeting_number: meetingNumber,
        date,
        created_by: adminId,
        is_teacher_present,
      });
      console.log("[SERVICE] New session created:", session.id);

      const details = attendances.map((a) => ({
        attendance_session_id: session.id,
        student_id: a.student_id,
        status: a.status,
      }));

      await AttendanceDetail.bulkCreate(details);
      console.log("[SERVICE] Bulk details created:", details.length);
    } else {
      await session.update({ is_teacher_present });
      for (const a of attendances) {
        const existing = await AttendanceDetail.findOne({
          where: {
            attendance_session_id: session.id,
            student_id: a.student_id,
          },
        });

        if (existing) {
          await existing.update({ status: a.status });

          console.log(`[SERVICE] Update student ${a.student_id} → ${a.status}`);
        } else {
          await AttendanceDetail.create({
            attendance_session_id: session.id,
            student_id: a.student_id,
            status: a.status,
          });

          console.log(`[SERVICE] Insert student ${a.student_id} → ${a.status}`);
        }
      }
    }
    console.log("=== [SERVICE] EDIT Attendance DONE ===");

    return true;
  }

  static async getAttendanceDetail({ schedule_id, date }) {
    console.log("=== [SERVICE] GET Attendance Detail Start ===");
    console.log("[SERVICE] Input:", { schedule_id, date });

    function getLocalDate() {
      const now = new Date();
      return new Date(now.getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
    }

    const selectDate = date || getLocalDate();

    // 🔍 Ambil schedule + relasi
    const schedule = await Schedule.findByPk(schedule_id, {
      include: [
        { model: Class, attributes: ["id", "name"] },
        { model: Subject, attributes: ["id", "name"] },
        {
          model: LessonTime,
          attributes: ["id", "name", "start_time", "end_time"],
        },
        { model: User, as: "teacher", attributes: ["id", "name"] },
      ],
    });

    if (!schedule) {
      console.log("[SERVICE] Schedule NOT FOUND");
      throw new Error("Jadwal tidak ditemukan");
    }

    console.log("[SERVICE] Schedule found:", schedule.id);

    // 👨‍🎓 Ambil semua siswa di kelas
    const students = await Student.findAll({
      where: { class_id: schedule.class_id },
      attributes: ["id"],
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [[User, "name", "ASC"]],
    });

    console.log("[SERVICE] Students found:", students.length);

    // CCTV 🔥
    if (students.length > 0) {
      console.log(
        "[SERVICE] Sample student:",
        students[0].id,
        students[0].User?.name,
      );
    }

    console.log("[SERVICE] Students found:", students.length);

    // 📘 Cek session
    const session = await AttendanceSession.findOne({
      where: { schedule_id, date: selectDate },
    });

    console.log("[SERVICE] Session:", session ? session.id : "NONE");

    let detailsMap = {};

    if (session) {
      const details = await AttendanceDetail.findAll({
        where: { attendance_session_id: session.id },
      });

      console.log("[SERVICE] Details found:", details.length);

      details.forEach((d) => {
        detailsMap[d.student_id] = d.status;
      });
    }

    // 🧠 Mapping students + status
    const studentData = students.map((s) => ({
      student_id: s.id,
      name: s.User?.name || "Tanpa Nama",
      status: detailsMap[s.id] || "alpha",
    }));

    console.log("[SERVICE] Final student mapped:", studentData.length);

    console.log("=== [SERVICE] GET Attendance Detail DONE ===");

    return {
      schedule: {
        id: schedule.id,
        class: schedule.Class,
        subject: schedule.Subject,
        teacher: schedule.teacher,
        lesson_time: schedule.LessonTime,
      },
      date: selectDate,
      is_teacher_present: session ? session.is_teacher_present : false,
      students: studentData,
    };
  }

  static async getClass() {
    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return classes;
  }
}

export default MonitoringService;
