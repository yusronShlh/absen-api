import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import PrincipalStudentController from "../../controllers/principal/studentController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("principal"));

router.get("/periods", PrincipalStudentController.getPeriods);

router.get("/semesters", PrincipalStudentController.getSemesters);

router.get("/:student_id", PrincipalStudentController.getStudentDetail);

export default router;
