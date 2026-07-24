import { Op } from "sequelize";
import db from "../../models/index.js";
import { getWIBDateString, getWIBDayName } from "../../utils/timeHelper.js";

const {
  Schedule,
  TeachingAssignment,
  Class,
  Subject,
  LessonTime,
  User,
  Student,
  StudentPermission,
  TeacherPermission,
  PermissionType,
  AttendanceSession,
} = db;

class PrincipalDashboardService {
  static async getTodaySchedules() {
    const day = getWIBDayName();

    const schedules = await Schedule.findAll({
      where: { day },
      include: [
        {
          model: TeachingAssignment,
          include: [
            { model: Class, attributes: ["id", "name"] },
            { model: Subject, attributes: ["id", "name"] },
            { model: User, as: "teacher", attributes: ["id", "name"] },
          ],
        },
        {
          model: LessonTime,
          attributes: ["id", "order", "name", "start_time", "end_time"],
        },
      ],
      order: [[LessonTime, "order", "ASC"]],
    });

    const today = getWIBDateString();

    const sessions = await AttendanceSession.findAll({
      where: { date: today },
    });
    const permissions = await TeacherPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
      },
    });

    const grouped = new Map();

    for (const schedule of schedules) {
      const teachingAssignment = schedule.TeachingAssignment;
      const classData = teachingAssignment.Class;

      if (!grouped.has(classData.id)) {
        grouped.set(classData.id, {
          class: { id: classData.id, name: classData.name },
          schedules: [],
        });
      }

      const session = sessions.find((sess) => sess.schedule_id === schedule.id);

      const permission = permissions.find(
        (p) => p.teacher_id === teachingAssignment.teacher_id,
      );

      const is_submitted = !!session || !!permission;

      const currentTime = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
      });

      const start = schedule.LessonTime.start_time.slice(0, 5);
      const end = schedule.LessonTime.end_time.slice(0, 5);

      let status = "alpha";

      if (currentTime < start) {
        status = "belum_mulai";
      } else if (currentTime >= start && currentTime <= end) {
        if (permission) {
          status = "izin";
        } else if (session) {
          status = session.is_teacher_present ? "hadir" : "alpha";
        } else {
          status = "berlangsung";
        }
      } else {
        if (permission) {
          status = "izin";
        } else if (session) {
          status = session.is_teacher_present ? "hadir" : "alpha";
        } else {
          status = "alpha";
        }
      }

      grouped.get(classData.id).schedules.push({
        schedule_id: schedule.id,
        teaching_assignment_id: teachingAssignment.id,

        lesson: {
          id: schedule.LessonTime.id,
          order: schedule.LessonTime.order,
          name: schedule.LessonTime.name,
          start_time: schedule.LessonTime.start_time,
          end_time: schedule.LessonTime.end_time,
        },

        subject: {
          id: teachingAssignment.Subject.id,
          name: teachingAssignment.Subject.name,
        },

        teacher: {
          id: teachingAssignment.teacher.id,
          name: teachingAssignment.teacher.name,
        },

        status,
        is_submitted,
      });
    }

    return Array.from(grouped.values());
  }

  static async getTeacherStatistics(date) {
    const total = await User.count({ where: { role: "guru" } });

    const permission = await TeacherPermission.count({
      where: {
        status: "approved",
        start_date: { [Op.lte]: date },
        end_date: { [Op.gte]: date },
      },
    });

    return { total, permission, present: total - permission };
  }

  static async getClassStatistics(date) {
    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    const result = [];

    for (const cls of classes) {
      const totalStudents = await Student.count({
        where: { class_id: cls.id, is_graduated: false },
      });

      const permissionStudents = await StudentPermission.count({
        where: {
          status: "approved",
          start_date: { [Op.lte]: date },
          end_date: { [Op.gte]: date },
        },

        include: [
          {
            model: Student,
            required: true,
            where: { class_id: cls.id, is_graduated: false },
          },
        ],
      });

      result.push({
        id: cls.id,
        name: cls.name,
        students: {
          total: totalStudents,
          permission: permissionStudents,
          present: totalStudents - permissionStudents,
        },
      });
    }

    return result;
  }

  static async getTodayPermissions(date) {
    const teacherPermissions = await TeacherPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: date },
        end_date: { [Op.gte]: date },
      },

      include: [{ model: User, as: "teacher", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    const studentPermissions = await StudentPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: date },
        end_date: { [Op.gte]: date },
      },

      include: [
        {
          model: Student,
          attributes: ["id"],
          include: [
            { model: User, attributes: ["id", "name"] },
            { model: Class, attributes: ["id", "name"] },
          ],
        },
        { model: PermissionType, attributes: ["id", "name"] },
      ],

      order: [["createdAt", "DESC"]],
    });

    return {
      teachers: teacherPermissions.map((permission) => ({
        id: permission.id,

        teacher: { id: permission.teacher.id, name: permission.teacher.name },

        start_date: permission.start_date,
        end_date: permission.end_date,
        reason: permission.reason,
      })),

      students: studentPermissions.map((permission) => ({
        id: permission.id,

        student: {
          id: permission.Student.id,
          name: permission.Student.User.name,
        },

        class: {
          id: permission.Student.Class.id,
          name: permission.Student.Class.name,
        },

        permission_type: {
          id: permission.PermissionType.id,
          name: permission.PermissionType.name,
        },

        start_date: permission.start_date,
        end_date: permission.end_date,
        reason: permission.reason,
      })),
    };
  }

  static async getDashboard() {
    const date = getWIBDateString();

    const [
      todaySchedules,
      teacherStatistics,
      classStatistics,
      todayPermissions,
    ] = await Promise.all([
      this.getTodaySchedules(),
      this.getTeacherStatistics(date),
      this.getClassStatistics(date),
      this.getTodayPermissions(date),
    ]);

    return {
      date,
      todaySchedules,
      schoolStatistics: {
        teachers: teacherStatistics,
        classes: classStatistics,
      },
      todayPermissions,
    };
  }
}

export default PrincipalDashboardService;
