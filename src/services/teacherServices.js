import bcrypt from "bcryptjs";
import db from "../models/index.js";
import { Op, where } from "sequelize";

const { User } = db;

class teacherServices {
  // GET all guru
  static async getAll(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const data = await User.findAndCountAll({
      where: { role: "guru" },
      attributes: ["id", "name", "nip"],
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    return data;
  }

  // tambah guru
  static async create(data) {
    const { name, nip, password } = data;

    if (!name || !nip || !password) {
      throw new Error("Nama, NIP, Password wajib di isi");
    }

    const exist = await User.findOne({ where: { nip } });
    if (exist) {
      throw new Error("NIP sudah terdaftar");
    }
    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      nip,
      password: hash,
      role: "guru",
      username: null,
      nisn: null,
    });
  }

  static async update(id, data) {
    const { name, nip } = data;

    const teacher = await User.findByPk(id);
    if (!teacher) {
      throw new Error("Data guru tidak di temukan");
    }

    if (teacher.role !== "guru") {
      const exist = await User.findOne({ where: { nip, id: { [Op.ne]: id } } });

      if (exist) {
        throw new Error("NIP sudah di gunakan");
      }
    }

    await teacher.update({
      name: name || teacher.name,
      nip: nip || teacher.nip,
    });
  }

  static async delete(id) {
    console.log("DELETE:", id);
    const teacher = await User.findByPk(id);

    if (!teacher) {
      throw new Error("Data guru tidak di temukan");
    }
    if (teacher.role !== "guru") {
      console.log("Data ini bukan guru");
      throw new Error("Data ini bukan guru");
    }

    await teacher.destroy();
  }
}
export default teacherServices;
