import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import PrincipalDashboardController from "../../controllers/principal/dashboardController.js";

const router = Router();

router.get("/", authMiddleware, PrincipalDashboardController.getDashboard);

export default router;
