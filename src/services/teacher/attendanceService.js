import db from "../../models/index.js";
import lessonTime from "../../models/lessonTimeModel.js";

const {
  Schedule,
  Class,
  Subject,
  LessonTime,
  Student,
  User,
  AttendanceSession,
  AttendanceDetail,
} = db;

class AttendaceService {
  static async getTodaySchedules(teacherId) {
    const today = new Date()
      .toLocaleDateString("id-ID", { weekday: "long" })
      .toLowerCase();

    const schedules = await Schedule.findAll({
      where: { teacher_id: teacherId, day: today },
      include: [
        { model: Class, attributes: ["id", "name"] },
        { model: Subject, attributes: ["id", "name"] },
        { model: lessonTime, attributes: ["id", "start_time", "end_time"] },
      ],
      order: [[LessonTime, "order", "ASC"]],
    });
    return schedules;
  }

  static async getStudentBySchedule(scheduleId, teacherId) {
    const schedule = await Schedule.findOne({
      where: { id: scheduleId, teacher_id: teacherId },
      include: [
        { model: Class, attributes: ["id", "name"] },
        { model: Subject, attributes: ["id", "name"] },
        { model: LessonTime, attributes: ["start_time", "end_time"] },
      ],
    });

    if (!schedule) {
      throw new Error("Jadwal tidak di temukan");
    }

    const students = await Student.findAll({
      where: { class_id: schedule.class_id },
      include: [{ model: User, attributes: ["id", "name"] }],
      attributes: ["id"],
    });

    return { schedule, students };
  }

  static async submitAttendance(teacherId, body) {
    const { schedule_id, date, attendaces } = body;

    const schedule = await Schedule.findOne({
      where: { id: schedule_id, teacher_id: teacherId },
      include: [{ model: LessonTime }],
    });

    if (!schedule) {
      throw new Error("Jadwal tidak di temukan");
    }
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const start = schedule.LessonTime.start_time.slice(0, 5);
    const end = schedule.LessonTime.end_time.slice(0, 5);

    if (!(currentTime >= start && currentTime <= end)) {
      throw new Error(
        "Absen hanya boleh di lakukan saat jam pelajaran berlangsung",
      );
    }

    const existing = await AttendanceSession.findOne({
      where: { schedule_id, date },
    });

    if (existing) {
      throw new Error("Attendance already submitted");
    }

    const lastMeeting = await AttendanceSession.max("meeting_number", {
      where: { schedule_id },
    });

    const meetingNumber = lastMeeting ? lastMeeting + 1 : 1;

    const session = await AttendanceSession.create({
      schedule_id,
      meeting_number: meetingNumber,
      date,
      created_by: teacherId,
    });

    const details = attendaces.map((a) => ({
      attendace_session_id: session.id,
      student_id: a.student_id,
      status: a.status,
    }));

    await AttendanceDetail.bulkCreate(details);

    return session;
  }
}

export default AttendaceService;
