import TeacherPermissionServices from "../services/teacherPermissionServices.js";

TeacherPermissionServices;

class TeacherPermissionsController {
  static async getAll(req, res) {
    try {
      console.log("[CTRL] getAll teacher permissions");
      const data = await TeacherPermissionServices.getAll();

      res.json({ data });
    } catch (err) {
      console.error("❌ getAll error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async getDetail(req, res) {
    try {
      const { id } = req.params;
      console.log("[CTRL] getById:", id);

      const data = await TeacherPermissionServices.getById(id);
      res.json(data);
    } catch (err) {
      console.error("❌ getDetail error:", err.message);
      res.status(404).json({ message: err.message });
    }
  }

  static async approve(req, res) {
    try {
      const { id } = req.params;
      console.log("[CTRL] approve:", id);
      await TeacherPermissionServices.approve(id);

      res.json({ message: "Izin di setujui" });
    } catch (err) {
      console.error("❌ approve error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async reject(req, res) {
    try {
      const { id } = req.params;
      console.log("[CTRL] getById:", id);

      await TeacherPermissionServices.reject(id);

      res.json({ message: "Izin di tolak" });
    } catch (err) {
      console.error("❌ reject error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
}

export default TeacherPermissionsController;
