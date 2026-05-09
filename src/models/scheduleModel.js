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
    teaching_assignment_id: { type: DataTypes.INTEGER, allowNull: false },
    lesson_time_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "schedules", timestamps: true },
);

export default Schedule;
