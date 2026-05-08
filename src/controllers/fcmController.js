import db from "../models/index.js";

const { User } = db;

class FcmController {
  static async saveToken(req, res) {
    try {
      const user_id = req.user.id;
      const { fcm_token } = req.body;

      if (!fcm_token) {
        return res.status(400).json({ message: "FCM token wajib di isi" });
      }

      await User.update({ fcm_token }, { where: { id: user_id } });

      res.json({ message: "FCM token berhasil di simpan" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default FcmController;
