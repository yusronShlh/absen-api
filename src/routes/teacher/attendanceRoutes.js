import express from "express";
import AttendanceController from "../../controllers/teacher/attendanceController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("guru"));

router.get("/schedules", AttendanceController.getSchedules);
router.get("/schedules/:schedule_id/students", AttendanceController.getStudent);

router.post("/attendance", AttendanceController.submitAttendance);

export default router;
