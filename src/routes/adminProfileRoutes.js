import express from "express";
import AdminProfileController from "../controllers/adminProfileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", authMiddleware, AdminProfileController.getProfile);

router.patch("/", authMiddleware, AdminProfileController.updateProfile);

export default router;
