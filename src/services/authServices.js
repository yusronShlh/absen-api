import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { Op } from "sequelize";

class AuthServices {
  static async login(data) {
    const { identifier, password } = data;
    // console.log("LOGIN REQUEST:", data);

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: identifier },
          { nip: identifier },
          { nisn: identifier },
        ],
      },
    });
    if (!user) throw new Error("Akun tidak di temukan");

    // cocokin password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Password salah");

    // buat token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" },
    );

    // console.log("TOKEN GENERATED:", token);
    // console.log("SECRET USED:", process.env.JWT_SECRET);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        nisn: user.nisn,
        nip: user.nip,
      },
    };
  }
}

export default AuthServices;
