import StudentDashboardService from "../../services/student/studentDashboard.js";

class StudentDashboardController {
  static async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      const data = await StudentDashboardService.getDashboard(userId);

      return res.json({
        message: "Student dashboard fetched successfully",
        data,
      });
    } catch (err) {
      console.error("[ERROR] STUDENT DASHBOARD:", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}
export default StudentDashboardController;
