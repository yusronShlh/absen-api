import { Op } from "sequelize";
import db from "../../models/index.js";
import { getWIBDateString } from "../../utils/timeHelper.js";

const {
  Schedule,
  Class,
  Subject,
  LessonTime,
  AttendanceSession,
  TeacherPermission,
  User,
  TeachingAssignment,
} = db;

class DashboardService {
  static getTodayName() {
    const days = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    const today = new Date().getDay();
    console.log("TODAY:", today);
    return days[today];
  }

  static async getTodaySchedules(teacherId) {
    const today = this.getTodayName();
    const schedules = await Schedule.findAll({
      where: { day: today },
      include: [
        {
          model: db.TeachingAssignment,
          where: { teacher_id: teacherId },
          include: [
            { model: Class, attributes: ["id", "name"] },
            { model: Subject, attributes: ["id", "name"] },
          ],
          required: true,
        },
        { model: LessonTime, attributes: ["start_time", "end_time", "order"] },
      ],

      order: [[LessonTime, "order", "ASC"]],
    });

    return schedules;
  }

  static async getAttendanceStats(teacherId) {
    const today = getWIBDateString();

    const currentDate = new Date(today);

    const startOfMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}-01`;

    // semua session guru bulan ini
    const sessions = await AttendanceSession.findAll({
      where: {
        date: {
          [Op.between]: [startOfMonth, today],
        },
      },

      include: [
        {
          model: Schedule,
          required: true,

          include: [
            {
              model: TeachingAssignment,
              where: { teacher_id: teacherId },
              required: true,
            },
          ],
        },
      ],
    });

    // semua izin guru yang overlap bulan ini
    const permissions = await TeacherPermission.findAll({
      where: {
        teacher_id: teacherId,
        status: "approved",

        start_date: {
          [Op.lte]: today,
        },

        end_date: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    let hadir = 0;
    let izin = 0;
    let alpha = 0;

    for (const sess of sessions) {
      console.log("SESSION:", sess.id, sess.date);
      const hasPermission = permissions.find(
        (p) => sess.date >= p.start_date && sess.date <= p.end_date,
      );

      console.log(
        "MATCH:",
        hasPermission
          ? `${hasPermission.start_date} - ${hasPermission.end_date}`
          : "TIDAK ADA",
      );

      if (hasPermission) {
        izin++;
      } else if (sess.is_teacher_present) {
        hadir++;
      } else {
        alpha++;
      }
    }

    const total = hadir + izin + alpha;

    return {
      hadir,
      izin,
      alpha,
      percentage: total === 0 ? 0 : Math.round((hadir / total) * 100),
    };
  }

  static async getLastLeaves(teacherId) {
    const leaves = await TeacherPermission.findAll({
      where: { teacher_id: teacherId },
      limit: 3,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "start_date",
        "end_date",
        "reason",
        "status",
        "createdAt",
      ],
    });

    return leaves;
  }

  static async getDashboard(teacherId) {
    const teacher = await User.findByPk(teacherId, { attributes: ["name"] });
    const today_schedules = await this.getTodaySchedules(teacherId);

    const attendance_stats = await this.getAttendanceStats(teacherId);

    const last_leaves = await this.getLastLeaves(teacherId);

    return { teacher, today_schedules, attendance_stats, last_leaves };
  }
}

export default DashboardService;
