import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import AdminAttendanceController from "../controllers/adminAttendanceController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/classes", AdminAttendanceController.getClasses);
router.get("/schedules", AdminAttendanceController.getSchedules);
router.get("/", AdminAttendanceController.getFrom);
router.post("/", AdminAttendanceController.createAttendance);
router.put("/", AdminAttendanceController.updateAttendance);

export default router;
