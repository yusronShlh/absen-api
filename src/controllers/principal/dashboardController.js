import PrincipalDashboardService from "../../services/principal/dashboardServices.js";

class PrincipalDashboardController {
  static async getDashboard(req, res, next) {
    try {
      const result = await PrincipalDashboardService.getDashboard();

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default PrincipalDashboardController;
