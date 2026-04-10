import { Op } from "sequelize";
import db from "../../models/index.js";

const {
  Schedule,
  Subject,
  Class,
  Student,
  Semester,
  AttendanceSession,
  AttendanceDetail,
} = db;

class TeacherRecapService {
  static async getList(teacher_id) {
    console.log("\n=== [SERVICE] TEACHER RECAP LIST ===");

    const schedules = await Schedule.findAll({
      where: { teacher_id },
      include: [
        { model: Subject, attributes: ["name"] },
        { model: Class, attributes: ["name"] },
      ],
    });
    console.log("[LIST] Total schedules:", schedules.length);

    const result = schedules.map((s) => ({
      schedule_id: s.id,
      subject: s.Subject.name,
      class: s.Class.name,
    }));

    return result;
  }

  static async getDetail({ teacher_id, schedule_id, semester_id }) {
    console.log("\n=== [SERVICE] TEACHER RECAP DETAIL ===");

    if (!semester_id) {
      throw new Error("Semester wajib di pilih");
    }

    const schedule = await Schedule.findOne({
      where: { id: schedule_id, teacher_id },
      include: [
        { model: Subject, attributes: ["name"] },
        { model: Class, attributes: ["name"] },
      ],
    });

    if (!schedule) {
      throw new Error("Jadwal tidak di temukan/ bukan milik guru");
    }
    console.log("[DETAIL] Schedule:", schedule.id);

    const students = await Student.findAll({
      where: { class_id: schedule.class_id },
      include: [{ model: db.User, attributes: ["name"] }],
    });
    console.log("[DETAIL] Total students:", students.length);

    const semester = await Semester.findByPk(semester_id);
    if (!semester) {
      throw new Error("Semester tidak ditemukan");
    }
    console.log("[DETAIL] Semester:", semester.name);

    const attendance = await AttendanceDetail.findAll({
      attributes: ["student_id", "status"],
      include: [
        {
          model: AttendanceSession,
          attributes: ["meeting_number", "schedule_id"],
          where: {
            schedule_id,
            date: { [Op.between]: [semester.start_date, semester.end_date] },
          },
        },
      ],
      raw: true,
    });
    console.log("[DETAIL] Raw attendance:", attendance.length);

    const maxMeeting =
      Math.max(
        ...attendance.map((a) => a["AttendanceSession.meeting_number"]),
        0,
      ) || 0;
    console.log("[DETAIL] Max meeting:", maxMeeting);

    const meetings = Array.from({ length: maxMeeting }, (_, i) => i + 1);

    const result = students.map((student) => {
      const pertemuan = [];
      let hadir = 0,
        izin = 0,
        sakit = 0,
        alpha = 0;

      for (let i = 1; i <= maxMeeting; i++) {
        const found = attendance.find(
          (a) =>
            a.student_id === student.id &&
            a["AttendanceSession.meeting_number"] === i,
        );

        if (found) {
          pertemuan.push(found.status);

          if (found.status === "hadir") hadir++;
          if (found.status === "izin") izin++;
          if (found.status === "sakit") sakit++;
          if (found.status === "alpha") alpha++;
        } else {
          pertemuan.push("-");
        }
      }

      return {
        student_name: student.User.name,
        pertemuan,
        hadir,
        izin,
        sakit,
        alpha,
      };
    });

    return {
      subject: schedule.Subject.name,
      class: schedule.Class.name,
      meetings,
      data: result,
    };
  }

  static async getSemesters() {
    console.log("\n=== [SERVICE] TEACHER SEMESTER DROPDOWN ===");

    const today = new Date().toISOString().slice(0, 10);

    const activeSemester = await Semester.findOne({
      where: { start_date: { [Op.lte]: today }, end_date: { [Op.gte]: today } },
    });

    if (!activeSemester) {
      throw new Error("Semester aktif tidak di temukan");
    }
    console.log("[SEMESTER] Active:", activeSemester.name);

    const semesters = await Semester.findAll({
      where: { academic_year: activeSemester.academic_year },
      order: [["start_date", "ASC"]],
    });
    console.log("[SEMESTER] Total:", semesters.length);

    const result = semesters.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      academic_year: s.academic_year,
    }));

    return result;
  }
}

export default TeacherRecapService;
