import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import roleMiddleware from "../../middlewares/roleMiddleware.js";
import PrincipalClassController from "../../controllers/principal/classController.js";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("principal"));

router.get("/", PrincipalClassController.getClasses);

router.get("/:class_id", PrincipalClassController.getClassDetail);

export default router;
