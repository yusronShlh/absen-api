import express from "express";
import teacherController from "../controllers/teacherController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import uploadExcel from "../middlewares/uploadExcelMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", teacherController.getAll);
router.get("/template", teacherController.downloadTemplate);
router.post(
  "/import",
  uploadExcel.single("file"),
  teacherController.importExcel,
);
router.post("/", teacherController.create);
router.put("/:id", teacherController.update);
router.delete("/:id", teacherController.delete);

export default router;
