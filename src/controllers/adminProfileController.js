import AdminProfileService from "../services/adminProfileServices.js";

class AdminProfileController {
  static async getProfile(req, res) {
    try {
      const data = await AdminProfileService.getProfile(req.user.id);

      res.json({
        message: "Berhasil ambil profil admin",
        data,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const data = await AdminProfileService.updateProfile(
        req.user.id,
        req.body,
      );

      res.json({
        message: "Profil berhasil diperbarui",
        data,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
}

export default AdminProfileController;
