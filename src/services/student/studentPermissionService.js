import { Op } from "sequelize";
import db from "../../models/index.js";

const { StudentPermission, PermissionType } = db;

class StudentPermissionService {
  static async create(data) {
    console.log("[SERVICE] Create student permission");

    const {
      student_id,
      permission_type_id,
      start_date,
      end_date,
      reason,
      proof_file,
    } = data;

    if (new Date(end_date) < new Date(start_date)) {
      throw new Error("Tanggal selesai tidak boleh sebelum tanggal mulai izin");
    }

    // VALIDASI TYPE
    const type = await PermissionType.findByPk(permission_type_id);
    if (!type) {
      throw new Error("Jenis izin tidak valid");
    }

    const existing = await StudentPermission.findOne({
      where: {
        student_id,
        status: { [Op.in]: ["pending", "approved"] },
        [Op.and]: [
          { start_date: { [Op.lte]: end_date } },
          { end_date: { [Op.gte]: start_date } },
        ],
      },
    });

    if (existing) {
      throw new Error("Izin bentrok dengan pengajuan lain");
    }

    const newData = await StudentPermission.create({
      student_id,
      permission_type_id,
      start_date,
      end_date,
      reason,
      proof_file,
      status: "pending",
    });

    console.log("[SERVICE] Permission created:", newData.id);

    return newData;
  }

  static async getTypes() {
    return await PermissionType.findAll({
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
    });
  }
}

export default StudentPermissionService;
