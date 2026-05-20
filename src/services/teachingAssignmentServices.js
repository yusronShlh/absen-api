import db from "../models/index.js";

const { TeachingAssignment, Class, Subject, User, Schedule, Semester } = db;

class TeachingAssignmentService {
  static async getAll() {
    const data = await TeachingAssignment.findAll({
      include: [
        { model: Class, attributes: ["id", "name"] },
        { model: Subject, attributes: ["id", "name"] },
        { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
        { model: Semester, attributes: ["id", "name"] },
      ],
      order: [["id", "DESC"]],
    });

    return data;
  }

  static async create(body) {
    const { class_id, subject_id, teacher_id, semester_id } = body;

    const existing = await TeachingAssignment.findOne({
      where: { class_id, subject_id, semester_id },
    });

    if (existing) {
      throw new Error("Mapel ini sudah memiliki guru di kelas tersebut");
    }

    const classData = await Class.findByPk(class_id);

    if (!classData) {
      throw new Error("Kelas tidak ditemukan");
    }

    const subject = await Subject.findByPk(subject_id);
    if (!subject) {
      throw new Error("Mapel tidak ditemukan");
    }

    const teacher = await User.findOne({
      where: { id: teacher_id, role: "guru" },
    });

    if (!teacher) {
      throw new Error("Guru tidak di temukan");
    }

    const semester = await Semester.findByPk(semester_id);

    if (!semester) {
      throw new Error("Semester tidak ditemukan");
    }

    const assignment = await TeachingAssignment.create({
      class_id,
      subject_id,
      teacher_id,
      semester_id,
    });

    return assignment;
  }

  static async update(id, body) {
    const assignment = await TeachingAssignment.findByPk(id);

    if (!assignment) {
      throw new Error("Assignment tidak di temukan");
    }

    const { class_id, subject_id, teacher_id, semester_id } = body;

    const duplicate = await TeachingAssignment.findOne({
      where: { class_id, subject_id, semester_id },
    });

    if (duplicate && duplicate.id !== assignment.id) {
      throw new Error("Mapel ini sudah memiliki guru di kelas tersebut");
    }

    await assignment.update({ class_id, subject_id, teacher_id, semester_id });

    return assignment;
  }

  static async delete(id) {
    const assignment = await TeachingAssignment.findByPk(id);

    if (!assignment) {
      throw new Error("Assignment tidak di temukan");
    }

    const usedInSchedule = await Schedule.findOne({
      where: { teaching_assignment_id: id },
    });

    if (usedInSchedule) {
      throw new Error(
        "Penugasan tidak bisa di hapus karena masih di gunakan di jadwal",
      );
    }
    await assignment.destroy();

    return true;
  }

  static async getOptions() {
    console.log("\n=== [SERVICE] GET TEACHING OPTIONS ===");

    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    console.log("[DEBUG] Classes:", classes.length);

    const subjects = await Subject.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    console.log("[DEBUG] Subjects:", subjects.length);

    const teachers = await User.findAll({
      where: { role: "guru" },
      attributes: ["id", "name", "nip"],
      order: [["name", "ASC"]],
    });

    console.log("[DEBUG] Teachers:", teachers.length);

    const semesters = await Semester.findAll({
      attributes: ["id", "name"],
      order: [["start_date", "ASC"]],
    });

    console.log("[DEBUG] Semesters:", semesters.length);

    return {
      classes,
      subjects,
      teachers,
      semesters,
    };
  }
}

export default TeachingAssignmentService;
