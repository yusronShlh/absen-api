import express from "express";
import router from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use("/auth", router);

app.get("/", (req, res) => {
  res.json({ message: "Absensi API running" });
});

export default app;
