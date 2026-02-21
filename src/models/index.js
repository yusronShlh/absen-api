import sequelize from "../config/db.js";
import Class from "./classModel.js";
import LessonTime from "./lessonTimeModel.js";
import Schedule from "./scheduleModel.js";
import Student from "./studentModel.js";
import StudentPermission from "./studentPermissionModel.js";
import Subject from "./subjectModel.js";
import TeacherPermission from "./teacherPermissionsModel.js";
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

// class - subject
Subject.belongsTo(Class, { foreignKey: "class_id" });
Class.hasMany(Subject, { foreignKey: "class_id" });

// teacher -subject
Subject.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
User.hasMany(Subject, { foreignKey: "teacher_id", as: "subjects" });

// kelola jadwal

// class -schedule
Schedule.belongsTo(Class, { foreignKey: "class_id" });
Class.hasMany(Schedule, { foreignKey: "class_id" });

// lessontime -schedule
Schedule.belongsTo(LessonTime, { foreignKey: "lesson_time_id" });
LessonTime.hasMany(Schedule, { foreignKey: "lesson_time_id" });

// subject -schedule
Schedule.belongsTo(Subject, { foreignKey: "subject_id" });
Subject.hasMany(Schedule, { foreignKey: "subject_id" });

// teacher - schedule
Schedule.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
User.hasMany(Schedule, { foreignKey: "teacher_id", as: "teachingSchedules" });

// === STUDENT PERMISSIONS ===
StudentPermission.belongsTo(Student, { foreignKey: "student_id" });
Student.hasMany(StudentPermission, { foreignKey: "student_id" });

// class
StudentPermission.belongsTo(Class, { foreignKey: "class_id" });
Class.hasMany(StudentPermission, { foreignKey: "class_id" });

// approver
StudentPermission.belongsTo(User, {
  foreignKey: "approved_by",
  as: "approver",
});
User.hasMany(StudentPermission, {
  foreignKey: "approved_by",
  as: "approvedPermissions",
});

// === TEACHER PERMISSION ===

TeacherPermission.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });
User.hasMany(TeacherPermission, {
  foreignKey: "teacher_id",
  as: "teacherPermissions",
});

export default db;
