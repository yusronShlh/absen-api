import { Op } from "sequelize";
import db from "../../models/index.js";
import { getWIBDate, getWIBDateString } from "../../utils/timeHelper.js";

const {
  TeacherPermission,
  TeacherPermissionDetail,
  StudentPermission,
  Student,
  User,
  Class,
  Subject,
  Schedule,
  LessonTime,
} = db;

const BASE_URL = process.env.BASE_URL || "http://100.105.63.68:4000";

function teacherLetter(file) {
  if (!file) return null;
  return `${BASE_URL}/uploads/teacher-permissions/${file}`;
}

function studentLetter(file) {
  if (!file) return null;
  return `${BASE_URL}/uploads/student-permissions/${file}`;
}

const teacherInclude = [
  { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
];

const studentInclude = [
  {
    model: Student,
    attributes: ["id"],
    include: [
      {
        model: User,
        attributes: ["id", "name", "nisn"],
      },
      {
        model: Class,
        attributes: ["id", "name"],
      },
    ],
  },
];

function formatTeachers(data) {
  return data.map((item) => {
    const obj = item.toJSON();
    obj.letter = teacherLetter(obj.letter);
    return obj;
  });
}

function formatStudents(data) {
  return data.map((item) => {
    const obj = item.toJSON();
    obj.letter = studentLetter(obj.proof_file);
    return obj;
  });
}

class PrincipalPermissionService {
  static async getAll() {
    const today = getWIBDateString();

    const sevenDaysAgo = new Date(getWIBDate());
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const limitDate = sevenDaysAgo.toISOString().split("T")[0];

    const teacherPending = await TeacherPermission.findAll({
      where: {
        status: "pending",
      },
      include: teacherInclude,
      order: [["createdAt", "DESC"]],
    });

    const teacherActive = await TeacherPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
      },
      include: teacherInclude,
      order: [["start_date", "ASC"]],
    });

    const teacherRecent = await TeacherPermission.findAll({
      where: {
        status: {
          [Op.in]: ["approved", "rejected"],
        },
        end_date: {
          [Op.gte]: limitDate,
          [Op.lt]: today,
        },
      },
      include: teacherInclude,
      order: [["end_date", "DESC"]],
    });

    const studentPending = await StudentPermission.findAll({
      where: {
        status: "pending",
      },
      include: studentInclude,
      order: [["createdAt", "DESC"]],
    });

    const studentActive = await StudentPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
      },
      include: studentInclude,
      order: [["start_date", "ASC"]],
    });

    const studentRecent = await StudentPermission.findAll({
      where: {
        status: {
          [Op.in]: ["approved", "rejected"],
        },
        end_date: {
          [Op.gte]: limitDate,
          [Op.lt]: today,
        },
      },
      include: studentInclude,
      order: [["end_date", "DESC"]],
    });

    return {
      teachers: {
        pending: formatTeachers(teacherPending),
        active: formatTeachers(teacherActive),
        recent: formatTeachers(teacherRecent),
      },
      students: {
        pending: formatStudents(studentPending),
        active: formatStudents(studentActive),
        recent: formatStudents(studentRecent),
      },
    };
  }

  static async getTeacherDetail(id) {
    const data = await TeacherPermission.findByPk(id, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "nip"],
        },
        {
          model: TeacherPermissionDetail,
          as: "details",
          include: [
            {
              model: Schedule,
              include: [
                {
                  model: db.TeachingAssignment,
                  include: [
                    { model: db.Subject },
                    { model: db.Class },
                    {
                      model: db.User,
                      as: "teacher",
                    },
                  ],
                },
                {
                  model: db.LessonTime,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!data) {
      throw new Error("Izin guru tidak ditemukan");
    }

    const result = data.toJSON();
    result.letter = teacherLetter(result.letter);

    return result;
  }

  static async getStudentDetail(id) {
    const data = await StudentPermission.findByPk(id, {
      include: [
        {
          model: Student,
          include: [
            {
              model: User,
              attributes: ["name", "nisn"],
            },
            {
              model: Class,
              attributes: ["name"],
            },
          ],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!data) {
      throw new Error("Izin siswa tidak ditemukan");
    }

    const result = data.toJSON();
    result.letter = studentLetter(result.proof_file);

    return result;
  }
}

export default PrincipalPermissionService;
