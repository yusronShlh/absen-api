import sequelize from "../config/db.js";
import AttendanceDetail from "./attendanceDetailModel.js";
import AttendanceSession from "./attendanceSessionsModel.js";
import Class from "./classModel.js";
import LessonTime from "./lessonTimeModel.js";
import Notification from "./notificationModel.js";
import PermissionType from "./permissionTypeModel.js";
import Schedule from "./scheduleModel.js";
import Semester from "./semesterModel.js";
import Student from "./studentModel.js";
import StudentPermission from "./studentPermissionModel.js";
import Subject from "./subjectModel.js";
import TeacherNotificationLog from "./teacherNotificationLogModel.js";
import TeacherPermissionDetail from "./teacherPermissionDetailModel.js";
import TeacherPermission from "./teacherPermissionsModel.js";
import TeachingAssignment from "./teachingAssignmentModels.js";
import User from "./userModel.js";

const db = {};
db.sequelize = sequelize;
db.User = User;
db.Student = Student;
db.Class = Class;
db.Subject = Subject;
db.LessonTime = LessonTime;
db.Schedule = Schedule;
db.StudentPermission = StudentPermission;
db.TeacherPermission = TeacherPermission;
db.TeacherPermissionDetail = TeacherPermissionDetail;
db.AttendanceSession = AttendanceSession;
db.AttendanceDetail = AttendanceDetail;
db.PermissionType = PermissionType;
db.Semester = Semester;
db.Notification = Notification;
db.TeacherNotificationLog = TeacherNotificationLog;
db.TeachingAssignment = TeachingAssignment;
// relations
// User -student
Student.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(Student, { foreignKey: "user_id", onDelete: "CASCADE" });

// class- student(1;many)

Student.belongsTo(Class, { foreignKey: "class_id" });
Class.hasMany(Student, { foreignKey: "class_id" });

// class - homeroom
Class.belongsTo(User, {
  foreignKey: "homeroom_teacher_id",
  as: "homeroomTeacher",
});

User.hasMany(Class, { foreignKey: "homeroom_teacher_id" });

// kelola jadwal
// teaching assignment - schedule
Schedule.belongsTo(TeachingAssignment, {
  foreignKey: "teaching_assignment_id",
});

TeachingAssignment.hasMany(Schedule, {
  foreignKey: "teaching_assignment_id",
});

// lesson time - schedule
Schedule.belongsTo(LessonTime, {
  foreignKey: "lesson_time_id",
});

LessonTime.hasMany(Schedule, {
  foreignKey: "lesson_time_id",
});
// class
// StudentPermission.belongsTo(Class, { foreignKey: "class_id" });
// Class.hasMany(StudentPermission, { foreignKey: "class_id" });

// approver
StudentPermission.belongsTo(User, {
  foreignKey: "approved_by",
  as: "approver",
});
User.hasMany(StudentPermission, {
  foreignKey: "approved_by",
  as: "approvedPermissions",
});

// relasi permission type student
StudentPermission.belongsTo(PermissionType, {
  foreignKey: "permission_type_id",
});

PermissionType.hasMany(StudentPermission, {
  foreignKey: "permission_type_id",
});

// student permission -> student
StudentPermission.belongsTo(Student, {
  foreignKey: "student_id",
});

Student.hasMany(StudentPermission, {
  foreignKey: "student_id",
});
// === TEACHER PERMISSION ===

TeacherPermission.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
User.hasMany(TeacherPermission, {
  foreignKey: "teacher_id",
  as: "teacherPermissions",
});

TeacherPermission.hasMany(TeacherPermissionDetail, {
  foreignKey: "permission_id",
  as: "details",
});
TeacherPermissionDetail.belongsTo(TeacherPermission, {
  foreignKey: "permission_id",
});
TeacherPermissionDetail.belongsTo(Schedule, { foreignKey: "schedule_id" });
Schedule.hasMany(TeacherPermissionDetail, { foreignKey: "schedule_id" });
// ==== RELASI RELASI DI ROLE GURU  =====

// schedule -> attendance sessions
AttendanceSession.belongsTo(Schedule, { foreignKey: "schedule_id" });
Schedule.hasMany(AttendanceSession, { foreignKey: "schedule_id" });

// session -> detail
AttendanceDetail.belongsTo(AttendanceSession, {
  foreignKey: "attendance_session_id",
});
AttendanceSession.hasMany(AttendanceDetail, {
  foreignKey: "attendance_session_id",
});

// student - detail
AttendanceDetail.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(AttendanceDetail, { foreignKey: "student_id" });

// relasi permission type student
StudentPermission.belongsTo(PermissionType, {
  foreignKey: "permission_type_id",
});
PermissionType.hasMany(StudentPermission, { foreignKey: "permission_type_id" });

// NOTIFIKASI RELASI
Notification.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Notification, { foreignKey: "user_id" });

// teaching assignment
// class
TeachingAssignment.belongsTo(Class, { foreignKey: "class_id" });
Class.hasMany(TeachingAssignment, { foreignKey: "class_id" });

// subject
TeachingAssignment.belongsTo(Subject, { foreignKey: "subject_id" });
Subject.hasMany(TeachingAssignment, { foreignKey: "subject_id" });

// teacher
TeachingAssignment.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
User.hasMany(TeachingAssignment, {
  foreignKey: "teacher_id",
  as: "teachingAssignments",
});

export default db;
