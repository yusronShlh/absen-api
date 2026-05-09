import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import TeachingAssignmentController from "../controllers/teachingAssignmentController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", TeachingAssignmentController.getAll);
router.get("/options", TeachingAssignmentController.getOptions);
router.post("/", TeachingAssignmentController.create);
router.put("/:id", TeachingAssignmentController.update);
router.delete("/:id", TeachingAssignmentController.delete);

export default router;
