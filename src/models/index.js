import sequelize from "../config/db.js";
import Class from "./classModel.js";
import Student from "./studentModel.js";
import User from "./userModel.js";

const db = {};
db.sequelize = sequelize;
db.User = User;
db.Student = Student;
db.Class = Class;

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

export default db;
