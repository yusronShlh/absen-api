import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TeacherPermission = sequelize.define(
  "TeacherPermission",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    letter: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  { tableName: "teacher_permissions", timestamps: true },
);

export default TeacherPermission;
