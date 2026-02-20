import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const lessonTime = sequelize.define(
  "LessonTime",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    type: {
      type: DataTypes.ENUM("lesson", "break", "ishoma", "other"),
      defaultValue: "lesson",
    },
  },
  { tableName: "lesson_times", timestamps: true },
);

export default lessonTime;
