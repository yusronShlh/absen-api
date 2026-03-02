import express from "express";
import subjectController from "../controllers/subjectController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", subjectController.getAll);
// router.get("/form-options", subjectController.formOptions);
router.post("/", subjectController.create);
router.put("/:id", subjectController.update);
router.delete("/:id", subjectController.delete);
router.get("/:id", subjectController.detail);

export default router;
