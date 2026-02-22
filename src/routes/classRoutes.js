import express from "express";
import classController from "../controllers/classController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", classController.getAll);
router.post("/", classController.create);
router.put("/:id", classController.update);
router.delete("/:id", classController.delete);
router.get("/select/teachers", classController.select);
router.get("/:id/detail", classController.detail);

// selection guru

export default router;
