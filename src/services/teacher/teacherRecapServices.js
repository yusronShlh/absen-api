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
  User,
} = db;

class TeacherRecapService {
  static async getList(teacher_id) {
    console.log("\n=== [SERVICE] TEACHER RECAP LIST ===");

    const schedules = await Schedule.findAll({
      where: { teacher_id },
      include: [
        { model: Subject, attributes: ["id", "name"] },
        { model: Class, attributes: ["id", "name"] },
      ],
      raw: true,
    });
    console.log("[LIST] Raw schedules:", schedules.length);

    const map = new Map();
    schedules.forEach((s) => {
      const key = `${s.subject_id}-${s.class_id}`;

      if (!map.has(key)) {
        map.set(key, {
          subject_id: s.subject_id,
          class_id: s.class_id,
          subject: s["Subject.name"],
          class: s["Class.name"],
        });
      }
    });
    const result = Array.from(map.values());

    return result;
  }

  static async getDetail({ teacher_id, subject_id, class_id, semester_id }) {
    console.log("\n=== [SERVICE] TEACHER RECAP DETAIL ===");

    if (!semester_id) {
      throw new Error("Semester wajib di pilih");
    }

    const schedules = await Schedule.findAll({
      where: { teacher_id, subject_id, class_id },
    });

    if (!schedules.length) {
      throw new Error("Data jadwal tidak ditemukan");
    }
    console.log("[DETAIL] Total Schedules:", schedules.id);

    const scheduleIds = schedules.map((s) => s.id);

    const subject = await Subject.findByPk(subject_id);
    const kelas = await Class.findByPk(class_id);

    const students = await Student.findAll({
      where: { class_id },
      include: [{ model: User, attributes: ["name"], required: true }],
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
          attributes: ["date", "schedule_id"],
          where: {
            schedule_id: { [Op.in]: scheduleIds },
            date: { [Op.between]: [semester.start_date, semester.end_date] },
          },
        },
      ],
      raw: true,
    });
    console.log("[DETAIL] Raw attendance:", attendance.length);

    const uniqueDates = [
      ...new Set(attendance.map((a) => a["AttendanceSession.date"])),
    ].sort((a, b) => new Date(a) - new Date(b));
    console.log("[DETAIL] Total meetings:", uniqueDates.length);

    const result = students.map((student) => {
      const pertemuan = [];
      let hadir = 0,
        izin = 0,
        sakit = 0,
        alpha = 0;

      uniqueDates.forEach((date) => {
        const found = attendance.find(
          (a) =>
            a.student_id === student.id && a["AttendanceSession.date"] === date,
        );

        if (found) {
          pertemuan.push(found.status);

          if (found.status == "hadir") hadir++;
          if (found.status == "izin") izin++;
          if (found.status == "sakit") sakit++;
          if (found.status == "alpha") alpha++;
        } else {
          pertemuan.push("-");
        }
      });

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
      subject: subject.name,
      class: kelas.name,
      meetings: uniqueDates.map((_, i) => i + 1),
      // dates:uniqueDates,
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
