import StudentPermissionService from "../services/studentPermissionsServices.js";

class StudentPermissionController {
  static async getAll(req, res) {
    try {
      console.log("[CTRL] getAll permissions");
      const data = await StudentPermissionService.getAll();

      res.json({ data });
    } catch (err) {
      console.error("[CTRL] getAll error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async getDetail(req, res) {
    try {
      const { id } = req.params;

      console.log("[CTRL] get permission detail:", id);
      const data = await StudentPermissionService.getById(id);

      res.json(data);
    } catch (err) {
      console.error("[CTRL] getDetail error:", err.message);
      res.status(404).json({ message: err.message });
    }
  }

  static async approve(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      console.log("[CTRL] approve permission:", id, "by", adminId);

      await StudentPermissionService.approve(id, adminId);

      res.json({ message: "Izin di setujui" });
    } catch (err) {
      console.error("[CTRL] approve error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
  static async reject(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      console.log("[CTRL] reject permission:", id, "by", adminId);

      await StudentPermissionService.reject(id, adminId);

      res.json({ message: "Izin Ditolak" });
    } catch (err) {
      console.error("[CTRL] reject error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
}

export default StudentPermissionController;
