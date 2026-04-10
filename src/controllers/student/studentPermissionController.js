import StudentPermissionService from "../../services/student/studentPermissionService.js";
import db from "../../models/index.js";

const { Student } = db;

class StudentPermissionController {
  static async create(req, res) {
    try {
      console.log("=== [POST] Student Submit Permission ===");
      console.log("[DEBUG USER]:", req.user);

      // 🔥 ambil student dari DB
      const student = await Student.findOne({
        where: { user_id: req.user.id },
      });

      if (!student) {
        throw new Error("Data siswa tidak ditemukan");
      }

      const studentId = student.id;
      console.log("[CTRL] Student ID:", studentId);

      const { permission_type_id, start_date, end_date, reason } = req.body;
      console.log("[CTRL] Body:", req.body);
      const file = req.file;
      if (file) {
        console.log("[CTRL] File uploaded:", file.filename);
      }

      const data = await StudentPermissionService.create({
        student_id: studentId,
        permission_type_id,
        start_date,
        end_date,
        reason,
        proof_file: file ? file.path : null,
      });

      return res.status(201).json({
        message: "Perngajuan izin berhasil",
        data: { id: data.id, status: data.status },
      });
    } catch (err) {
      console.error("[ERROR] Submit Permission:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async getTypes(req, res) {
    try {
      const data = await StudentPermissionService.getTypes();
      res.json(data);
    } catch (err) {
      console.error("[ERROR] Gettypes permissions:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getHistory(req, res) {
    try {
      const userId = req.user.id;

      const data = await StudentPermissionService.getHistory(userId);

      return res.json({
        message: "Berhasil ambil data history izin siswa",
        data,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default StudentPermissionController;
