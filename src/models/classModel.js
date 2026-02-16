import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Class = sequelize.define(
  "Class",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "classes", timestamps: true },
);
export default Class;
