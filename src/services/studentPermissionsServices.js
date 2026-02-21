import db from "../models/index.js";

const { StudentPermission, Student, Class, User } = db;

class StudentPermissionService {
  static async getAll() {
    console.log("[SERVICE] getAll permissions");
    const data = await StudentPermission.findAll({
      include: [
        {
          model: Student,
          attributes: ["id"],
          include: [{ model: User, attributes: ["id", "name", "nisn"] }],
        },
        { model: Class, attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    console.log(`[SERVICE] Found ${data.length} permissions`);
    return data;
  }

  static async getById(id) {
    console.log("[SERVICE] get permission detail:", id);
    const data = await StudentPermission.findByPk(id, {
      include: [
        {
          model: Student,
          include: [{ model: User, attributes: ["name", "nisn"] }],
        },
        { model: Class, attributes: ["name"] },
        { model: User, as: "approver", attributes: ["id", "name"] },
      ],
    });
    if (!data) {
      console.log("[SERVICE] Permission not found");
      throw new Error("Izin tidak di temukan");
    }
    return data;
  }

  static async approve(id, adminId) {
    console.log("[SERVICE] approve permission:", id);
    const data = await StudentPermission.findByPk(id);
    if (!data) {
      console.log("[SERVICE] Permission not found");
      throw new Error("Izin tidak di temukan");
    }
    if (data.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    await data.update({
      status: "approved",
      approve_by: adminId,
      approved_at: new Date(),
    });
    console.log("[SERVICE] Permission approved");

    return true;
  }

  static async reject(id, adminId) {
    console.log("[SERVICE] reject permission:", id);

    const data = await StudentPermission.findByPk(id);
    if (!data) {
      throw new Error("Izin tidak di temukan");
    }
    if (data.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    await data.update({
      status: "rejected",
      approve_by: adminId,
      approved_at: new Date(),
    });
    return true;
  }
}

export default StudentPermissionService;
