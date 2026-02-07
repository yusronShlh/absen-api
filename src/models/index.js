import sequelize from "../config/db.js";
import User from "./userModel.js";

const db = {};
db.sequelize = sequelize;
db.User = User;

export default db;
