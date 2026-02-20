import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Subject = sequelize.define(
  "Subject",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "subjects",
    timestamps: true,
    indexes: [{ unique: true, fields: ["name", "class_id"] }],
  },
);

export default Subject;
