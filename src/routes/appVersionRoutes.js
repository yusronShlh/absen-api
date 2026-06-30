import express from "express";
import AppVersionController from "../controllers/appVersionController.js";

const router = express.Router();

router.get("/version", AppVersionController.getVersion);

export default router;
