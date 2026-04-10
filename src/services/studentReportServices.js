import { col, fn, literal, Op } from "sequelize";
import db from "../models/index.js";
import User from "../models/userModel.js";

const {
  Student,
  Class,
  Schedule,
  Subject,
  AttendanceSession,
  AttendanceDetail,
} = db;

class StudentReportService {
  static async getReport({ class_id, schedule_id }) {
    console.log("\n=== [SERVICE] STUDENT ATTENDANCE REPORT ===");
    console.log("Class ID:", class_id);
    console.log("Schedule ID:", schedule_id);

    if (!schedule_id) {
      return await this.getReportByClass(class_id);
    } else {
      return await this.getReportBySchedule(class_id, schedule_id);
    }
  }

  static async getReportByClass(class_id) {
    console.log("\n[MODE] REPORT BY CLASS (PIVOT MAPEL)");

    const schedules = await Schedule.findAll({
      where: { class_id },
      include: [{ model: Subject, attributes: ["id", "name"] }],
    });

    const subjects = schedules.map((s) => ({
      schedule_id: s.id,
      subject_name: s.Subject.name,
    }));
    console.log("[DEBUG] Total schedules:", subjects.length);

    // ambil semua siswa
    const students = await Student.findAll({
      where: { class_id },
      attributes: ["id"],
      include: [{ model: User, attributes: ["name"] }],
    });
    console.log("[DEBUG] Total students:", students.length);

    const attendance = await AttendanceDetail.findAll({
      attributes: [
        "student_id",
        [col("AttendanceSession.schedule_id"), "schedule_id"],
        [fn("COUNT", col("AttendanceDetail.id")), "total_hadir"],
      ],
      include: [
        {
          model: AttendanceSession,
          attributes: [],
          where: {
            schedule_id: { [Op.in]: subjects.map((s) => s.schedule_id) },
          },
        },
      ],
      where: { status: "hadir" },
      group: ["student_id", "AttendanceSession.schedule_id"],
      raw: true,
    });

    console.log("[DEBUG] Raw attendance hadir:", attendance.length);

    // build pivot
    const result = students.map((student) => {
      const row = { student_id: student.id, name: student.User.name };

      subjects.forEach((subj) => {
        const found = attendance.find(
          (a) =>
            a.student_id === student.id && a.schedule_id === subj.schedule_id,
        );
        row[subj.subject_name] = found ? parseInt(found.total_hadir) : 0;
      });
      return row;
    });
    return { subjects: subjects.map((s) => s.subject_name), data: result };
  }

  static async getReportBySchedule(class_id, schedule_id) {
    console.log("\n[MODE] REPORT BY SCHEDULE (REKAP)");

    const schedule = await Schedule.findOne({
      where: { id: schedule_id, class_id },
      include: [
        { model: Subject, attributes: ["name"] },
        { model: User, as: "teacher", attributes: ["name"] },
      ],
    });

    if (!schedule) {
      throw new Error("Schedule tidak di temukan di kelas ini");
    }

    const students = await Student.findAll({
      where: { class_id },
      attributes: ["id"],
      include: [{ model: User, attributes: ["name"] }],
    });

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
          fn("SUM", literal(`CASE WHEN status = 'alpha' THEN 1 ELSE 0 END`)),
          "alpha",
        ],
      ],
      include: [
        { model: AttendanceSession, attributes: [], where: { schedule_id } },
      ],
      group: ["student_id"],
      raw: true,
    });
    console.log("[DEBUG] Rekap attendance:", attendance.length);

    const result = students.map((student) => {
      const found = attendance.find((a) => a.student_id === student.id);

      return {
        student_id: student.id,
        name: student.User.name,
        total: found ? parseInt(found.total) : 0,
        hadir: found ? parseInt(found.hadir) : 0,
        izin: found ? parseInt(found.izin) : 0,
        sakit: found ? parseInt(found.sakit) : 0,
        alpha: found ? parseInt(found.alpha) : 0,
      };
    });

    return {
      schedule_id,
      subject: schedule.Subject.name,
      teacher: schedule.teacher.name,
      data: result,
    };
  }
}

export default StudentReportService;
