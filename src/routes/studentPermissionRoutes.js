import express from "express";
import StudentPermissionController from "../controllers/studentPermissionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", StudentPermissionController.getAll);
router.get("/:id", StudentPermissionController.getDetail);
router.put("/:id/approve", StudentPermissionController.approve);
router.put("/:id/reject", StudentPermissionController.reject);

export default router;
