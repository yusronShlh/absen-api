import { Op } from "sequelize";
import db from "../../models/index.js";

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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // HADIR
    const hadir = await AttendanceSession.count({
      include: [
        {
          model: Schedule,
          include: [
            {
              model: db.TeachingAssignment,
              where: { teacher_id: teacherId },
              required: true,
            },
          ],
        },
      ],
      where: {
        is_teacher_present: true,
        createdAt: {
          [Op.between]: [startOfMonth, now],
        },
      },
    });

    // ALPHA
    const alpha = await AttendanceSession.count({
      include: [
        {
          model: Schedule,
          include: [
            {
              model: db.TeachingAssignment,
              where: { teacher_id: teacherId },
              required: true,
            },
          ],
          required: true,
        },
      ],
      where: {
        is_teacher_present: false,
        createdAt: { [Op.between]: [startOfMonth, now] },
      },
    });

    // IZIN
    const izin = await TeacherPermission.count({
      where: {
        teacher_id: teacherId,
        status: "approved",
        createdAt: {
          [Op.between]: [startOfMonth, now],
        },
      },
    });

    const total = hadir + izin + alpha;

    const percentage = total === 0 ? 0 : Math.round((hadir / total) * 100);

    return {
      hadir,
      izin,
      alpha,
      percentage,
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
