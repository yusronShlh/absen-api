import StudentReportService from "../services/studentReportServices.js";

class StudentReportController {
  static async getReport(req, res) {
    try {
      const { class_id, subject_id } = req.query;

      if (!class_id) {
        return res.status(400).json({ message: "kelas wajib di isi" });
      }

      const data = await StudentReportService.getReport({
        class_id,
        subject_id,
      });

      return res.json({
        message: "Berhasil ambil laporan absensi siswa",
        data,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async classSelect(req, res) {
    try {
      const data = await StudentReportService.getClass();

      res.json({ data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getSubjects(req, res) {
    try {
      const { class_id } = req.query;

      if (!class_id) {
        return res.status(400).json({ message: "kelas wwajib di pilih " });
      }

      const data = await StudentReportService.getSubjectsByClass(class_id);

      return res.json({ message: "Berhasil ambil mata pelajaran", data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default StudentReportController;
