import express from "express";
import studentController from "../controllers/studentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import uploadExcel from "../middlewares/uploadExcelMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", studentController.getAll);
router.get("/classes", studentController.classSelect);
router.get("/template", studentController.downloadTemplate);
router.post("/", studentController.create);
router.post(
  "/import",
  uploadExcel.single("file"),
  studentController.importExcel,
);
router.post("/promote-class", studentController.promoteClass);
router.post("/graduate-class", studentController.graduateClass);
router.put("/:id", studentController.update);
router.delete("/:id", studentController.delete);

export default router;
