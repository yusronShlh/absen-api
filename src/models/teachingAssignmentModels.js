import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TeachingAssignment = sequelize.define(
  "TeachingAssignment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "teaching_assignments", timestamps: true },
);

export default TeachingAssignment;
