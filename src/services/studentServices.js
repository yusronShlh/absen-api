import bcrypt from "bcryptjs";
import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import Class from "../models/classModel.js";
import sequelize from "../config/db.js";
import { generateStudentTemplate } from "../utils/excel/studentTemplate.js";
import { readStudentExcel } from "../utils/excel/studentImport.js";

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
        {
          model: User,
          attributes: ["id", "name", "nisn", "role"],
          required: true,
        },
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
      paranoid: false,
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
    const student = await Student.findByPk(id, {
      include: [{ model: User, required: true }],
    });

    if (!student) {
      throw new Error("Siswa tidak di temukan");
    }

    const { name, nisn, class_id, gender } = payload;
    // cek NISN harus unik
    if (nisn !== student.User.nisn) {
      const exist = await User.findOne({ where: { nisn }, paranoid: false });

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

      await User.destroy({ where: { id: student.user_id }, transaction: t });

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getClass() {
    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return classes;
  }

  static async downloadTemplate() {
    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    return generateStudentTemplate(classes);
  }
  static async importExcel(buffer) {
    const rows = readStudentExcel(buffer);

    if (!rows.length) {
      throw new Error("File excel kosong");
    }

    const failedRows = [];
    const successRows = [];

    // ambil semua kelas sekali saja
    const classes = await Class.findAll({
      attributes: ["id", "name"],
    });

    const classMap = new Map();

    classes.forEach((item) => {
      classMap.set(item.name.trim().toLowerCase(), item);
    });

    // cek duplikat NISN di file
    const nisnCount = {};

    rows.forEach((row) => {
      const nisn = String(row.nisn || "").trim();

      if (nisn) {
        nisnCount[nisn] = (nisnCount[nisn] || 0) + 1;
      }
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const nisn = String(row.nisn || "").trim();
      const name = String(row.name || "").trim();
      const gender = String(row.gender || "").trim();
      const className = String(row.class_name || "").trim();

      // ======================
      // VALIDASI FIELD WAJIB
      // ======================

      if (!nisn) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: "NISN wajib diisi",
        });
        continue;
      }

      if (!name) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: "Nama wajib diisi",
        });
        continue;
      }

      if (!gender) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: "Gender wajib diisi",
        });
        continue;
      }

      if (!className) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: "Kelas wajib diisi",
        });
        continue;
      }

      // ======================
      // VALIDASI GENDER
      // ======================

      if (!["L", "P"].includes(gender)) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: "Gender harus L atau P",
        });
        continue;
      }

      // ======================
      // DUPLIKAT DI FILE
      // ======================

      if (nisnCount[nisn] > 1) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: "NISN duplikat di file import",
        });
        continue;
      }

      // ======================
      // CEK KELAS
      // ======================

      const kelas = classMap.get(className.toLowerCase());

      if (!kelas) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: `Kelas ${className} tidak ditemukan`,
        });
        continue;
      }

      // ======================
      // CEK DATABASE
      // ======================

      const exist = await User.findOne({
        where: { nisn },
        paranoid: false,
      });

      if (exist) {
        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: "NISN sudah terdaftar",
        });
        continue;
      }

      // ======================
      // INSERT
      // ======================

      const t = await sequelize.transaction();

      try {
        const hash = await bcrypt.hash(nisn, 10);

        const user = await User.create(
          {
            name,
            nisn,
            password: hash,
            username: null,
            role: "siswa",
          },
          { transaction: t },
        );

        await Student.create(
          {
            user_id: user.id,
            class_id: kelas.id,
            gender,
          },
          { transaction: t },
        );

        await t.commit();

        successRows.push({
          nisn,
          name,
        });
      } catch (err) {
        await t.rollback();

        failedRows.push({
          row: i + 2,
          nisn,
          name,
          reason: err.message,
        });
      }
    }

    return {
      message: "Import siswa selesai",
      success_count: successRows.length,
      failed_count: failedRows.length,
      failed_rows: failedRows,
    };
  }

  static async promoteClass(payload) {
    const { from_class_id, to_class_id } = payload;
    if (!from_class_id || !to_class_id) {
      throw new Error("Kelas asal dan kelas tujuan wajib di pilih");
    }

    if (Number(from_class_id) === Number(to_class_id)) {
      throw new Error("Kelas asal dan kelas tujuan tidak bole sama");
    }

    const fromClass = await Class.findByPk(from_class_id);
    if (!fromClass) {
      throw new Error("Kelas asal tidak ditemukan");
    }

    const toClass = await Class.findByPk(to_class_id);
    if (!toClass) {
      throw new Error("Kelas tujuan tidak ditemukan");
    }

    const totalStudents = await Student.count({
      where: { class_id: from_class_id },
    });

    if (totalStudents === 0) {
      throw new Error("Tidak ada siswa dikelas asal");
    }

    await Student.update(
      { class_id: to_class_id },
      { where: { class_id: from_class_id } },
    );

    return {
      message: `Berhasil menaikkan ${totalStudents} siswa dari kelas ${fromClass.name} ke kelas ${toClass.name}`,
      moved_students: totalStudents,
      from_class: fromClass.name,
      to_class: toClass.name,
    };
  }
}

export default StudentService;
