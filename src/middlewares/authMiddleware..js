import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "tidak ada token" });

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Format token salah" });
    }

    const token = auth.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid Token" });

      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: "Token tidak Valid" });
  }
};

export default authMiddleware;
