import StudentReportService from "../services/studentReportServices.js";

class StudentReportController {
  static async getReport(req, res) {
    try {
      const { class_id, schedule_id } = req.query;

      if (!class_id) {
        return res.status(400).json({ message: "kelas wajib di isi" });
      }

      const data = await StudentReportService.getReport({
        class_id,
        schedule_id,
      });

      return res.json({
        message: "Berhasil ambil laporan absensi siswa",
        data,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default StudentReportController;
