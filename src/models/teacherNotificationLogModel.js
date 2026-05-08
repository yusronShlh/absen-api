import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TeacherNotificationLog = sequelize.define(
  "TeacherNotificationLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    schedule_id: { type: DataTypes.INTEGER, allowNull: false },

    date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  {
    tableName: "teacher_notification_logs",
    timestamps: false,
  },
);

export default TeacherNotificationLog;
