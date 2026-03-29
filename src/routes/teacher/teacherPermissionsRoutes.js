import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import uploadPermission from "../../middlewares/uploadPermissionMiddleware.js";
import TeacherPermissionControllers from "../../controllers/teacher/teacherPermissionController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("guru"));

router.get(
  "/schedules/by-date",
  TeacherPermissionControllers.getSchedulesByDate,
);
router.post(
  "/",
  uploadPermission.single("letter"),
  TeacherPermissionControllers.create,
);

export default router;
