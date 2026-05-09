import { Op } from "sequelize";
import db from "../../models/index.js";
import {
  getWIBDate,
  getWIBDateString,
  getWIBDayName,
  getWIBTimeString,
} from "../../utils/timeHelper.js";
import NotificationService from "../notificationServices.js";

const {
  Schedule,
  Class,
  Subject,
  LessonTime,
  Student,
  User,
  AttendanceSession,
  AttendanceDetail,
  StudentPermission,
  PermissionType,
  TeachingAssignment,
} = db;

class AttendaceService {
  static async getTodaySchedules(teacherId) {
    const today = getWIBDayName();

    const schedules = await Schedule.findAll({
      where: { day: today },

      include: [
        {
          model: TeachingAssignment,
          where: { teacher_id: teacherId },

          include: [
            { model: Class, attributes: ["id", "name"] },
            { model: Subject, attributes: ["id", "name"] },
            { model: User, as: "teacher", attributes: ["id", "name"] },
          ],
        },

        {
          model: LessonTime,
          attributes: ["id", "start_time", "end_time"],
        },
      ],

      order: [[LessonTime, "order", "ASC"]],
    });
    return schedules;
  }

  static async getStudentBySchedule(scheduleId, teacherId) {
    const schedule = await Schedule.findOne({
      where: { id: scheduleId },

      include: [
        {
          model: TeachingAssignment,
          where: { teacher_id: teacherId },

          include: [
            { model: Class, attributes: ["id", "name"] },
            { model: Subject, attributes: ["id", "name"] },
            { model: User, as: "teacher", attributes: ["id", "name"] },
          ],
        },

        {
          model: LessonTime,
          attributes: ["id", "start_time", "end_time"],
        },
      ],
    });

    if (!schedule) {
      throw new Error("Jadwal tidak di temukan");
    }

    const students = await Student.findAll({
      where: {
        class_id: schedule.TeachingAssignment.class_id,
      },

      include: [
        {
          model: User,
          attributes: ["id", "name"],
          required: true,
        },
      ],

      attributes: ["id"],
    });

    const today = getWIBDateString();

    const permissions = await StudentPermission.findAll({
      where: {
        student_id: {
          [Op.in]: students.map((s) => s.id),
        },

        status: "approved",

        start_date: {
          [Op.lte]: today,
        },

        end_date: {
          [Op.gte]: today,
        },
      },

      include: [
        {
          model: PermissionType,
          attributes: ["name"],
        },
      ],
    });

    const studentWithStatus = students.map((s) => {
      const permission = permissions.find((p) => p.student_id === s.id);

      let status = null;

      if (permission) {
        status =
          permission.PermissionType.name.toLowerCase() === "sakit"
            ? "sakit"
            : "izin";
      }

      return {
        id: s.id,
        name: s.User.name,
        status,
      };
    });

    return {
      schedule,
      students: studentWithStatus,
    };
  }

  static async submitAttendance(teacherId, body) {
    const { schedule_id, date, attendances } = body;
    if (!attendances || !Array.isArray(attendances)) {
      throw new Error("Format attendances tidak valid");
    }

    const formatedDate = date
      ? new Date(date).toISOString().slice(0, 10)
      : getWIBDateString();

    const schedule = await Schedule.findOne({
      where: { id: schedule_id },

      include: [
        {
          model: TeachingAssignment,
          where: { teacher_id: teacherId },
        },
        {
          model: LessonTime,
        },
      ],
    });

    if (!schedule) {
      throw new Error("Jadwal tidak di temukan");
    }

    // const now = new Date();
    const currentTime = getWIBTimeString();
    const start = schedule.LessonTime.start_time.slice(0, 5);
    const end = schedule.LessonTime.end_time.slice(0, 5);

    if (!(currentTime >= start && currentTime <= end)) {
      throw new Error(
        "Absen hanya boleh di lakukan saat jam pelajaran berlangsung",
      );
    }

    const existing = await AttendanceSession.findOne({
      where: { schedule_id, date: formatedDate },
    });

    if (existing) {
      throw new Error("Attendance already submitted");
    }

    // Validasi siswa
    const students = await Student.findAll({
      where: { class_id: schedule.TeachingAssignment.class_id },
      attributes: ["id"],
      include: [{ model: User, required: true }],
    });

    const studentIds = students.map((s) => s.id);

    const isValid = attendances.every((a) => studentIds.includes(a.student_id));

    if (!isValid) {
      throw new Error("Ada student /siswa tidak valid");
    }

    const lastMeeting = await AttendanceSession.max("meeting_number", {
      where: { schedule_id },
    });

    const meetingNumber = lastMeeting ? lastMeeting + 1 : 1;

    const session = await AttendanceSession.create({
      schedule_id,
      meeting_number: meetingNumber,
      date: formatedDate,
      created_by: teacherId,
      is_teacher_present: true,
    });

    const details = [];

    const permissions = await StudentPermission.findAll({
      where: {
        student_id: { [Op.in]: attendances.map((a) => a.student_id) },
        status: "approved",
        start_date: { [Op.lte]: formatedDate },
        end_date: { [Op.gte]: formatedDate },
      },
      include: [{ model: PermissionType, attributes: ["name"] }],
    });

    for (const a of attendances) {
      // cek izin
      const permission = permissions.find((p) => p.student_id === a.student_id);

      let finalStatus = a.status;

      if (permission) {
        finalStatus =
          permission.PermissionType.name.toLowerCase() === "sakit"
            ? "sakit"
            : "izin";
        console.log(
          `[ATTENDANCE] Override student ${a.student_id} → ${finalStatus}`,
        );
      }

      details.push({
        attendance_session_id: session.id,
        student_id: a.student_id,
        status: finalStatus,
      });
    }

    await AttendanceDetail.bulkCreate(details);

    const scheduleDetail = await Schedule.findByPk(schedule_id, {
      include: [
        {
          model: TeachingAssignment,
          include: [
            { model: Class, attributes: ["name"] },
            { model: Subject, attributes: ["name"] },
          ],
        },
      ],
    });

    await NotificationService.notifyStudentsAfterAttendance({
      class_id: schedule.TeachingAssignment.class_id,
      subject_name: scheduleDetail.TeachingAssignment.Subject.name,
      class_name: scheduleDetail.TeachingAssignment.Class.name,
    });

    return session;
  }
}

export default AttendaceService;
