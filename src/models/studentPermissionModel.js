import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudentPermission = sequelize.define(
  "StudentPermission",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    permission_type_id: { type: DataTypes.INTEGER, allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    proof_file: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    approved_by: { type: DataTypes.INTEGER, allowNull: true },
    approved_at: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "student_permissions", timestamps: true },
);

export default StudentPermission;
