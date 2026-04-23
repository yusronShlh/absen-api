import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import StudentReportController from "../controllers/studentReportController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/classes", StudentReportController.classSelect);
router.get("/subjects", StudentReportController.getSubjects);
router.get("/", StudentReportController.getReport);

export default router;
