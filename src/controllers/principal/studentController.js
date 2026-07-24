import PrincipalStudentService from "../../services/principal/studentServices.js";

class PrincipalStudentController {
  static async getStudentDetail(req, res) {
    try {
      const { student_id } = req.params;
      const { semester_id, month, year } = req.query;

      const data = await PrincipalStudentService.getStudentDetail({
        student_id,
        semester_id,
        month,
        year,
      });

      return res.json(data);
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  }

  static async getSemesters(req, res) {
    try {
      const data = await PrincipalStudentService.getSemesters();

      return res.json({
        message: "Berhasil ambil semester",
        data,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  }

  static async getPeriods(req, res) {
    try {
      const data = await PrincipalStudentService.getPeriods();

      return res.json({
        message: "Berhasil ambil periode",
        data,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  }
}

export default PrincipalStudentController;
