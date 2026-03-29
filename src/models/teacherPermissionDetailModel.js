import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TeacherPermissionDetail = sequelize.define(
  "TeacherPermissionDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    permission_id: { type: DataTypes.INTEGER, allowNull: false },
    schedule_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "teacher_permission_details", timestamps: false },
);

export default TeacherPermissionDetail;
