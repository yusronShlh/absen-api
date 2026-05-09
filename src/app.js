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
import adminAttendanceRoutes from "./routes/adminAttendanceRoutes.js";
import studentReportRoutes from "./routes/studentReportRoutes.js";
import teacherReportRoutes from "./routes/teacherReportRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import teachingAssignmentRoutes from "./routes/teachingAssignmentRoutes.js";
import StudentDashboardRoutes from "./routes/student/studentDashboardRoutes.js";
import StudentRecapRoutes from "./routes/student/studentRecapRoutes.js";
import teacherRecapRoutes from "./routes/teacher/teacherRecapRoutes.js";
import path from "path";
import notificationRoutes from "./routes/notificationRoutes.js";
import fcmRoutes from "./routes/fcmRoutes.js";

const app = express();
app.use(cors({ origin: ["https://admin.auroranova.my.id"] }));
app.use(express.json());

app.use("/uploads", express.static(path.join("uploads")));

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
app.use("/api/admin/admin-attendance", adminAttendanceRoutes);
app.use("/api/admin/reports/student-attendance", studentReportRoutes);
app.use("/api/admin/reports/teacher-attendance", teacherReportRoutes);
app.use("/api/admin/semesters", semesterRoutes);
app.use("/api/admin/teaching-assignments", teachingAssignmentRoutes);

app.use("/api/teacher", teacherAttendanceRoutes);
app.use("/api/teacher/dashboard", teacherDashboardRoutes);
app.use("/api/teacher/teacher-permission", teacherPermissionsTeacherRoutes);
app.use("/api/teacher/recap", teacherRecapRoutes);

app.use("/api/student/permissions", studentPermissionStudentRoutes);
app.use("/api/student/dashboard", StudentDashboardRoutes);
app.use("/api/student/recap", StudentRecapRoutes);

app.use(express.static("public"));

// notifikasi
app.use("/api/notifications", notificationRoutes);
app.use("/api/fcm", fcmRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Absensi API running" });
});

app.use((req, res, next) => {
  res.status(404).json({ message: "Route tidak di temukan" });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res
      .status(400)
      .json({ message: "Data tidak bisa di hapus karena masih di gunakan" });
  }
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Eror" });
});

export default app;
