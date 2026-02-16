import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./userModel.js";

const Student = sequelize.define(
  "Student",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    gender: { type: DataTypes.ENUM("L", "P"), allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "student", timestamps: true },
);

// //relation
// Student.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
// User.hasOne(Student, { foreignKey: "user_id" });

export default Student;
