import { Op, fn, col, literal } from "sequelize";
import db from "../../models/index.js";

const {
  Student,
  Schedule,
  Subject,
  Semester,
  AttendanceSession,
  AttendanceDetail,
} = db;

class StudentRecapService {
  static async getRecap({ user_id, semester_id }) {
    console.log("\n=== [SERVICE] STUDENT RECAP START ===");

    const student = await Student.findOne({ where: { user_id } });
    if (!student) {
      throw new Error("Student tidak di temukan");
    }
    console.log("[RECAP] Student ID:", student.id);

    const schedules = await Schedule.findAll({
      where: { class_id: student.class_id },
      include: [{ model: Subject, attributes: ["name"] }],
    });
    console.log("[RECAP] Total schedules:", schedules.length);

    if (!semester_id) {
      console.log("[MODE] DEFAULT (TAHUN AJARAN AKTIF)");
      return await this.getByAcademicYear(student, schedules);
    }

    console.log("[MODE] SEMESTER DETAIL");
    return await this.getBySemester(student, schedules, semester_id);
  }

  static async getByAcademicYear(student, schedules) {
    const today = new Date().toISOString().slice(0, 10);

    const semester = await Semester.findOne({
      where: { start_date: { [Op.lte]: today }, end_date: { [Op.gte]: today } },
    });
    if (!semester) {
      throw new Error("Semester aktif tidak ditemukan");
    }
    console.log("[RECAP] Academic Year:", semester.academic_year);

    const semesters = await Semester.findAll({
      where: { academic_year: semester.academic_year },
    });

    const sorted = semesters.sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date),
    );

    const start = sorted[0].start_date;
    const end = sorted[semesters.length - 1].end_date;

    console.log("[RECAP] Range:", start, "→", end);

    const attendance = await AttendanceDetail.findAll({
      attributes: [
        "student_id",
        [col("AttendanceSession.schedule_id"), "schedule_id"],
        [fn("COUNT", col("AttendanceDetail.id")), "total"],
        [
          fn("SUM", literal(`CASE WHEN status='hadir' THEN 1 ELSE 0 END`)),
          "hadir",
        ],
        [
          fn("SUM", literal(`CASE WHEN status='izin' THEN 1 ELSE 0 END`)),
          "izin",
        ],
        [
          fn("SUM", literal(`CASE WHEN status='sakit' THEN 1 ELSE 0 END`)),
          "sakit",
        ],
        [
          fn("SUM", literal(`CASE WHEN status='alpha' THEN 1 ELSE 0 END`)),
          "alpha",
        ],
      ],
      include: [
        {
          model: AttendanceSession,
          attributes: [],
          where: { date: { [Op.between]: [start, end] } },
        },
      ],
      where: { student_id: student.id },
      group: ["AttendanceSession.schedule_id"],
      raw: true,
    });

    console.log("[RECAP] Raw attendance:", attendance.length);

    const result = schedules.map((s) => {
      const found = attendance.find((a) => a.schedule_id === s.id);

      return {
        subject: s.Subject.name,
        total: found ? parseInt(found.total) : 0,
        hadir: found ? parseInt(found.hadir) : 0,
        izin: found ? parseInt(found.izin) : 0,
        sakit: found ? parseInt(found.sakit) : 0,
        alpha: found ? parseInt(found.alpha) : 0,
      };
    });

    return { mode: "summary", data: result };
  }

  static async getBySemester(student, schedules, semester_id) {
    const semester = await Semester.findByPk(semester_id);

    if (!semester) {
      throw new Error("Semester tidak di temukan");
    }
    console.log("[RECAP] Semester:", semester.name);

    const attendance = await AttendanceDetail.findAll({
      attributes: [
        "student_id",
        [col("AttendanceSession.schedule_id"), "schedule_id"],
        [col("AttendanceSession.meeting_number"), "meeting_number"],
        "status",
      ],
      include: [
        {
          model: AttendanceSession,
          attributes: [],
          where: {
            date: { [Op.between]: [semester.start_date, semester.end_date] },
          },
        },
      ],
      where: { student_id: student.id },
      raw: true,
    });
    console.log("[RECAP] Raw attendance:", attendance.length);

    const maxMeeting =
      Math.max(...attendance.map((a) => a.meeting_number), 0) || 0;

    console.log("[RECAP] Max meeting:", maxMeeting);

    const meetings = Array.from({ length: maxMeeting }, (_, i) => i + 1);

    const result = schedules.map((s) => {
      const pertemuan = [];
      let hadir = 0,
        izin = 0,
        sakit = 0,
        alpha = 0;

      for (let i = 1; i <= maxMeeting; i++) {
        const found = attendance.find(
          (a) => a.schedule_id === s.id && a.meeting_number === i,
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

      return { subject: s.Subject.name, pertemuan, hadir, izin, sakit, alpha };
    });

    return { mode: "detail", meetings, data: result };
  }

  static async getSemesterOptions() {
    console.log("\n=== [SERVICE] GET SEMESTER OPTIONS ===");

    const today = new Date().toISOString().slice(0.1);
    console.log("[SEMESTER] Today:", today);

    const activeSemester = await Semester.findOne({
      where: { start_date: { [Op.lte]: today }, end_date: { [Op.gte]: today } },
    });

    if (!activeSemester) {
      throw new Error("Tidak ada semester aktif");
    }
    console.log("[SEMESTER] Active:", activeSemester.name);

    const semesters = await Semester.findAll({
      where: { academic_year: activeSemester.academic_year },
      order: [["start_date", "ASC"]],
    });
    console.log("[SEMESTER] Total options:", semesters.length);

    const result = semesters.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
    }));

    return result;
  }
}

export default StudentRecapService;
