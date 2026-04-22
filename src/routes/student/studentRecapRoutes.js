import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import StudentRecapController from "../../controllers/student/studentRecapController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("siswa"));

router.get("/semester", StudentRecapController.getSemesterOptions);
router.get("/", StudentRecapController.getRecap);

export default router;
