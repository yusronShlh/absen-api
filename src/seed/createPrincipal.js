import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";
import User from "../models/userModel.js";

async function createAdmin() {
  try {
    await sequelize.authenticate();

    const username = process.env.PRINCIPAL_USERNAME;
    const password = process.env.PRINCIPAL_PASSWORD;

    //Cek apakah admin sudah ada
    const exists = await User.findOne({ where: { username } });
    if (exists) {
      console.log("Admin sudah ada");
      process.exit();
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // buat kepsek
    await User.create({
      name: "Principal",
      username,
      password: hash,
      role: "principal",
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
