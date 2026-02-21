import express from "express";
import teacherPermissionsController from "../controllers/teacherPermissionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", teacherPermissionsController.getAll);
router.get("/:id", teacherPermissionsController.getDetail);
router.put("/:id/approve", teacherPermissionsController.approve);
router.put("/:id/reject", teacherPermissionsController.reject);

export default router;
