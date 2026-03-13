import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AttendanceDetail = sequelize.define(
  "AttendanceDetail",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    attendance_session_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("hadir", "izin", "sakit", "alpha"),
      allowNull: false,
    },
  },
  { tableName: "attendance_details", timestamps: true },
);

export default AttendanceDetail;
