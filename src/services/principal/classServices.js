import db from "../../models/index.js";

const { Class, Student, User } = db;

class PrincipalClassService {
  static async getClasses() {
    const classes = await Class.findAll({
      attributes: ["id", "name"],
      include: [
        { model: User, as: "homeroomTeacher", attributes: ["id", "name"] },
        {
          model: Student,
          attributes: ["id"],
          where: { is_graduated: false },
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });

    return classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      homeroom_teacher: cls.homeroomTeacher
        ? { id: cls.homeroomTeacher.id, name: cls.homeroomTeacher.name }
        : null,

      total_students: cls.Students.length,
    }));
  }

  static async getClassDetail(class_id) {
    const cls = await Class.findByPk(class_id, {
      attributes: ["id", "name"],
      include: [
        { model: User, as: "homeroomTeacher", attributes: ["id", "name"] },
        {
          model: Student,
          where: { is_graduated: false },
          required: false,
          attributes: ["id"],
          include: [{ model: User, attributes: ["id", "name", "nisn"] }],
        },
      ],
    });

    if (!cls) {
      throw new Error("Kelas tidak ditemukan");
    }

    const students = cls.Students.sort((a, b) =>
      a.User.name.localeCompare(b.User.name),
    ).map((student) => ({
      id: student.id,
      name: student.User.name,
      nisn: student.User.nisn,
    }));

    return {
      id: cls.id,
      name: cls.name,
      homeroom_teacher: cls.homeroomTeacher
        ? { id: cls.homeroomTeacher.id, name: cls.homeroomTeacher.name }
        : null,

      total_students: students.length,

      students,
    };
  }
}

export default PrincipalClassService;
