import express from "express";
import SemesterController from "../controllers/semesterController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", SemesterController.getAll);
router.get("/types", SemesterController.getTypes);
router.post("/", SemesterController.create);
router.put("/:id", SemesterController.update);
router.delete("/:id", SemesterController.delete);

export default router;
