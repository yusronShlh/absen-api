import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Class = sequelize.define(
  "Class",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    homeroom_teacher_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "classes", timestamps: true },
);
export default Class;
