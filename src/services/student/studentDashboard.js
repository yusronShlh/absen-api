import db from "../../models/index.js";
import {
  getWIBDateString,
  getWIBDayName,
  getWIBTimeString,
} from "../../utils/timeHelper.js";

const {
  Student,
  User,
  Schedule,
  Subject,
  LessonTime,
  AttendanceSession,
  AttendanceDetail,
} = db;

class StudentDashboardService {
  static async getDashboard(userId) {
    const student = await Student.findOne({
      where: { user_id: userId },
      include: [{ model: User, attributes: ["name"] }],
    });

    if (!student) {
      throw new Error("Student tidak di temukan");
    }

    console.log("[DEBUG] Student:", student.id);

    const class_id = student.class_id;
    const today = getWIBDayName();
    const todayDate = getWIBDateString();
    const currentTime = getWIBTimeString();

    console.log("[DEBUG] Today:", today, todayDate, currentTime);

    const schedules = await Schedule.findAll({
      where: { class_id, day: today },
      include: [
        { model: Subject, attributes: ["name"] },
        { model: LessonTime, attributes: ["start_time", "end_time", "name"] },
        { model: User, as: "teacher", attributes: ["name"] },
      ],
      order: [[LessonTime, "order", "ASC"]],
    });

    console.log("[DEBUG] Total schedules:", schedules.length);

    const sessions = await AttendanceSession.findAll({
      where: { date: todayDate },
    });
    console.log("[DEBUG] Sessions today:", sessions.length);

    const details = await AttendanceDetail.findAll({
      where: { student_id: student.id },
    });
    console.log("[DEBUG] Details found:", details.length);

    const result = schedules.map((s, index) => {
      const session = sessions.find((sess) => sess.schedule_id === s.id);

      const start = s.LessonTime.start_time?.slice(0, 5);
      const end = s.LessonTime.end_time?.slice(0, 5);

      let status = "-";

      if (!s.Subject) {
        return {
          no: index + 1,
          subject: "istirahat",
          teacher: "-",
          status: "-",
        };
      }

      if (session) {
        const detail = details.find(
          (d) =>
            d.attendance_session_id === session.id &&
            d.student_id === student.id,
        );

        status = detail ? detail.status : "alpha";
      } else {
        if (currentTime < start) {
          status = "belum mulai";
        } else if (currentTime >= start && currentTime <= end) {
          status = "berlangsung";
        } else {
          status = "alpha";
        }
      }
      console.log(`[DEBUG] Schedule ${s.id} → ${s.Subject.name} → ${status}`);

      return {
        no: index + 1,
        subject: s.Subject.name,
        teacher: s.teacher?.name || "-",
        status,
      };
    });

    return { student_name: student.User.name, today, data: result };
  }
}

export default StudentDashboardService;
