import express from "express";
import MonitoringController from "../controllers/attendanceMonitoringController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/classes", MonitoringController.getClass);
router.get("/", MonitoringController.getMonitoring);
router.get("/:schedule_id/detail", MonitoringController.getAttendanceDetail);
router.put("/", MonitoringController.editAttendance);

export default router;
