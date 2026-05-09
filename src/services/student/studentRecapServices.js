import { Op, fn, col, literal } from "sequelize";
import db from "../../models/index.js";

const {
  Student,
  Schedule,
  Subject,
  Semester,
  AttendanceSession,
  AttendanceDetail,
  TeachingAssignment,
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
      include: [
        {
          model: db.TeachingAssignment,
          where: { class_id: student.class_id },
          include: [{ model: Subject, attributes: ["id", "name"] }],
        },
      ],
      raw: true,
    });
    const map = new Map();

    schedules.forEach((s) => {
      const key = s["TeachingAssignment.subject_id"];

      if (!map.has(key)) {
        map.set(key, {
          subject_id: s["TeachingAssignment.subject_id"],
          subject: s["TeachingAssignment.Subject.name"],
          scheduleIds: [],
        });
      }

      map.get(key).scheduleIds.push(s.id);
    });

    const subjects = Array.from(map.values());
    // console.log("[RECAP] Total schedules:", schedules.length);

    if (!semester_id) {
      console.log("[MODE] DEFAULT (TAHUN AJARAN AKTIF)");
      return await this.getByAcademicYear(student, subjects);
    }

    console.log("[MODE] SEMESTER DETAIL");
    return await this.getBySemester(student, subjects, semester_id);
  }

  static async getByAcademicYear(student, subjects) {
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
    const end = sorted[sorted.length - 1].end_date;

    console.log("[RECAP] Range:", start, "→", end);

    const result = await Promise.all(
      subjects.map(async (sub) => {
        const attendance = await AttendanceDetail.findAll({
          attributes: [
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
              where: {
                schedule_id: { [Op.in]: sub.scheduleIds },
                date: { [Op.between]: [start, end] },
              },
            },
          ],
          where: { student_id: student.id },
          raw: true,
        });

        const data = attendance[0] || {};

        return {
          subject: sub.subject,
          total: parseInt(data.total || 0),
          hadir: parseInt(data.hadir || 0),
          izin: parseInt(data.izin || 0),
          sakit: parseInt(data.sakit || 0),
          alpha: parseInt(data.alpha || 0),
        };
      }),
    );
    return { mode: "summary", data: result };
  }

  static async getBySemester(student, subjects, semester_id) {
    const semester = await Semester.findByPk(semester_id);

    if (!semester) {
      throw new Error("Semester tidak di temukan");
    }
    console.log("[RECAP] Semester:", semester.name);

    const result = await Promise.all(
      subjects.map(async (sub) => {
        const attendance = await AttendanceDetail.findAll({
          attributes: ["student_id", "status"],
          include: [
            {
              model: AttendanceSession,
              attributes: ["date"],
              where: {
                schedule_id: { [Op.in]: sub.scheduleIds },
                date: {
                  [Op.between]: [semester.start_date, semester.end_date],
                },
              },
            },
          ],
          where: { student_id: student.id },
          raw: true,
        });

        const uniqueDates = [
          ...new Set(attendance.map((a) => a["AttendanceSession.date"])),
        ].sort((a, b) => new Date(a) - new Date(b));

        let hadir = 0,
          izin = 0,
          sakit = 0,
          alpha = 0;

        const pertemuan = uniqueDates.map((date) => {
          const found = attendance.find(
            (a) => a["AttendanceSession.date"] === date,
          );

          if (!found) return "-";

          if (found.status === "hadir") hadir++;
          if (found.status === "izin") izin++;
          if (found.status === "sakit") sakit++;
          if (found.status === "alpha") alpha++;

          return found.status;
        });

        return { subject: sub.subject, pertemuan, hadir, izin, sakit, alpha };
      }),
    );

    return {
      mode: "detail",
      meetings: result[0]?.pertemuan.map((_, i) => i + 1) || [],
      data: result,
    };
  }

  static async getSemesterOptions() {
    console.log("\n=== [SERVICE] GET SEMESTER OPTIONS ===");

    const today = new Date().toISOString().slice(0, 10);
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
