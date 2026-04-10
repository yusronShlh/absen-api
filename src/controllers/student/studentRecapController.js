import StudentRecapService from "../../services/student/studentRecapServices.js";

class StudentRecapController {
  static async getRecap(req, res) {
    try {
      const user_id = req.user.id;
      const { semester_id } = req.query;

      console.log("\n=== [CONTROLLER] STUDENT RECAP ===");
      console.log("User:", user_id);
      console.log("Semester:", semester_id);

      const data = await StudentRecapService.getRecap({ user_id, semester_id });

      res.json({ message: "Berhasil ambil rekap absensi siswa", data });
    } catch (err) {
      console.error("[ERROR RECAP]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getSemesterOptions(req, res) {
    try {
      console.log("\n=== [CONTROLLER] GET SEMESTER OPTIONS ===");

      const data = await StudentRecapService.getSemesterOptions();

      res.json({ message: "Berhasil ambil daftar semester", data });
    } catch (err) {
      console.error("[ERROR SEMESTER OPTIONS]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}

export default StudentRecapController;
