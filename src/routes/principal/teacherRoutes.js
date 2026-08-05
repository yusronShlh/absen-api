import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import PrincipalTeacherController from "../../controllers/principal/teacherController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("principal"));

router.get("/", PrincipalTeacherController.getTeachers);
router.get("/periods", PrincipalTeacherController.getPeriods);
router.get("/:teacher_id", PrincipalTeacherController.getTeacherDetail);

export default router;
