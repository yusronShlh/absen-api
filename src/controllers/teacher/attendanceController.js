import AttendaceService from "../../services/teacher/attendanceService.js";

class AttendanceController {
  static async getSchedules(req, res) {
    try {
      const teacherId = req.user.id;

      // CCTV 1: Cek identitas user yang login
      console.log("📸 [GET SCHEDULES] Teacher ID:", teacherId);

      const schedules = await AttendaceService.getTodaySchedules(teacherId);

      // CCTV 2: Cek apakah data dari Service keluar atau kosong
      console.log(
        `✅ [GET SCHEDULES] Found ${schedules?.length || 0} schedules`,
      );

      res.json({ message: "Schedules fetched successfully", data: schedules });
    } catch (err) {
      console.error("❌ [GET SCHEDULES] Error:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getStudent(req, res) {
    try {
      const teacherId = req.user.id;
      const { schedule_id } = req.params;

      // CCTV 3: Validasi input dari URL
      console.log("📸 [GET STUDENT] Params:", { schedule_id, teacherId });

      console.log("PARAM: ", req.params);

      const data = await AttendaceService.getStudentBySchedule(
        schedule_id,
        teacherId,
      );
      // CCTV 4: Cek struktur data siswa yang dikembalikan
      console.log("✅ [GET STUDENT] Data fetched successfully");

      res.json({ message: "Students fetched successfully", data });
    } catch (err) {
      console.error("❌ [GET STUDENT] Error:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async submitAttendance(req, res) {
    console.log("--- [POST] Submit Attendance Start ---");

    try {
      const teacherId = req.user.id;

      console.log(`[FE Debug] Teacher: ${teacherId} | Payload:`, req.body);

      const session = await AttendaceService.submitAttendance(
        teacherId,
        req.body,
      );

      console.log("--- [POST] Submit Attendance End ---");

      res.json({ message: "Attendance submitted successfully", data: session });
    } catch (err) {
      console.error(`[Error] ${err.message}`);
      res.status(400).json({ message: err.message });
    }
  }
}

export default AttendanceController;
