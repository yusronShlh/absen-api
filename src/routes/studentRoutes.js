import express from "express";
import studentController from "../controllers/studentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", studentController.getAll);
router.post("/", studentController.create);
router.put("/:id", studentController.update);
router.delete("/:id", studentController.delete);

export default router;
