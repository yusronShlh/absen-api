import db from "../models/index.js";
import { Op } from "sequelize";

const { Subject, Class, User, Schedule } = db;

class subjectServices {
  static async getAll(query) {
    console.log("SERVICE getAll | query:", query);

    let { classId } = query;

    if (!classId) {
      const firstClass = await Class.findOne({ order: [["id", "ASC"]] });

      if (!firstClass) {
        throw new Error("Belum ada data kelas");
      }
      classId = firstClass.id;
      console.log("Default Class:", classId);
    }
    const subcjects = await Subject.findAll({
      where: { class_id: classId },
      include: [
        { model: User, as: "teacher", attributes: ["id", "name"] },
        { model: Class, attributes: ["id", "name"] },
      ],
      //   raw: true,
      order: [["id", "ASC"]],
    });

    console.log("FOUND SUBJECT:", subcjects.length);

    return subcjects;
  }

  static async create(data) {
    console.log("SERVICES create | data:", data);
    const { name, classId, teacherId } = data;
    if (!name || !classId || !teacherId) {
      throw new Error("Semua field harus di isi");
    }

    const kelas = await Class.findByPk(classId);
    console.log("Check class:", !!kelas);
    if (!kelas) {
      throw new Error("Kelas tidak valid");
    }

    const teacher = await User.findOne({
      where: { id: teacherId, role: "guru" },
    });
    console.log("Check teacher:", !!teacher);

    if (!teacher) {
      throw new Error("Guru tidak valid");
    }

    const exist = await Subject.findOne({ where: { name, class_id: classId } });
    console.log("Check duplicate:", !!exist);

    if (exist) {
      throw new Error("Mapel sudah ada di kelas ini");
    }

    await Subject.create({ name, class_id: classId, teacher_id: teacherId });
    console.log("Subject created");
  }

  static async update(id, data) {
    console.log("Services update |id:", id);
    console.log("Data:", data);

    const { name, classId, teacherId } = data;

    const subject = await Subject.findByPk(id);
    console.log("Chek Subject:", !!subject);
    if (!subject) {
      throw new Error("Mapel tidak di temukan");
    }

    if (classId) {
      const kelas = await Class.findByPk(classId);
      console.log("Check kelas:", !!kelas);
      if (!kelas) {
        throw new Error("kelas tidak valid");
      }
    }

    if (teacherId) {
      const teacher = await User.findOne({
        where: { id: teacherId, role: "guru" },
      });
      console.log("chek teacher:", !!teacher);

      if (!teacher) {
        throw new Error("guru tidak valid");
      }
    }

    if (name || classId) {
      const exist = await Subject.findOne({
        where: {
          name: name || subject.name,
          class_id: classId || subject.class_id,

          id: { [Op.ne]: id },
        },
      });

      console.log("check update", !!exist);
      if (exist) {
        throw new Error("Mapel sudah ada di kelas ini");
      }
    }
    await subject.update({
      name: name || subject.name,
      class_id: classId || subject.class_id,
      teacher_id: teacherId || subject.teacher_id,
    });
    console.log("subject updated");
  }

  static async delete(id) {
    console.log("service delete|id:", id);

    const subject = await Subject.findByPk(id);
    console.log("check subcject", !!subject);
    if (!subject) {
      throw new Error("Mapel tidak di temukan");
    }
    // cek apakah masih dipakai di jadwal
    const used = await Schedule.findOne({
      where: { subject_id: id },
    });

    if (used) {
      throw new Error("Mapel masih digunakan di jadwal, tidak bisa dihapus");
    }

    await subject.destroy();

    console.log("subject deleted");
  }

  static async detail(id) {
    console.log("services detail|id:", id);

    const subject = await Subject.findByPk(id);
    if (!subject) {
      throw new Error("Mapel tidak di temukan");
    }
    return subject;
  }

  static async formOptions() {
    console.log("services formOptions");

    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    const teachers = await User.findAll({
      where: { role: "guru" },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    console.log("Found classes:", classes.length);
    console.log("Found teachers:", teachers.length);

    return { classes, teachers };
  }
}

export default subjectServices;
