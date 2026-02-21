import db from "../models/index.js";

const { TeacherPermission, User } = db;

class TeacherPermissionServices {
  static async getAll() {
    console.log("[SERVICE] getAll teacher permissions");

    const data = await TeacherPermission.findAll({
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    console.log("✅ Total permissions:", data.length);

    return data;
  }
  static async getById(id) {
    console.log("[SERVICE] getById:", id);

    const data = await TeacherPermission.findByPk(id, {
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
      ],
    });
    if (!data) {
      console.log("❌ Permission not found");
      throw new Error("Izin guru tidak di temukan");
    }
    return data;
  }

  static async approve(id) {
    console.log("[SERVICE] approve:", id);

    const permission = await TeacherPermission.findByPk(id);
    if (!permission) {
      throw new Error("Izin tidak di temukan");
    }

    if (permission.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    await permission.update({ status: "approved" });
    console.log("✅ Approved:", id);

    return true;
  }

  static async reject(id) {
    console.log("[SERVICE] reject:", id);

    const permission = await TeacherPermission.findByPk(id);

    if (!permission) {
      throw new Error("Izin tidak di temukan");
    }

    if (permission.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    await permission.update({ status: "rejected" });

    console.log("❌ Rejected:", id);

    return true;
  }
}

export default TeacherPermissionServices;
