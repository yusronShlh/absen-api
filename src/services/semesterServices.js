import { Op } from "sequelize";
import db from "../models/index.js";

const { Semester } = db;

class SemesterService {
  static async getAll() {
    return await Semester.findAll({ order: [["start_date", "ASC"]] });
  }

  static async create(payload) {
    const { academic_year, type, start_date, end_date } = payload;

    if (new Date(start_date) >= new Date(end_date)) {
      throw new Error("Start_date haru lebih kecil dari end date");
    }

    const overlap = await Semester.findOne({
      where: {
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
        ],
      },
    });

    if (overlap) {
      throw new Error("Tangga; semester overlap dengan semester lain");
    }

    const name = `${type} ${academic_year}`;

    return await Semester.create({
      name,
      academic_year,
      type,
      start_date,
      end_date,
    });
  }

  static async update(id, payload) {
    const semester = await Semester.findByPk(id);
    if (!semester) {
      throw new Error("Semester tidak di temukan");
    }

    const { academic_year, type, start_date, end_date } = payload;

    const overlap = await Semester.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
        ],
      },
    });
    if (overlap) {
      throw new Error("Tanggal semester overlap");
    }

    const name = `${type} ${academic_year}`;

    await semester.update({ name, academic_year, type, start_date, end_date });

    return semester;
  }

  static async delete(id) {
    const semester = await Semester.findByPk(id);
    if (!semester) throw new Error("Semester tidak di temukan");

    const today = new Date();

    if (today >= new Date(semester.start_date)) {
      throw new Error(
        "Semester tidak bisa di hapus karena sudah berjalan/ sudah lewat",
      );
    }

    await semester.destroy();

    return true;
  }

  static getTypes() {
    console.log("\n=== [GET SEMESTER TYPES] ===");
    return [
      { value: "ganjil", label: "Ganjil" },
      { value: "genap", label: "Genap" },
    ];
  }
}

export default SemesterService;
