import { col, fn, literal, Op } from "sequelize";
import db from "../models/index.js";

const {
  Student,
  Class,
  Schedule,
  Subject,
  AttendanceSession,
  AttendanceDetail,
  TeachingAssignment,
  User,
  Semester,
} = db;

class StudentReportService {
  static async getReport({ semester_id, class_id, subject_id }) {
    console.log("\n=== [SERVICE] STUDENT REPORT START ===");
    console.log("[SERVICE] Input:", { class_id, subject_id });

    const semester = await Semester.findByPk(semester_id);
    if (!semester) {
      throw new Error("Semester tidak ditemukan");
    }

    const classData = await Class.findByPk(class_id, { attributes: ["name"] });

    if (!classData) {
      throw new Error("Kelas tidak ditemukan");
    }
    const class_name = classData.name;

    let result;

    if (!subject_id) {
      result = await this.getReportByClass(semester_id, class_id);
    } else {
      result = await this.getReportBySubject(semester_id, class_id, subject_id);
    }

    return {
      class_name,
      semester: semester.name,
      academic_year: semester.academic_year,
      ...result,
    };
  }

  // =========================================
  // 🔥 MODE 1: CLASS (GROUP BY SUBJECT)
  // =========================================
  static async getReportByClass(semester_id, class_id) {
    console.log("\n[MODE] CLASS REPORT (GROUPED SUBJECT)");

    const semester = await Semester.findByPk(semester_id);
    if (!semester) {
      throw new Error("Semester tidak ditemukan");
    }

    const schedules = await Schedule.findAll({
      include: [
        {
          model: db.TeachingAssignment,
          where: { class_id, semester_id },
          required: true,
          include: [{ model: db.Subject, attributes: ["id", "name"] }],
        },
      ],
    });

    console.log("[DEBUG] Total schedules:", schedules.length);

    // 🔥 GROUP SUBJECT
    const subjectMap = {};

    schedules.forEach((s) => {
      const subjectId = s.TeachingAssignment.subject_id;
      const subjectName = s.TeachingAssignment.Subject.name;

      if (!subjectMap[subjectId]) {
        subjectMap[subjectId] = {
          subject_id: subjectId,
          subject_name: subjectName,
          schedule_ids: [],
        };
      }

      subjectMap[subjectId].schedule_ids.push(s.id);
    });

    const subjects = Object.values(subjectMap);

    console.log("[DEBUG] Unique subjects:", subjects.length);

    // 🔥 ALL SCHEDULE IDS
    const allScheduleIds = subjects.flatMap((s) => s.schedule_ids);

    const attendance = await AttendanceDetail.findAll({
      attributes: [
        "student_id",
        [col("AttendanceSession.schedule_id"), "schedule_id"],
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
            schedule_id: {
              [Op.in]: allScheduleIds,
            },
            date: { [Op.between]: [semester.start_date, semester.end_date] },
          },
        },
      ],

      where: { status: "hadir" },

      group: [
        "student_id",
        "AttendanceSession.schedule_id",
        "Student.id",
        "Student->User.id",
      ],
      raw: false,
    });

    console.log("[DEBUG] Raw attendance:", attendance.length);

    const uniqueStudents = {};

    attendance.forEach((a) => {
      const studentId = a.student_id;

      if (!uniqueStudents[studentId]) {
        uniqueStudents[studentId] = {
          student_id: studentId,
          name: a.Student?.User?.name || "-",
        };
      }
    });

    const result = Object.values(uniqueStudents).map((student) => {
      const row = {
        student_id: student.student_id,
        name: student.name,
      };

      subjects.forEach((subj) => {
        const total = attendance
          .filter(
            (a) =>
              a.student_id === student.student_id &&
              subj.schedule_ids.includes(a.dataValues.schedule_id),
          )
          .reduce((sum, a) => sum + parseInt(a.dataValues.total_hadir), 0);

        row[subj.subject_name] = total;
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
  static async getReportBySubject(semester_id, class_id, subject_id) {
    console.log("\n[MODE] SUBJECT REPORT");

    const schedules = await Schedule.findAll({
      include: [
        {
          model: db.TeachingAssignment,
          where: { class_id, subject_id, semester_id },
          required: true,
          include: [
            { model: db.Subject, attributes: ["name"] },
            { model: db.User, as: "teacher", attributes: ["name"] },
          ],
        },
      ],
    });

    if (!schedules.length) {
      throw new Error("Subject tidak ditemukan di kelas ini");
    }

    const scheduleIds = schedules.map((s) => s.id);

    console.log("[DEBUG] Schedule count:", scheduleIds.length);

    const semester = await db.Semester.findByPk(semester_id);

    const attendance = await AttendanceDetail.findAll({
      attributes: [
        "student_id",
        [fn("COUNT", col("AttendanceDetail.id")), "total"],
        [
          fn("SUM", literal(`CASE WHEN status ='hadir' THEN 1 ELSE 0 END`)),
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
          model: Student,
          attributes: ["id"],
          include: [{ model: User, attributes: ["name"], required: true }],
        },
        {
          model: AttendanceSession,
          attributes: [],
          where: {
            schedule_id: { [Op.in]: scheduleIds },
            date: { [Op.between]: [semester.start_date, semester.end_date] },
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
      subject: schedules[0].TeachingAssignment.Subject.name,
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

  static async getSubjectsByClass(semester_id, class_id) {
    console.log("\n=== [SERVICE] GET SUBJECTS BY CLASS ===");
    console.log("[SERVICE] Class ID:", semester_id, class_id);

    const schedules = await Schedule.findAll({
      include: [
        {
          model: db.TeachingAssignment,
          where: { class_id, semester_id },
          required: true,
          include: [{ model: Subject, attributes: ["id", "name"] }],
        },
      ],
    });

    console.log("[DEBUG] Total schedules:", schedules.length);

    const map = {};

    schedules.forEach((s) => {
      const subjectId = s.TeachingAssignment.subject_id;
      const subjectName = s.TeachingAssignment.Subject.name;

      if (!map[subjectId]) {
        map[subjectId] = {
          subject_id: subjectId,
          subject_name: subjectName,
        };
      }
    });

    const subjects = Object.values(map);

    console.log("[DEBUG] Unique subjects:", subjects.length);
    console.log("[SERVICE] DONE");

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
