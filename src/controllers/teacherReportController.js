import TeacherReportService from "../services/teacherReportServices.js";

class TeacherReportController {
  static async getReport(req, res) {
    try {
      const { semester_id, teacher_id } = req.query;

      if (!semester_id) {
        return res.status(400).json({ message: "semester wajib di isi" });
      }

      const data = await TeacherReportService.getReport({
        semester_id,
        teacher_id,
      });

      res.json({ message: "Berhasil ambil laporan absen guru", data });
    } catch (err) {
      console.error("[ERROR]", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const data = await TeacherReportService.getAll();

      return res.json({ message: "Berhasil ambil data semester", data });
    } catch (err) {
      console.error("[ERROR] GET SEMESTERS:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getTeachers(req, res) {
    try {
      const { semester_id } = req.query;

      if (!semester_id) {
        return res.status(400).json({ message: "Semester wajib di isi" });
      }

      const data = await TeacherReportService.getBySemesters(semester_id);

      return res.json({ message: "Berhasil ambil data guru", data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}
export default TeacherReportController;
