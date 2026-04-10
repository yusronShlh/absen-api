import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import TeacherRecapController from "../../controllers/teacher/teacherRecapController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("guru"));

router.get("/semester", TeacherRecapController.getSemesters);
router.get("/", TeacherRecapController.getList);
router.get("/:schedule_id", TeacherRecapController.getDetail);

export default router;
