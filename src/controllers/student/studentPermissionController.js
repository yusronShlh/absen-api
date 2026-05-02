import StudentPermissionService from "../../services/student/studentPermissionService.js";
import db from "../../models/index.js";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

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

  static async exportPdf(req, res) {
    try {
      const { id } = req.params;

      const data = await StudentPermissionService.getById(id, req.user.id);

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=surat-izin-${id}.pdf`,
      );

      doc.pipe(res);

      // =========================
      // TITLE
      // =========================
      doc.fontSize(16).text("SURAT IZIN SISWA", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text("Assalamualaikum wr. wb");
      doc.moveDown();

      // =========================
      // TUJUAN
      // =========================
      doc.text("Kepada Yth.");
      doc.text("Kepala Sekolah MA Sumber Payung");
      doc.text("Muhaimin Bahlil S.Ag");
      doc.moveDown();

      // =========================
      // ISI
      // =========================
      doc.text("Dengan hormat,");
      doc.moveDown();

      doc.text(
        `Melalui surat ini, saya ${data.student_name} dari kelas ${data.class_name}, ingin mengajukan izin:`,
      );

      doc.moveDown();

      doc.text(`Tanggal : ${data.start_date} - ${data.end_date}`);
      doc.text(`Keterangan : ${data.type}`);
      doc.moveDown();

      doc.text(`Karena alasan ${data.reason}.`);
      doc.moveDown();

      // =========================
      // LAMPIRAN GAMBAR (opsional)
      // =========================
      if (data.proof_file && fs.existsSync(data.proof_file)) {
        doc.text("Bukti pendukung:");
        doc.moveDown(0.5);

        doc.image(data.proof_file, {
          fit: [300, 300],
          align: "left",
        });

        doc.moveDown();
      }

      doc.text("Bersamaan dengan ini saya lampirkan bukti pendukung izin.");

      doc.moveDown(2);

      // =========================
      // PENUTUP
      // =========================
      doc.text("Hormat saya,");
      doc.moveDown(3);

      doc.text(data.student_name);

      doc.end();
    } catch (err) {
      console.error("[ERROR EXPORT PDF STUDENT]", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}

export default StudentPermissionController;
