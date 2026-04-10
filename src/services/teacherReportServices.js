import { Op } from "sequelize";
import db from "../models/index.js";

const {
  Semester,
  Schedule,
  Subject,
  Class,
  User,
  AttendanceSession,
  TeacherPermission,
  sequelize,
} = db;

class TeacherReportService {
  static async getReport({ semester_id, teacher_id }) {
    console.log("\n=== [SERVICE] TEACHER REPORT START ===");

    const semester = await Semester.findByPk(semester_id);
    if (!semester) {
      throw new Error("Semester tidak di temukan");
    }

    const start = semester.start_date;
    const end = semester.end_date;

    console.log("[DEBUG] Semester Range:", start, "→", end);

    if (!teacher_id) {
      return await this.getAllTeachers(start, end);
    } else {
      return await this.getDetailTeacher(start, end, teacher_id);
    }
  }

  static async getAllTeachers(start, end) {
    console.log("\n[MODE] ALL TEACHERS");

    const teachers = await User.findAll({
      where: { role: "guru" },
      attributes: ["id", "name"],
    });

    console.log("[DEBUG] Total teachers:", teachers.length);

    const schedules = await Schedule.findAll();
    const sessions = await AttendanceSession.findAll({
      where: { date: { [Op.between]: [start, end] } },
    });

    const permissions = await TeacherPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: end },
        end_date: { [Op.gte]: start },
      },
    });

    console.log("[DEBUG] Sessions:", sessions.length);
    console.log("[DEBUG] Permissions:", permissions.length);

    const result = teachers.map((teacher) => {
      let total = 0;
      let hadir = 0;
      let izin = 0;
      let alpha = 0;

      const teacherSchedules = schedules.filter(
        (s) => s.teacher_id === teacher.id,
      );

      teacherSchedules.forEach((schedule) => {
        const scheduleSessions = sessions.filter(
          (sess) => sess.schedule_id === schedule.id,
        );

        scheduleSessions.forEach((sess) => {
          total++;

          const hasPermission = permissions.find(
            (p) =>
              p.teacher_id === teacher.id &&
              sess.date >= p.start_date &&
              sess.date <= p.end_date,
          );

          if (hasPermission) {
            izin++;
          } else if (sess.is_teacher_present) {
            hadir++;
          } else {
            alpha++;
          }
        });
      });
      console.log(
        `[DEBUG] Teacher ${teacher.name} → total:${total}, hadir:${hadir}, izin:${izin}, alpha:${alpha}`,
      );

      return {
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        total_pertemuan: total,
        hadir,
        izin,
        alpha,
      };
    });

    return result;
  }

  static async getDetailTeacher(start, end, teacher_id) {
    console.log("\n[MODE] DETAIL TEACHER");

    const schedules = await Schedule.findAll({
      where: { teacher_id },
      include: [
        { model: Subject, attributes: ["name"] },
        { model: Class, attributes: ["name"] },
      ],
    });
    console.log("[DEBUG] Total schedules:", schedules.length);

    const sessions = await AttendanceSession.findAll({
      where: { date: { [Op.between]: [start, end] } },
    });

    const permissions = await TeacherPermission.findAll({
      where: {
        teacher_id,
        status: "approved",
        start_date: { [Op.lte]: end },
        end_date: { [Op.gte]: start },
      },
    });
    console.log("[DEBUG] Sessions:", sessions.length);
    console.log("[DEBUG] Permissions:", permissions.length);

    let grandTotal = { total: 0, hadir: 0, izin: 0, alpha: 0 };

    const result = schedules.map((schedule, index) => {
      let total = 0;
      let hadir = 0;
      let izin = 0;
      let alpha = 0;

      const scheduleSessions = sessions.filter(
        (s) => s.schedule_id === schedule.id,
      );

      scheduleSessions.forEach((sess) => {
        total++;

        const hasPermission = permissions.find(
          (p) => sess.date >= p.start_date && sess.date <= p.end_date,
        );

        if (hasPermission) {
          izin++;
        } else if (sess.is_teacher_present) {
          hadir++;
        } else {
          alpha++;
        }
      });

      grandTotal.total += total;
      grandTotal.hadir += hadir;
      grandTotal.izin += izin;
      grandTotal.alpha += alpha;

      const subjectName = `${schedule.Subject.name} (${schedule.Class.name})`;

      console.log(
        `[DEBUG] ${subjectName} → total:${total}, hadir:${hadir}, izin:${izin}, alpha:${alpha}`,
      );

      return {
        no: index + 1,
        subject: subjectName,
        total_pertemuan: total,
        hadir,
        izin,
        alpha,
      };
    });

    result.push({
      no: null,
      subject: "TOTAL",
      total_pertemuan: grandTotal.total,
      hadir: grandTotal.hadir,
      izin: grandTotal.izin,
      alpha: grandTotal.alpha,
    });

    return result;
  }

  static async getAll() {
    console.log("\n=== [SERVICE] GET SEMESTERS ===");

    const semesters = await sequelize.query(
      `SELECT id,name,start_date,end_date FROM semesters ORDER BY start_date DESC`,
      { type: sequelize.QueryTypes.SELECT },
    );
    console.log("[DEBUG] Total semesters:", semesters.length);

    return semesters;
  }

  static async getBySemesters(semester_id) {
    console.log("\n=== [SERVICE] GET TEACHERS BY SEMESTER ===");
    console.log("Semester ID:", semester_id);

    const semester = await sequelize.query(
      `SELECT id,start_date,end_date FROM semesters WHERE id= :semester_id`,
      { replacements: { semester_id }, type: sequelize.QueryTypes.SELECT },
    );
    if (!semester.length) {
      throw new Error("Semester tidak di temukan");
    }

    const { start_date, end_date } = semester[0];
    console.log("[DEBUG] Range:", start_date, "→", end_date);

    const teachers = await sequelize.query(
      `SELECT DISTINCT u.id, u.name
      FROM attendance_sessions s
      JOIN schedules sc ON s.schedule_id = sc.id
      JOIN users u ON sc.teacher_id = u.id
      WHERE s.date BETWEEN :start_date AND :end_date
      ORDER BY u.name ASC`,
      {
        replacements: { start_date, end_date },
        type: sequelize.QueryTypes.SELECT,
      },
    );
    console.log("[DEBUG] Total teachers:", teachers.length);

    return teachers;
  }
}

export default TeacherReportService;
