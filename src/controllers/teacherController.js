import teacherServices from "../services/teacherServices.js";
import XLSX from "xlsx";

class teacherController {
  static async getAll(req, res) {
    try {
      const data = await teacherServices.getAll(req.query);

      res.json({
        meta: { total: data.count, page: Number(req.query.page || 1) },
        teachers: data.rows,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      await teacherServices.create(req.body);

      res.json({ message: "Data guru berhasil di tambahkan" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      await teacherServices.update(req.params.id, req.body);
      console.log(req.params.id, req.body);

      res.json({ message: "Data guru berhasil di perbarui" });
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  static async delete(req, res) {
    try {
      await teacherServices.delete(req.params.id);

      res.json({ message: "Data guru berhasil di hapus" });
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  static async downloadTemplate(req, res) {
    try {
      const workbook = await teacherServices.downloadTemplate();

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="teacher-template.xlsx"',
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      return res.send(buffer);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }

  static async importExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File excel wajib di isi" });
      }

      const result = await teacherServices.importExcel(req.file.buffer);
      return res.json({ message: "Import data guru selesai", ...result });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default teacherController;
