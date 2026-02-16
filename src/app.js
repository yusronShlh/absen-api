import express from "express";
import router from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", router);
app.use("/api/admin/students", studentRoutes);
app.use("/api/admin/teachers", teacherRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Absensi API running" });
});

export default app;
