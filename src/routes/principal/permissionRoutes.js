import express from "express";
import PrincipalPermissionController from "../../controllers/principal/permissionController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("principal"));

router.get("/", PrincipalPermissionController.getAll);
router.get("/teachers/:id", PrincipalPermissionController.getTeacherDetail);
router.get("/students/:id", PrincipalPermissionController.getStudentDetail);

export default router;
