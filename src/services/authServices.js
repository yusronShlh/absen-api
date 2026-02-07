import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

class AuthSvices {
  static async login(data) {
    const { username, password } = data;

    const user = await User.findOne({ where: { username } });
    if (!user) throw new Error("User tidak di temukan");

    // cocokin password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Password salah");

    // buat token
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" },
    );

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

export default AuthSvices;
