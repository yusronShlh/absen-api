import { Op, fn, col, literal } from "sequelize";
import db from "../../models/index.js";
import {
  getCurrentWIBMonth,
  getCurrentWIBYear,
} from "../../utils/timeHelper.js";

const {
  Student,
  User,
  Subject,
  Semester,
  Schedule,
  AttendanceSession,
  AttendanceDetail,
  TeachingAssignment,
} = db;

class PrincipalStudentService {
  static async getStudentDetail({ student_id, semester_id, month, year }) {
    if (semester_id) {
      return await this.getBySemester({ student_id, semester_id });
    }

    if (month && year) {
      return await this.getByMonth({ student_id, month, year });
    }

    throw new Error("Semester atau bulan dan tahun wajib diisi");
  }

  static async getBySemester({ student_id, semester_id }) {
    console.log("\n=== [SERVICE] PRINCIPAL STUDENT RECAP (SEMESTER) ===");

    // ==========================
    // Student
    // ==========================
    const student = await Student.findByPk(student_id, {
      attributes: ["id", "class_id"],
      include: [
        {
          model: User,
          attributes: ["id", "name", "nisn"],
        },
        {
          model: db.Class,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!student) {
      throw new Error("Siswa tidak ditemukan");
    }

    // ==========================
    // Semester
    // ==========================
    const semester = await Semester.findByPk(semester_id);

    if (!semester) {
      throw new Error("Semester tidak ditemukan");
    }

    // ==========================
    // Ambil daftar mapel kelas siswa
    // ==========================
    const schedules = await Schedule.findAll({
      include: [
        {
          model: TeachingAssignment,
          where: {
            class_id: student.class_id,
          },
          include: [
            {
              model: Subject,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      raw: true,
    });

    const map = new Map();

    schedules.forEach((schedule) => {
      const subjectId = schedule["TeachingAssignment.subject_id"];

      if (!map.has(subjectId)) {
        map.set(subjectId, {
          subject_id: subjectId,
          subject: schedule["TeachingAssignment.Subject.name"],
          scheduleIds: [],
        });
      }

      map.get(subjectId).scheduleIds.push(schedule.id);
    });

    const subjects = Array.from(map.values());

    // ==========================
    // Rekap per mapel
    // ==========================
    const result = await Promise.all(
      subjects.map(async (subject) => {
        const attendances = await AttendanceDetail.findAll({
          attributes: ["status"],

          include: [
            {
              model: AttendanceSession,
              attributes: ["date", "meeting_number"],

              where: {
                schedule_id: {
                  [Op.in]: subject.scheduleIds,
                },

                date: {
                  [Op.between]: [semester.start_date, semester.end_date],
                },
              },
            },
          ],

          where: {
            student_id: student.id,
          },

          order: [[AttendanceSession, "meeting_number", "ASC"]],

          raw: true,
        });

        let hadir = 0;
        let izin = 0;
        let sakit = 0;
        let alpha = 0;

        const pertemuan = attendances.map((attendance) => {
          switch (attendance.status) {
            case "hadir":
              hadir++;
              break;

            case "izin":
              izin++;
              break;

            case "sakit":
              sakit++;
              break;

            case "alpha":
              alpha++;
              break;
          }

          return attendance.status;
        });

        return {
          subject: subject.subject,

          pertemuan,

          hadir,
          izin,
          sakit,
          alpha,
        };
      }),
    );

    const maxMeeting = Math.max(
      0,
      ...result.map((item) => item.pertemuan.length),
    );

    return {
      mode: "semester",

      student: {
        id: student.id,
        name: student.User.name,
        nisn: student.User.nisn,
        class: student.Class.name,
      },

      semester: {
        id: semester.id,
        name: semester.name,
        academic_year: semester.academic_year,
      },

      meetings: Array.from({ length: maxMeeting }, (_, index) => index + 1),

      data: result,
    };
  }

  static async getByMonth({ student_id, month, year }) {
    console.log("\n=== [SERVICE] PRINCIPAL STUDENT RECAP (MONTH) ===");

    // ==========================
    // Student
    // ==========================
    const student = await Student.findByPk(student_id, {
      attributes: ["id", "class_id"],
      include: [
        {
          model: User,
          attributes: ["id", "name", "nisn"],
        },
        {
          model: db.Class,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!student) {
      throw new Error("Siswa tidak ditemukan");
    }

    // ==========================
    // Range tanggal
    // ==========================
    const start = `${year}-${String(month).padStart(2, "0")}-01`;

    const end = new Date(year, month, 0).toISOString().split("T")[0];

    // ==========================
    // Ambil mapel kelas
    // ==========================
    const schedules = await Schedule.findAll({
      include: [
        {
          model: TeachingAssignment,
          where: {
            class_id: student.class_id,
          },
          include: [
            {
              model: Subject,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      raw: true,
    });

    const map = new Map();

    schedules.forEach((schedule) => {
      const subjectId = schedule["TeachingAssignment.subject_id"];

      if (!map.has(subjectId)) {
        map.set(subjectId, {
          subject_id: subjectId,
          subject: schedule["TeachingAssignment.Subject.name"],
          scheduleIds: [],
        });
      }

      map.get(subjectId).scheduleIds.push(schedule.id);
    });

    const subjects = Array.from(map.values());

    // ==========================
    // Rekap
    // ==========================
    const result = await Promise.all(
      subjects.map(async (subject) => {
        const attendances = await AttendanceDetail.findAll({
          attributes: ["status"],

          include: [
            {
              model: AttendanceSession,
              attributes: ["date"],

              where: {
                schedule_id: {
                  [Op.in]: subject.scheduleIds,
                },

                date: {
                  [Op.between]: [start, end],
                },
              },
            },
          ],

          where: {
            student_id: student.id,
          },

          order: [[AttendanceSession, "date", "ASC"]],

          raw: true,
        });

        let hadir = 0;
        let izin = 0;
        let sakit = 0;
        let alpha = 0;

        const pertemuan = attendances.map((attendance) => {
          switch (attendance.status) {
            case "hadir":
              hadir++;
              break;

            case "izin":
              izin++;
              break;

            case "sakit":
              sakit++;
              break;

            case "alpha":
              alpha++;
              break;
          }

          return attendance.status;
        });

        return {
          subject: subject.subject,

          pertemuan,

          hadir,
          izin,
          sakit,
          alpha,
        };
      }),
    );

    const maxMeeting = Math.max(
      0,
      ...result.map((item) => item.pertemuan.length),
    );

    return {
      mode: "month",

      student: {
        id: student.id,
        name: student.User.name,
        nisn: student.User.nisn,
        class: student.Class.name,
      },

      period: {
        month: Number(month),
        year: Number(year),
      },

      meetings: Array.from({ length: maxMeeting }, (_, index) => index + 1),

      data: result,
    };
  }

  static async getSemesters() {
    const today = new Date().toISOString().slice(0, 10);

    const activeSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
      },
    });

    if (!activeSemester) {
      throw new Error("Tidak ada semester aktif");
    }

    const semesters = await Semester.findAll({
      where: {
        academic_year: activeSemester.academic_year,
      },
      order: [["start_date", "ASC"]],
    });

    return semesters.map((semester) => ({
      id: semester.id,
      name: semester.name,
      type: semester.type,
    }));
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
}

export default PrincipalStudentService;
