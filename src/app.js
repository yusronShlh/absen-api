import express from "express";
import router from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import lessonTimeRoutes from "./routes/lessonTimeRoutes.js";
import ScheduleRoutes from "./routes/schedulesRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", router);
app.use("/api/admin/students", studentRoutes);
app.use("/api/admin/teachers", teacherRoutes);
app.use("/api/admin/classes", classRoutes);
app.use("/api/admin/subjects", subjectRoutes);
app.use("/api/admin/lesson-times", lessonTimeRoutes);
app.use("/api/admin/schedules", ScheduleRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Absensi API running" });
});

export default app;
