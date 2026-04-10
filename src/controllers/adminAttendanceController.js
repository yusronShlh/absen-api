import AdminAttendanceServices from "../services/adminAttendanceServices.js";

class AdminAttendanceController {
  static async getFrom(req, res) {
    try {
      const { schedule_id, date } = req.query;

      const data = await AdminAttendanceServices.getFrom({ schedule_id, date });

      res.json({ message: "Form fetched", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async createAttendance(req, res) {
    try {
      const adminId = req.user.id;

      const session = await AdminAttendanceServices.createAttendance({
        ...req.body,
        adminId,
      });

      res.json({ message: "Attendance created", data: session });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async updateAttendance(req, res) {
    try {
      await AdminAttendanceServices.updateAttendance(req.body);

      res.json({ message: "Attendance updated" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getClasses(req, res) {
    try {
      const data = await AdminAttendanceServices.getClasses(req.query);

      res.json({ message: "Classes fetched", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getSchedules(req, res) {
    try {
      const data = await AdminAttendanceServices.getSchedules(req.query);

      res.json({ message: "Schedules fetched", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default AdminAttendanceController;
