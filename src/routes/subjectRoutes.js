import express from "express";
import subjcetController from "../controllers/subjectController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", subjcetController.getAll);
router.post("/", subjcetController.create);
router.put("/:id", subjcetController.update);
router.delete("/:id", subjcetController.delete);
router.get("/:id", subjcetController.detail);
router.get("/form/options", subjcetController.formOptions);

export default router;
