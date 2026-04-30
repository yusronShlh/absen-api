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
    console.log("\n[MODE] DETAIL TEACHER (SQL GROUP)");
    const teacher = await User.findByPk(teacher_id, {
      attributes: ["name"],
    });

    if (!teacher) {
      throw new Error("Guru tidak ditemukan");
    }

    const query = `
    SELECT 
      CONCAT(sub.name, ' (', c.name, ')') AS subject,
      
      COUNT(ses.id) AS total_pertemuan,

      SUM(
        CASE 
          WHEN tp.id IS NOT NULL THEN 0
          WHEN ses.is_teacher_present = 1 THEN 1
          ELSE 0
        END
      ) AS hadir,

      SUM(
        CASE 
          WHEN tp.id IS NOT NULL THEN 1
          ELSE 0
        END
      ) AS izin,

      SUM(
        CASE 
          WHEN tp.id IS NULL AND ses.is_teacher_present = 0 THEN 1
          ELSE 0
        END
      ) AS alpha

    FROM schedules sc

    LEFT JOIN subjects sub ON sc.subject_id = sub.id
    LEFT JOIN classes c ON sc.class_id = c.id
    LEFT JOIN attendance_sessions ses 
      ON ses.schedule_id = sc.id 
      AND ses.date BETWEEN :start AND :end

    LEFT JOIN teacher_permissions tp
      ON tp.teacher_id = sc.teacher_id
      AND tp.status = 'approved'
      AND ses.date BETWEEN tp.start_date AND tp.end_date

    WHERE sc.teacher_id = :teacher_id

    GROUP BY sc.subject_id, sc.class_id

    ORDER BY sub.name ASC, c.name ASC
  `;

    console.log("[DEBUG] Executing SQL...");

    const rows = await sequelize.query(query, {
      replacements: { start, end, teacher_id },
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("[DEBUG] Rows:", rows.length);

    // 🔥 FORMAT + TOTAL
    let no = 1;
    let grand = { total: 0, hadir: 0, izin: 0, alpha: 0 };

    const result = rows.map((r) => {
      const item = {
        no: no++,
        subject: r.subject,
        total_pertemuan: Number(r.total_pertemuan),
        hadir: Number(r.hadir),
        izin: Number(r.izin),
        alpha: Number(r.alpha),
      };

      grand.total += item.total_pertemuan;
      grand.hadir += item.hadir;
      grand.izin += item.izin;
      grand.alpha += item.alpha;

      console.log(
        `[DEBUG] ${item.subject} → total:${item.total_pertemuan}, hadir:${item.hadir}, izin:${item.izin}, alpha:${item.alpha}`,
      );

      return item;
    });

    result.push({
      no: null,
      subject: "TOTAL",
      total_pertemuan: grand.total,
      hadir: grand.hadir,
      izin: grand.izin,
      alpha: grand.alpha,
    });

    console.log("=== [SERVICE] DONE SQL REPORT ===");

    return { teacher_name: teacher.name, data: result };
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

  static async getReportForExport({ semester_id, teacher_id }) {
    const raw = await this.getReport({ semester_id, teacher_id });

    if (!teacher_id) {
      return {
        teacher_name: null,
        data: raw.map((item, index) => ({ no: index + 1, ...item })),
      };
    }

    return raw;
  }
}

export default TeacherReportService;
