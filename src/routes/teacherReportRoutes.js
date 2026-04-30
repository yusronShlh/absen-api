import express from "express";
import TeacherReportController from "../controllers/teacherReportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/semesters", TeacherReportController.getAll);
router.get("/teachers", TeacherReportController.getTeachers);
router.get("/", TeacherReportController.getReport);
router.get("/export", TeacherReportController.exportPdf);

export default router;
