import AppVersionService from "../services/appVersionServices.js";

class AppVersionController {
  static async getVersion(req, res) {
    try {
      const data = AppVersionService.getVersion();

      return res.json({
        message: "Berhasil mengambil versi terbaru aplikasi",
        data,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}

export default AppVersionController;
