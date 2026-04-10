import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Semester = sequelize.define(
  "Semester",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    academic_year: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("ganjil", "genap"), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  { tableName: "semesters", timestamps: true },
);
export default Semester;
