import TeacherPermissionService from "../../services/teacher/teacherPermissionService.js";

class TeacherPermissionControllers {
  static async create(req, res) {
    try {
      console.log("=== CONTROLLER CREATE TEACHER PERMISSION ===");

      const teacher_id = req.user.id;
      console.log("👨‍🏫 Teacher ID:", teacher_id);

      const { start_date, end_date, reason, is_full_day, schedules } = req.body;
      console.log("📌 Request body:", req.body);

      let fileName = null;

      if (req.file) {
        fileName = req.file.filename;
        console.log("📎 Uploaded file:", fileName);
      }

      const permission = await TeacherPermissionService.createPermission({
        teacher_id,
        start_date,
        end_date,
        reason,
        is_full_day,
        schedules,
        letter: fileName,
      });

      res
        .status(201)
        .json({ message: "Permission request submitted", data: permission });
    } catch (err) {
      console.log("❌ ERROR:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
  static async getSchedulesByDate(req, res) {
    console.log("=== CONTROLLER GET SCHEDULES BY DATE ===");
    try {
      const teacherId = req.user.id;
      const { start, end } = req.query;

      console.log("📌 Query:", { start, end });
      console.log("👨‍🏫 Teacher ID:", teacherId);

      const data = await TeacherPermissionService.getScheduleByDate({
        teacherId,
        start,
        end,
      });

      res.json({ message: "Schedules fetched", data });
    } catch (err) {
      console.log("❌ ERROR:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
}

export default TeacherPermissionControllers;
