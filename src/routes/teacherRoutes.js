import express from "express";
import teacherController from "../controllers/teacherController.js";
import authMiddleware from "../middlewares/authMiddleware..js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", teacherController.getAll);
router.post("/", teacherController.create);
router.put("/:id", teacherController.update);
router.delete("/:id", teacherController.delete);

export default router;
