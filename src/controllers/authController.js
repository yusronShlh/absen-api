import AuthSvices from "../services/authServices.js";

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username dan Password wajib di isi" });
      }
      const result = await AuthSvices.login({ username, password });
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default AuthController;
