import express from "express";
import cors from "cors";
import router from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import lessonTimeRoutes from "./routes/lessonTimeRoutes.js";
import ScheduleRoutes from "./routes/schedulesRoutes.js";
import studentPermissionRoutes from "./routes/studentPermissionRoutes.js";
import teacherPermissionRotes from "./routes/teacherPermissionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import teacherAttendanceRoutes from "./routes/teacher/attendanceRoutes.js";
import teacherDashboardRoutes from "./routes/teacher/dashboardRoutes.js";
import teacherPermissionsTeacherRoutes from "./routes/teacher/teacherPermissionsRoutes.js";
import studentPermissionStudentRoutes from "./routes/student/studentPermissionRoutes.js";
import attendanceMonitoringRoutes from "./routes/AttendanceMonitoringRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", router);
app.use("/api/admin/students", studentRoutes);
app.use("/api/admin/teachers", teacherRoutes);
app.use("/api/admin/classes", classRoutes);
app.use("/api/admin/subjects", subjectRoutes);
app.use("/api/admin/lesson-times", lessonTimeRoutes);
app.use("/api/admin/schedules", ScheduleRoutes);
app.use("/api/admin/student-permissions", studentPermissionRoutes);
app.use("/api/admin/teacher-permissions", teacherPermissionRotes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/attendance-monitoring", attendanceMonitoringRoutes);

app.use("/api/teacher", teacherAttendanceRoutes);
app.use("/api/teacher/dashboard", teacherDashboardRoutes);
app.use("/api/teacher/teacher-permission", teacherPermissionsTeacherRoutes);

app.use("/api/student/permissions", studentPermissionStudentRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Absensi API running" });
});

export default app;
