import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PermissionType = sequelize.define(
  "PermissionType",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "permission_types", timestamps: true },
);

export default PermissionType;
