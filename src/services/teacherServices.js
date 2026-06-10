import bcrypt from "bcryptjs";
import db from "../models/index.js";
import { Op, where } from "sequelize";
import { generateTeacherTemplate } from "../utils/excel/teacherTemplate.js";
import { readTeacherExcel } from "../utils/excel/teacherImport.js";

const { User, TeachingAssignment, Class } = db;

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

    if (teacher.role !== "guru" && nip) {
      const exist = await User.findOne({ where: { nip, id: { [Op.ne]: id } } });

      if (exist) {
        throw new Error("NIP sudah di gunakan");
      }

      // if (!name && !nip) {
      //   throw new Error("Minimal satu field harus diubah");
      // }
    }

    await teacher.update({
      name: name ?? teacher.name,
      nip: nip ?? teacher.nip,
    });
  }

  static async delete(id) {
    console.log("DELETE:", id);

    const teacher = await User.findByPk(id);

    if (!teacher) {
      throw new Error("Data guru tidak ditemukan");
    }

    if (teacher.role !== "guru") {
      throw new Error("Data ini bukan guru");
    }

    // cek apakah guru dipakai teaching assignment
    const hasTeachingAssignment = await db.TeachingAssignment.findOne({
      where: { teacher_id: id },
    });

    if (hasTeachingAssignment) {
      throw new Error(
        "Guru tidak dapat dihapus karena masih memiliki jadwal mengajar",
      );
    }

    // cek apakah jadi wali kelas
    const hasHomeroom = await db.Class.findOne({
      where: { homeroom_teacher_id: id },
    });

    if (hasHomeroom) {
      throw new Error(
        "Guru tidak dapat dihapus karena masih menjadi wali kelas",
      );
    }

    await teacher.destroy();
  }

  static async downloadTemplate() {
    return generateTeacherTemplate();
  }

  static async importExcel(fileBuffer) {
    const rows = readTeacherExcel(fileBuffer);

    if (!rows.length) {
      throw new Error("File excel kosong");
    }

    const errors = [];
    const validRows = [];

    // ==========================
    // VALIDASI KOLOM WAJIB
    // ==========================
    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      const nip = String(row.nip || "").trim();
      const name = String(row.name || "").trim();

      if (!nip) {
        errors.push({
          row: rowNumber,
          nip,
          name,
          reason: "NIP wajib diisi",
        });
        return;
      }

      if (!name) {
        errors.push({
          row: rowNumber,
          nip,
          name,
          reason: "Nama wajib diisi",
        });
        return;
      }

      validRows.push({
        row: rowNumber,
        nip,
        name,
      });
    });

    // ==========================
    // CEK DUPLIKAT DALAM FILE
    // ==========================
    const nipCount = {};

    validRows.forEach((row) => {
      nipCount[row.nip] = (nipCount[row.nip] || 0) + 1;
    });

    const duplicateNips = Object.keys(nipCount).filter(
      (nip) => nipCount[nip] > 1,
    );

    const filteredRows = [];

    validRows.forEach((row) => {
      if (duplicateNips.includes(row.nip)) {
        errors.push({
          row: row.row,
          nip: row.nip,
          name: row.name,
          reason: "NIP duplikat dalam file",
        });
      } else {
        filteredRows.push(row);
      }
    });

    // ==========================
    // CEK DATABASE
    // ==========================
    const existingTeachers = await User.findAll({
      where: {
        nip: filteredRows.map((r) => r.nip),
      },
      attributes: ["nip"],
    });

    const existingNips = new Set(
      existingTeachers.map((teacher) => teacher.nip),
    );

    const finalRows = [];

    filteredRows.forEach((row) => {
      if (existingNips.has(row.nip)) {
        errors.push({
          row: row.row,
          nip: row.nip,
          name: row.name,
          reason: "NIP sudah terdaftar",
        });
      } else {
        finalRows.push(row);
      }
    });

    // ==========================
    // INSERT DATA
    // ==========================
    const teachersToCreate = [];

    for (const row of finalRows) {
      const hash = await bcrypt.hash(row.nip, 10);

      teachersToCreate.push({
        name: row.name,
        nip: row.nip,
        password: hash,
        role: "guru",
        username: null,
        nisn: null,
      });
    }

    if (teachersToCreate.length) {
      await User.bulkCreate(teachersToCreate);
    }

    return {
      total: rows.length,
      success: teachersToCreate.length,
      failed: errors.length,
      errors,
    };
  }
}
export default teacherServices;
