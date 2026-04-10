import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AttendanceSession = sequelize.define(
  "AttendanceSession",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schedule_id: { type: DataTypes.INTEGER, allowNull: false },
    meeting_number: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    is_teacher_present: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "attendance_sessions", timestamps: true },
);

export default AttendanceSession;
