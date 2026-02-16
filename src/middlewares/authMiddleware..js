import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  // console.log("==== AUTH MIDDLEWARE ====");
  // console.log("HEADERS:", req.headers);

  try {
    const authHeader = req.headers.authorization;

    //console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      //console.log("❌ NO AUTH HEADER");
      return res.status(401).json({ message: "tidak ada token" });
    }
    if (!authHeader.startsWith("Bearer ")) {
      // console.log("format salah");
      return res.status(401).json({ message: "Format token salah" });
    }

    const token = authHeader.split(" ")[1];

    // console.log("TOKEN FROM HEADER:", token);
    // console.log("SECRET VERIFY:", process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("❌ JWT ERROR:", err.message);
        return res.status(401).json({ message: "Invalid Token" });
      }

      // console.log("✅ JWT DECODED:", decoded);

      req.user = decoded;
      next();
    });
  } catch (err) {
    //console.log("❌ AUTH MIDDLEWARE ERROR:", err.message);
    return res.status(401).json({ message: "Token tidak Valid" });
  }
};

export default authMiddleware;
