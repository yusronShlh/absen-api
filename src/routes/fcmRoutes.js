import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import FcmController from "../controllers/fcmController.js";

const router = express.Router();

router.post("/token", authMiddleware, FcmController.saveToken);

export default router;
