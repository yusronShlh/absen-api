import express from "express";
import lessonTimeController from "../controllers/lessonTimeController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", lessonTimeController.getAll);
router.post("/", lessonTimeController.create);
router.put("/:id", lessonTimeController.update);
router.delete("/:id", lessonTimeController.delete);

export default router;
