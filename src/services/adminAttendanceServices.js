import { Op } from "sequelize";
import db from "../models/index.js";
import { getWIBDateString } from "../utils/timeHelper.js";

const {
  Schedule,
  Student,
  User,
  AttendanceSession,
  AttendanceDetail,
  StudentPermission,
  TeacherPermission,
  TeacherPermissionDetail,
  PermissionType,
} = db;

class AdminAttendanceServices {
  static async getFrom({ schedule_id, date }) {
    console.log("=== [ADMIN] GET FORM START ===");

    const selectedDate = date || getWIBDateString();
    console.log("[ADMIN] Date:", selectedDate);

    const schedule = await Schedule.findByPk(schedule_id, {
      include: ["Class", "Subject", "LessonTime"],
    });

    if (!schedule) throw new Error("Jadwal tidak di temukan");

    const students = await Student.findAll({
      where: { class_id: schedule.class_id },
      attributes: ["id"],
      include: [{ model: User, attributes: ["id", "name"], required: true }],
    });

    const session = await AttendanceSession.findOne({
      where: { schedule_id, date: selectedDate },
    });

    const details = session
      ? await AttendanceDetail.findAll({
          where: { attendance_session_id: session.id },
        })
      : [];

    const permissions = await StudentPermission.findAll({
      where: {
        student_id: { [Op.in]: students.map((s) => s.id) },
        status: "approved",
        start_date: { [Op.lte]: selectedDate },
        end_date: { [Op.gte]: selectedDate },
      },
      include: [{ model: PermissionType, attributes: ["name"] }],
    });

    const resultStudents = students.map((s) => {
      const detail = details.find((d) => d.student_id === s.id);
      const permission = permissions.find((p) => p.student_id === s.id);

      let status = null;

      if (session && detail) {
        status = detail.status;
      } else if (!session && permission) {
        status =
          permission.PermissionType.name.toLowerCase() === "sakit"
            ? "sakit"
            : "izin";
      }

      return { id: s.id, name: s.User.name, status };
    });
    console.log("=== [ADMIN] GET FORM DONE ===");

    return {
      schedule,
      is_submitted: !!session,
      students: resultStudents,
    };
  }

  static async createAttendance({ schedule_id, date, attendances, adminId }) {
    console.log("=== [ADMIN] CREATE START ===");

    const selectedDate = date || getWIBDateString();
    console.log("[ADMIN] Date:", selectedDate);

    const schedule = await Schedule.findByPk(schedule_id);
    if (!schedule) throw new Error("Jadwal tidak di temukan");

    const permission = await TeacherPermission.findOne({
      where: {
        teacher_id: schedule.teacher_id,
        status: "approved",
        start_date: { [Op.lte]: selectedDate },
        end_date: { [Op.gte]: selectedDate },
      },
      include: [
        {
          model: TeacherPermissionDetail,
          as: "details",
          where: { schedule_id },
          required: true,
        },
      ],
    });

    if (!permission) {
      throw new Error("Guru tidak izin, admin tidak boleh input");
    }

    const existing = await AttendanceSession.findOne({
      where: { schedule_id, date: selectedDate },
    });

    if (existing) {
      throw new Error("Absen sudah ada, gunakan edit");
    }

    const lastMeeting = await AttendanceSession.max("meeting_number", {
      where: { schedule_id },
    });

    const meetingNumber = lastMeeting ? lastMeeting + 1 : 1;

    const session = await AttendanceSession.create({
      schedule_id,
      meeting_number: meetingNumber,
      date: selectedDate,
      created_by: adminId,
      is_teacher_present: false,
    });

    console.log("[ADMIN] Session created:", session.id);

    const permissions = await StudentPermission.findAll({
      where: {
        student_id: { [Op.in]: attendances.map((a) => a.student_id) },
        status: "approved",
        start_date: { [Op.lte]: selectedDate },
        end_date: { [Op.gte]: selectedDate },
      },
      include: [{ model: PermissionType, attributes: ["name"] }],
    });

    const details = [];

    for (const a of attendances) {
      const permission = permissions.find((p) => p.student_id === a.student_id);

      let finalStatus = a.status;

      if (permission) {
        finalStatus =
          permission.PermissionType.name.toLowerCase() == "sakit"
            ? "sakit"
            : "izin";

        console.log(
          `[ADMIN] Override student ${a.student_id} → ${finalStatus}`,
        );
      }
      details.push({
        attendance_session_id: session.id,
        student_id: a.student_id,
        status: finalStatus,
      });
    }

    await AttendanceDetail.bulkCreate(details);
    console.log("=== [ADMIN] CREATE DONE ===");

    return session;
  }

  static async updateAttendance({ schedule_id, date, attendances }) {
    console.log("=== [ADMIN] UPDATE START ===");

    const selectedDate = date || getWIBDateString();

    const session = await AttendanceSession.findOne({
      where: { schedule_id, date: selectedDate },
    });

    if (!session) {
      throw new Error("Belum ada absen, tidak bisa edit");
    }

    for (const a of attendances) {
      const existing = await AttendanceDetail.findOne({
        where: { attendance_session_id: session.id, student_id: a.student_id },
      });

      if (existing) {
        await existing.update({ status: a.status });
        console.log(`[ADMIN] Update ${a.student_id} → ${a.status}`);
      } else {
        await AttendanceDetail.create({
          attendance_session_id: session.id,
          student_id: a.student_id,
          status: a.status,
        });
        console.log(`[ADMIN] Insert ${a.student_id} → ${a.status}`);
      }
    }
    console.log("=== [ADMIN] UPDATE DONE ===");

    return true;
  }

  static async getClasses({ date }) {
    const classes = await db.Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return classes;
  }

  static async getSchedules({ class_id, date }) {
    const selectedDate = date || getWIBDateString();

    const day = new Date(selectedDate)
      .toLocaleDateString("id-ID", { weekday: "long" })
      .toLowerCase();

    const schedules = await Schedule.findAll({
      where: { class_id, day },
      include: [
        { model: db.Subject, attributes: ["id", "name"] },
        { model: db.LessonTime, attributes: ["id", "order", "name"] },
      ],
      order: [[db.LessonTime, "order", "ASC"]],
    });

    return schedules;
  }
}

export default AdminAttendanceServices;
