import PrincipalTeacherService from "../../services/principal/teacherServices.js";

class PrincipalTeacherController {
  static async getTeachers(req, res) {
    try {
      const result = await PrincipalTeacherService.getTeachers();

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getTeacherDetail(req, res) {
    try {
      const { teacher_id } = req.params;
      const { month, year } = req.query;
      const result = await PrincipalTeacherService.getTeacherDetail({
        teacher_id,
        month,
        year,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  static async getPeriods(req, res) {
    try {
      const data = await PrincipalTeacherService.getPeriods();

      return res.json({
        message: "Berhasil ambil daftar periode",
        data,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
}

export default PrincipalTeacherController;
