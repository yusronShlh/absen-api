import db from "../models/index.js";

const { TeacherPermission, User } = db;

const BASE_URL = process.env.BASE_URL || "http://100.105.63.68:4000";
function buildFileUrl(file) {
  if (!file) return null;
  return `${BASE_URL}/uploads/teacher-permissions/${file}`;
}

class TeacherPermissionServices {
  static async getAll() {
    console.log("[SERVICE] getAll teacher permissions");

    const data = await TeacherPermission.findAll({
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
        {
          model: db.TeacherPermissionDetail,
          as: "details",
          include: [
            {
              model: db.Schedule,
              include: [
                { model: db.Subject, attributes: ["id", "name"] },
                {
                  model: db.LessonTime,
                  attributes: ["start_time", "end_time"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    console.log("✅ Total permissions:", data.length);

    const result = data.map((item) => {
      const obj = item.toJSON();
      obj.letter = buildFileUrl(obj.letter);
      return obj;
    });

    return result;
  }

  static async getById(id) {
    console.log("[SERVICE] getById:", id);

    const data = await TeacherPermission.findByPk(id, {
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
        {
          model: db.TeacherPermissionDetail,
          as: "details",
          include: [
            {
              model: db.Schedule,
              include: [{ model: db.Subject }, { model: db.LessonTime }],
            },
          ],
        },
      ],
    });
    if (!data) {
      console.log("❌ Permission not found");
      throw new Error("Izin guru tidak di temukan");
    }
    const result = data.toJSON();

    result.letter = buildFileUrl(result.letter);

    return result;
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

    if (!permission.is_full_day) {
      const details = await db.TeacherPermissionDetail.findAll({
        where: { permission_id: permission.id },
      });

      if (!details.length) {
        throw new Error("Detail jadwal izin tidak di temukan");
      }
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
