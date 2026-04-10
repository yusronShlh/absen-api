import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import StudentDashboardController from "../../controllers/student/studentDashboard.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("siswa"));

router.get("/", StudentDashboardController.getDashboard);

export default router;
