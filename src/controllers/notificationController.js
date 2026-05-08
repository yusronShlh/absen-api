import NotificationService from "../services/notificationServices.js";

class NotificationController {
  static async getMyNotifications(req, res) {
    try {
      const user_id = req.user.id;

      const data = await NotificationService.getByUser(user_id);

      res.json({ data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const data = await NotificationService.markAsRead(id, user_id);

      res.json({ message: "Notif dibaca", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default NotificationController;
