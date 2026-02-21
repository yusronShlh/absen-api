import express from "express";
import ScheduleController from "../controllers/scheduleController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.post("/", ScheduleController.create);
router.get("/", ScheduleController.getAll);
router.put("/:id", ScheduleController.update);
router.delete("/:id", ScheduleController.delete);
router.get("/form-options", ScheduleController.getFormOption);

export default router;
