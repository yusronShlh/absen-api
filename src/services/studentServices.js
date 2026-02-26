import bcrypt from "bcryptjs";
import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import Class from "../models/classModel.js";
import sequelize from "../config/db.js";

class StudentService {
  static async getAll(query) {
    console.log("QUERTY:", query);

    const { page = 1, limit = 10, class_id } = query;

    console.log("Filter class_id:", class_id);

    const where = {};

    if (class_id) {
      where.class_id = class_id;
    }
    const offset = (page - 1) * limit;

    const data = await Student.findAndCountAll({
      where,
      limit: Number(limit),
      offset,

      include: [
        { model: User, attributes: ["id", "name", "nisn", "role"] },
        { model: Class, attributes: ["id", "name"] },
      ],
    });
    return data;
  }
  static async create(payload) {
    const { name, password, nisn, class_id, gender } = payload;

    //cek username
    const exist = await User.findOne({
      where: { nisn },
    });
    if (exist) {
      throw new Error("NISN sudah di gunakan");
    }
    const hash = await bcrypt.hash(password, 10);

    // buat user
    const user = await User.create({
      name,
      nisn,
      password: hash,
      username: null,
      role: "siswa",
    });

    // buat siswa
    await Student.create({ user_id: user.id, class_id, gender });
    return true;
  }

  static async update(id, payload) {
    const student = await Student.findByPk(id, { include: User });

    if (!student) {
      throw new Error("Siswa tidak di temukan");
    }

    const { name, nisn, class_id, gender } = payload;
    // cek NISN harus unik
    if (nisn !== student.User.nisn) {
      const exist = await User.findOne({ where: { nisn } });

      if (exist) {
        throw new Error("NISN sudah di gunakan");
      }
    }

    await student.User.update({ name, nisn });

    await student.update({ class_id, gender });
    return true;
  }

  static async delete(id) {
    const t = await sequelize.transaction();
    try {
      const student = await Student.findByPk(id);

      if (!student) {
        throw new Error("Siswa tidak di temukan");
      }
      await Student.destroy({ where: { id }, transaction: t });
      await User.destroy({ where: { id: student.user_id }, transaction: t });

      await t.commit();
      return true;
    } catch (err) {}
  }

  static async getClass() {
    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return classes;
  }
}

export default StudentService;
