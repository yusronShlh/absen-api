import PrincipalClassService from "../../services/principal/classServices.js";

class PrincipalClassController {
  static async getClasses(req, res) {
    try {
      const data = await PrincipalClassService.getClasses();

      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getClassDetail(req, res) {
    try {
      const { class_id } = req.params;
      const data = await PrincipalClassService.getClassDetail(class_id);

      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default PrincipalClassController;
