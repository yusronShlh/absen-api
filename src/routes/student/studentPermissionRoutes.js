import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import StudentPermissionController from "../../controllers/student/studentPermissionController.js";
import upload from "../../middlewares/studentPermissionMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("siswa"));

router.post(
  "/",
  upload.single("proof_file"),
  StudentPermissionController.create,
);
router.get("/", StudentPermissionController.getHistory);
router.get("/permission-types", StudentPermissionController.getTypes);

export default router;
