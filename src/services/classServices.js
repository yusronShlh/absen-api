import { where } from "sequelize";
import db from "../models/index.js";
//import { Class, User, Student } from "../models/index.js";
const { Class, User, Student } = db;

class classServices {
  static async getAll(query) {
    console.log("SERVICE getAll | query:", query);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const data = await Class.findAndCountAll({
      limit,
      offset,
      order: [["id", "DESC"]],

      include: [
        { model: User, as: "homeroomTeacher", attributes: ["id", "name"] },
      ],
    });

    console.log("SERVICE getAll | result:", data.count);
    return data;
  }

  static async create(data) {
    console.log("SERVICE create | data:", data);
    const { name, homeroomTeacherId } = data;

    if (!name) {
      throw new Error("Nama kelas wajib di isi");
    }

    const exist = await Class.findOne({ where: { name } });
    console.log("CHECK NAME EXIST:", !!exist);

    if (exist) {
      throw new Error("Nama kelas sudah ada");
    }
    if (homeroomTeacherId) {
      console.log("CHECK TEACHER ID:", homeroomTeacherId);
      const teacher = await User.findOne({
        where: { id: homeroomTeacherId, role: "guru" },
      });

      console.log("TEACHER FOUND:", !!teacher);
      if (!teacher) {
        throw new Error("Guru tidak valid");
      }
    }

    await Class.create({
      name,
      homeroom_teacher_id: homeroomTeacherId || null,
    });

    console.log("CLASS CREATED");
  }

  static async update(id, data) {
    const { name, homeroomTeacherId } = data;

    const kelas = await Class.findByPk(id);
    if (!kelas) {
      throw new Error("Kelas tidak di temukan");
    }

    if (homeroomTeacherId) {
      const teacher = await User.findOne({
        where: { id: homeroomTeacherId, role: "guru" },
      });

      if (!teacher) {
        throw new Error("Guru tidak valid");
      }
    }
    await kelas.update({
      name: name || kelas.name,
      homeroom_teacher_id: homeroomTeacherId ?? kelas.homeroom_teacher_id,
    });
  }

  static async delete(id) {
    const kelas = await Class.findByPk(id);
    if (!kelas) {
      throw new Error("Kelas tidak di temukan");
    }

    const student = await Student.count({ where: { class_id: id } });
    if (student > 0) {
      throw new Error("Kelas masih memiliki siswa");
    }

    await kelas.destroy();
  }

  static async detail(id) {
    const kelas = await Class.findByPk(id, {
      include: [
        { model: User, as: "homeroomTeacher", attibutes: ["id", "name"] },
        {
          model: Student,
          include: [{ model: User, attibutes: ["id", "name", "nisn"] }],
        },
      ],
    });

    if (!kelas) {
      throw new Error("Kelas tidak di temukan");
    }
    return kelas;
  }

  static async select() {
    const teacher = await User.findAll({
      where: { role: "guru" },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    console.log("FOUND TEACHERS:", teacher.length);
    return teacher;
  }
}

export default classServices;
