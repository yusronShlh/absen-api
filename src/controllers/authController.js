import AuthServices from "../services/authServices.js";

class AuthController {
  static async login(req, res) {
    try {
      const { identifier, password } = req.body;
      // console.log({ identifier, password });
      if (!identifier || !password) {
        return res
          .status(400)
          .json({ message: "Username / NISN / NIP dan Password wajib di isi" });
      }
      const result = await AuthServices.login({ identifier, password });
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default AuthController;
