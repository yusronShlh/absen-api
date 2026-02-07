import app from "./app.js";
import db from "./models/index.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected");

    await db.sequelize.sync();
    console.log("Database synced");

    app.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(
        `==================================================================`,
      );
      console.log(`Server running on `);
      console.log(`LOCAL     = http://localhost:${PORT}`);
      console.log(
        `TAILSCALE = http://${process.env.TAILSCALE_HOST}:${process.env.PORT}`,
      );
      console.log(
        `==================================================================`,
      );
    });
  } catch (err) {
    console.log("Server error:", err);
  }
}

start();
