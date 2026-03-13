import AttendaceService from "../../services/teacher/attendanceService.js";

class AttendanceController {
  static async getSchedules(req, res) {
    try {
      const teacherId = req.user.id;

      const schedules = await AttendaceService.getTodaySchedules(teacherId);

      res.json({ message: "Schedules fetched successfully", data: schedules });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getStudent(req, res) {
    try {
      const teacherId = req.user.id;
      const { schedule_id } = req.params;

      console.log("PARAM: ", req.params);

      const data = await AttendaceService.getStudentBySchedule(
        schedule_id,
        teacherId,
      );

      res.json({ message: "Students fetched successfully", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async submitAttendance(req, res) {
    try {
      const teacherId = req.user.id;

      const session = await AttendaceService.submitAttendance(
        teacherId,
        req.body,
      );

      res.json({ message: "Attendance submitted successfully", data: session });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default AttendanceController;
