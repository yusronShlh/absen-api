import express from "express";
import NotificationController from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, NotificationController.getMyNotifications);
router.patch("/:id/read", authMiddleware, NotificationController.markAsRead);

export default router;
