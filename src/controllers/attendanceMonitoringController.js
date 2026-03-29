import MonitoringService from "../services/attendanceMonitoringServices.js";

class MonitoringController {
  static async getMonitoring(req, res) {
    try {
      console.log("=== [CTRL] GET Monitoring ===");
      console.log("[CTRL] Query:", req.query);

      const { date, class_id } = req.query;

      const data = await MonitoringService.getMonitoring({ date, class_id });

      res.json(data);
    } catch (err) {
      console.error("[ERROR] Monitoring:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async editAttendance(req, res) {
    try {
      const adminId = req.user.id;
      const { schedule_id, date, attendances, is_teacher_present } = req.body;

      await MonitoringService.editAttendance({
        schedule_id,
        date,
        attendances,
        is_teacher_present,
        adminId,
      });

      return res.json({ message: "Attendance berhasil diperbarui" });
    } catch (err) {
      res.json(400).json({ message: err.message });
    }
  }
}

export default MonitoringController;
