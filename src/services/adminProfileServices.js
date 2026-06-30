import bcrypt from "bcryptjs";
import db from "../models/index.js";

const { User } = db;

class AdminProfileService {
  static async getProfile(userId) {
    const admin = await User.findByPk(userId, {
      attributes: ["id", "name", "username", "role"],
    });

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin tidak ditemukan");
    }
    return admin;
  }

  static async updateProfile(userId, body) {
    const { username, current_password, new_password, confirm_password } = body;

    const admin = await User.findByPk(userId);

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin tidak ditemukan");
    }
    const validPassword = await bcrypt.compare(
      current_password,
      admin.password,
    );

    if (!validPassword) {
      throw new Error("Password lama salah");
    }

    if (username && username !== admin.username) {
      const exist = await User.findOne({
        where: {
          username,
        },
      });

      if (exist) {
        throw new Error("Username sudah digunakan");
      }

      admin.username = username;
    }
    if (new_password || confirm_password) {
      if (!new_password || !confirm_password) {
        throw new Error("Password baru dan konfirmasi password wajib diisi");
      }

      if (new_password !== confirm_password) {
        throw new Error("Konfirmasi password tidak cocok");
      }

      admin.password = await bcrypt.hash(new_password, 10);
    }

    await admin.save();

    return { id: admin.id, name: admin.name, username: admin.username };
  }
}

export default AdminProfileService;
