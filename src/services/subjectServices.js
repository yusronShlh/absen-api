import db from "../models/index.js";
import { Op } from "sequelize";

const { Subject, Schedule } = db;

class subjectServices {
  // ================= GET ALL =================
  static async getAll() {
    console.log("SERVICE getAll");

    const subjects = await Subject.findAll({
      order: [["name", "ASC"]],
    });

    console.log("FOUND SUBJECT:", subjects.length);

    return subjects;
  }

  // ================= CREATE =================
  static async create(data) {
    console.log("SERVICES create | data:", data);

    const { name } = data;

    if (!name) {
      throw new Error("Nama mapel wajib diisi");
    }

    const exist = await Subject.findOne({
      where: { name },
    });

    if (exist) {
      throw new Error("Mapel sudah ada");
    }

    await Subject.create({ name });

    console.log("Subject created");
  }

  // ================= UPDATE =================
  static async update(id, data) {
    console.log("Services update |id:", id);

    const { name } = data;

    const subject = await Subject.findByPk(id);

    if (!subject) {
      throw new Error("Mapel tidak ditemukan");
    }

    if (!name) {
      throw new Error("Nama mapel wajib diisi");
    }

    const exist = await Subject.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    });

    if (exist) {
      throw new Error("Mapel sudah ada");
    }

    await subject.update({ name });

    console.log("Subject updated");
  }

  // ================= DELETE =================
  static async delete(id) {
    console.log("service delete|id:", id);

    const subject = await Subject.findByPk(id);

    if (!subject) {
      throw new Error("Mapel tidak ditemukan");
    }

    // cek masih dipakai jadwal
    const used = await Schedule.findOne({
      where: { subject_id: id },
    });

    if (used) {
      throw new Error("Mapel masih digunakan di jadwal");
    }

    await subject.destroy();

    console.log("Subject deleted");
  }

  // ================= DETAIL =================
  static async detail(id) {
    console.log("services detail|id:", id);

    const subject = await Subject.findByPk(id);

    if (!subject) {
      throw new Error("Mapel tidak ditemukan");
    }

    return subject;
  }
}

export default subjectServices;
