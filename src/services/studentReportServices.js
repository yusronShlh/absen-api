import { col, fn, literal, Op } from "sequelize";
import db from "../models/index.js";
import { getCurrentWIBMonth, getCurrentWIBYear } from "../utils/timeHelper.js";

const {
  Student,
  Class,
  Subject,
  AttendanceSession,
  AttendanceDetail,
  TeachingAssignment,
  User,
  Semester,
} = db;

class StudentReportService {
  static async getReport({ semester_id, month, year, class_id, subject_id }) {
    console.log("\n=== [SERVICE] STUDENT REPORT START ===");
    console.log("[SERVICE] Input:", { class_id, subject_id });

    let start;
    let end;
    let semesterName = null;
    let academicYear = null;

    if (semester_id) {
      const semester = await Semester.findByPk(semester_id);

      if (!semester) {
        throw new Error("Semester tidak ditemukan");
      }
      start = semester.start_date;
      end = semester.end_date;
      semesterName = semester.name;
      academicYear = semester.academic_year;
    } else if (month && year) {
      start = `${year}-${String(month).padStart(2, "0")}-01`;

      end = new Date(year, month, 0).toISOString().split("T")[0];
    } else {
      throw new Error("Semester atau bulan dan tahun wajib di isi");
    }
    const classData = await Class.findByPk(class_id);
    if (!classData) {
      throw new Error("Kelas tidak ditemukan");
    }

    let result;

    if (!subject_id) {
      result = await this.getReportByClass(start, end, class_id);
    } else {
      result = await this.getReportBySubject(start, end, class_id, subject_id);
    }

    return {
      class_name: classData.name,
      semester: semesterName,
      academic_year: academicYear,
      month,
      year,
      ...result,
    };
  }

  // =========================================
  // MODE CLASS
  // =========================================
  static async getReportByClass(start, end, class_id) {
    console.log("\n[MODE] CLASS REPORT (GROUPED SUBJECT)");

    // ==========================
    // Ambil mapel yang benar-benar
    // memiliki absensi pada semester ini
    // ==========================
    const sessions = await AttendanceSession.findAll({
      attributes: ["subject_id"],

      where: {
        class_id,

        date: {
          [Op.between]: [start, end],
        },
      },

      include: [
        {
          model: Subject,
          attributes: ["id", "name"],
        },
      ],
    });

    const subjectMap = {};

    sessions.forEach((session) => {
      if (!subjectMap[session.subject_id]) {
        subjectMap[session.subject_id] = {
          subject_id: session.subject_id,
          subject_name: session.Subject.name,
        };
      }
    });

    const subjects = Object.values(subjectMap);

    console.log("[DEBUG] Unique subjects:", subjects.length);

    // ==========================
    // Rekap hadir per siswa-mapel
    // ==========================
    const attendance = await AttendanceDetail.findAll({
      attributes: [
        "student_id",

        [col("AttendanceSession.subject_id"), "subject_id"],

        [fn("COUNT", col("AttendanceDetail.id")), "total_hadir"],
      ],

      include: [
        {
          model: Student,
          attributes: ["id"],

          include: [
            {
              model: User,
              attributes: ["name"],
              required: true,
            },
          ],
        },

        {
          model: AttendanceSession,
          attributes: [],

          where: {
            class_id,

            date: {
              [Op.between]: [start, end],
            },
          },
        },
      ],

      where: {
        status: "hadir",
      },

      group: [
        "student_id",
        "AttendanceSession.subject_id",
        "Student.id",
        "Student->User.id",
      ],

      raw: false,
    });

    console.log("[DEBUG] Raw attendance:", attendance.length);

    const studentMap = {};
    const attendanceMap = {};

    attendance.forEach((row) => {
      const studentId = row.student_id;
      const subjectId = row.dataValues.subject_id;

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student_id: studentId,
          name: row.Student?.User?.name || "-",
        };
      }

      attendanceMap[`${studentId}_${subjectId}`] = parseInt(
        row.dataValues.total_hadir || 0,
      );
    });

    const result = Object.values(studentMap).map((student) => {
      const row = {
        student_id: student.student_id,
        name: student.name,
      };

      subjects.forEach((subject) => {
        row[subject.subject_name] =
          attendanceMap[`${student.student_id}_${subject.subject_id}`] || 0;
      });

      return row;
    });

    console.log("[SERVICE] CLASS REPORT DONE");

    return {
      subjects: subjects.map((s) => s.subject_name),
      data: result,
    };
  }

  // =========================================
  // 🔥 MODE 2: SUBJECT (DETAIL)
  // =========================================
  static async getReportBySubject(start, end, class_id, subject_id) {
    console.log("\n[MODE] SUBJECT REPORT");

    const subject = await Subject.findByPk(subject_id, {
      attributes: ["id", "name"],
    });

    if (!subject) {
      throw new Error("Mata pelajaran tidak ditemukan");
    }

    const attendance = await AttendanceDetail.findAll({
      attributes: [
        "student_id",

        [fn("COUNT", col("AttendanceDetail.id")), "total"],

        [
          fn("SUM", literal("CASE WHEN status='hadir' THEN 1 ELSE 0 END")),
          "hadir",
        ],

        [
          fn("SUM", literal("CASE WHEN status='izin' THEN 1 ELSE 0 END")),
          "izin",
        ],

        [
          fn("SUM", literal("CASE WHEN status='sakit' THEN 1 ELSE 0 END")),
          "sakit",
        ],

        [
          fn("SUM", literal("CASE WHEN status='alpha' THEN 1 ELSE 0 END")),
          "alpha",
        ],
      ],

      include: [
        {
          model: Student,
          attributes: ["id"],

          include: [
            {
              model: User,
              attributes: ["name"],
              required: true,
            },
          ],
        },

        {
          model: AttendanceSession,
          attributes: [],

          where: {
            class_id,
            subject_id,

            date: {
              [Op.between]: [start, end],
            },
          },
        },
      ],

      group: ["student_id", "Student.id", "Student->User.id"],

      raw: false,
    });

    console.log("[DEBUG] Attendance rows:", attendance.length);

    const result = attendance.map((a) => {
      return {
        student_id: a.student_id,
        name: a.Student?.User?.name || "-",
        total: parseInt(a.dataValues.total || 0),
        hadir: parseInt(a.dataValues.hadir || 0),
        izin: parseInt(a.dataValues.izin || 0),
        sakit: parseInt(a.dataValues.sakit || 0),
        alpha: parseInt(a.dataValues.alpha || 0),
      };
    });

    console.log("[SERVICE] SUBJECT REPORT DONE");

    return {
      subject_id,
      subject: subject.name,
      data: result,
    };
  }

  static async getClass() {
    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return classes;
  }

  static async getPeriods() {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const currentYear = getCurrentWIBYear();
    const currentMonth = getCurrentWIBMonth();

    const data = [];

    for (let i = 1; i <= currentMonth; i++) {
      data.push({
        month: i,
        year: currentYear,
        label: `${months[i - 1]} ${currentYear}`,
      });
    }

    return data;
  }

  static async getSubjectsByClass({ semester_id, month, year, class_id }) {
    console.log("\n=== [SERVICE] GET SUBJECTS BY CLASS ===");

    let start;
    let end;

    if (semester_id) {
      const semester = await Semester.findByPk(semester_id);

      if (!semester) {
        throw new Error("Semester tidak ditemukan");
      }

      start = semester.start_date;
      end = semester.end_date;
    } else if (month && year) {
      start = `${year}-${String(month).padStart(2, "0")}-01`;

      end = new Date(year, month, 0).toISOString().split("T")[0];
    } else {
      throw new Error("Semester atau bulan dan tahun wajib di isi");
    }

    const sessions = await AttendanceSession.findAll({
      attributes: ["subject_id"],

      where: {
        class_id,
        date: {
          [Op.between]: [start, end],
        },
      },

      include: [
        {
          model: Subject,
          attributes: ["id", "name"],
        },
      ],
    });

    const subjectMap = {};

    sessions.forEach((session) => {
      if (session.subject_id && !subjectMap[session.subject_id]) {
        subjectMap[session.subject_id] = {
          subject_id: session.subject_id,
          subject_name: session.Subject.name,
        };
      }
    });

    const subjects = Object.values(subjectMap);

    console.log("[DEBUG] Unique subjects:", subjects.length);

    return subjects;
  }

  static async getSemesters() {
    const semesters = await db.Semester.findAll({
      attributes: ["id", "name"],
      order: [["start_date", "DESC"]],
    });

    return semesters;
  }
}

export default StudentReportService;
