import { Op } from "sequelize";
import db from "../../models/index.js";

const { Student, StudentPermission, PermissionType } = db;

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

  static async getHistory(userId) {
    console.log("\n=== [SERVICE] STUDENT PERMISSION HISTORY ===");

    const student = await Student.findOne({
      where: { user_id: userId },
      attributes: ["id"],
    });

    if (!student) {
      throw new Error("Student tidak di temukan");
    }
    console.log("[DEBUG] Student ID:", student.id);

    const permissions = await StudentPermission.findAll({
      where: { student_id: student.id },
      include: [{ model: PermissionType, attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
    });
    console.log("[DEBUG] Total permissions:", permissions.length);

    const result = permissions.map((p) => {
      const start = new Date(p.start_date);
      const end = new Date(p.end_date);
      const total_days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

      return {
        id: p.id,
        start_date: p.start_date,
        end_date: p.end_date,
        total_days,
        type: p.PermissionType?.name || "-",
        reason: p.reason,
        status: p.status,
        proof_file: p.proof_file,
        approved_at: p.approved_at,
      };
    });
    return result;
  }
}

export default StudentPermissionService;
