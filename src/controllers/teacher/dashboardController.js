import DashboardService from "../../services/teacher/dashboardService.js";

class DashboardController {
  static async getDashboard(req, res) {
    try {
      const teacherId = req.user.id;
      const data = await DashboardService.getDashboard(teacherId);

      res.json(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      res.status(500).json({ message: err.message });
    }
  }
}

export default DashboardController;
