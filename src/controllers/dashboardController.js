import DashboardServices from "../services/dashboardServices.js";

class DashboardController {
  static async getDashboard(req, res) {
    try {
      console.log("=== DASHBOARD CONTROLLER START ===");
      console.log("Admin ID: ", req.user?.id);

      const data = await DashboardServices.getDashboardData();

      console.log("Dashboard succes");

      return res.json({ message: "Dashboard data fetched succesfully", data });
    } catch (error) {
      console.log("Dashboard error:", error);

      res.status(500).json({
        message: "Failed to get dashboard data",
        error: error.message,
      });
    }
  }
}
export default DashboardController;
