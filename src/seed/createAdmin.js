import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";
import User from "../models/userModel.js";

async function createAdmin() {
  try {
    await sequelize.authenticate();

    const username = "admin";
    const password = "admin123";

    //Cek apakah admin sudah ada
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      console.log("Admin sudah ada");
      process.exit();
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // buat admin
    await User.create({
      name: "Administrator",
      username: username,
      password: hash,
      role: "admin",
    });

    console.log("Admin berhasil di buat");
    console.log(`User name: ${username}`);
    console.log(`Password: ${password}`);
    process.exit();
  } catch (err) {
    console.log("Error: ", err.message);
    process.exit(1);
  }
}
createAdmin();
