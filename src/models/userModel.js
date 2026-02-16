import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },

    username: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "guru", "siswa") },
    // khusus siswa
    nisn: { type: DataTypes.STRING, allowNull: true, unique: true },
    // khusus guru
    nip: { type: DataTypes.STRING, allowNull: true, unique: true },
  },
  { tableName: "users", timestamps: true },
);

export default User;
