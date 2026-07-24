import db from "../../models/index.js";
import {
  getCurrentWIBMonth,
  getCurrentWIBYear,
} from "../../utils/timeHelper.js";

const { User, sequelize } = db;

class PrincipalTeacherService {
  static async getTeachers() {
    const teachers = await User.findAll({
      where: { role: "guru" },
      attributes: ["id", "name", "nip"],
      order: [["name", "ASC"]],
    });

    return teachers;
  }

  static async getTeacherDetail({ teacher_id, month, year }) {
    if (!month || !year) {
      throw new Error("Bulan dan tahub wajib diisi");
    }

    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = new Date(year, month, 0).toISOString().split("T")[0];

    const teacher = await User.findByPk(teacher_id, {
      where: { id: teacher_id, role: "guru" },
      attributes: ["id", "name", "nip"],
    });

    if (!teacher) {
      throw new Error("Guru tidak di temukan");
    }

    const query = `
    
    SELECT
    sub.id   AS subject_id,
    sub.name AS subject_name,

    c.id     AS class_id,
    c.name   AS class_name,

    COUNT(ses.id) AS total,

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
            WHEN tp.id IS NULL
            AND ses.is_teacher_present = 0
            THEN 1
            ELSE 0
        END
    ) AS alpha

FROM attendance_sessions ses

LEFT JOIN subjects sub
    ON ses.subject_id = sub.id

LEFT JOIN classes c
    ON ses.class_id = c.id

LEFT JOIN teacher_permissions tp
    ON tp.teacher_id = ses.teacher_id
    AND tp.status = 'approved'
    AND ses.date BETWEEN tp.start_date AND tp.end_date

WHERE
    ses.teacher_id = :teacher_id
    AND ses.date BETWEEN :start AND :end

GROUP BY
    ses.subject_id,
    ses.class_id

ORDER BY
    sub.name ASC,
    c.name ASC
    `;

    const rows = await sequelize.query(query, {
      replacements: { teacher_id, start, end },
      type: sequelize.QueryTypes.SELECT,
    });

    const summary = { total: 0, hadir: 0, izin: 0, alpha: 0 };

    const teaching = rows.map((row) => {
      const item = {
        subject: { id: row.subject_id, name: row.subject_name },
        class: { id: row.class_id, name: row.class_name },
        attendance: {
          total: Number(row.total),
          hadir: Number(row.hadir),
          izin: Number(row.izin),
          alpha: Number(row.alpha),
        },
      };
      summary.total += item.attendance.total;
      summary.hadir += item.attendance.hadir;
      summary.izin += item.attendance.izin;
      summary.alpha += item.attendance.alpha;

      return item;
    });

    return {
      teacher: { id: teacher.id, name: teacher.name, nip: teacher.nip },

      period: { month: Number(month), year: Number(year) },

      summary,

      teaching,
    };
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

export default PrincipalTeacherService;
