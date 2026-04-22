import TeacherRecapService from "../../services/teacher/teacherRecapServices.js";

class TeacherRecapController {
  static async getList(req, res) {
    try {
      const teacher_id = req.user.id;

      console.log("\n=== [CONTROLLER] RECAP LIST ===");
      console.log("Teacher:", teacher_id);

      const data = await TeacherRecapService.getList(teacher_id);

      res.json({ message: "List rekap berhasil ", data });
    } catch (err) {
      console.error("[ERROR LIST]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getDetail(req, res) {
    try {
      const teacher_id = req.user.id;
      const { subject_id, class_id, semester_id } = req.query;

      console.log("\n=== [CONTROLLER] RECAP DETAIL ===");
      console.log("Teacher:", teacher_id);
      console.log("Subjcet:", subject_id);
      console.log("Class:", class_id);
      console.log("Semester:", semester_id);

      const data = await TeacherRecapService.getDetail({
        teacher_id,
        subject_id,
        class_id,
        semester_id,
      });

      res.json({ message: "Detail rekap berhasil", data });
    } catch (err) {
      console.error("[ERROR DETAIL]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getSemesters(req, res) {
    try {
      console.log("\n=== [CONTROLLER] TEACHER SEMESTER DROPDOWN ===");

      const data = await TeacherRecapService.getSemesters();

      res.json({ message: "Berhasil ambil semester", data });
    } catch (err) {
      console.error("[ERROR SEMESTER]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}
export default TeacherRecapController;
