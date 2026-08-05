import PrincipalPermissionService from "../../services/principal/permissionServices.js";

class PrincipalPermissionController {
  static async getAll(req, res) {
    try {
      const data = await PrincipalPermissionService.getAll();

      res.json({ data });
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
  }

  static async getTeacherDetail(req, res) {
    try {
      const { id } = req.params;

      const data = await PrincipalPermissionService.getTeacherDetail(id);

      res.json(data);
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  }

  static async getStudentDetail(req, res) {
    try {
      const { id } = req.params;

      const data = await PrincipalPermissionService.getStudentDetail(id);

      res.json(data);
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  }
}

export default PrincipalPermissionController;
