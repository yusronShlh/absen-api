import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Schedule = sequelize.define(
  "Schedule",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    day: {
      type: DataTypes.ENUM(
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu",
        "minggu",
      ),
      allowNull: false,
    },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    lesson_time_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "schedules", timestamps: true },
);

export default Schedule;
