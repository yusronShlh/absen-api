import app from "./app.js";
import db from "./models/index.js";
import dotenv from "dotenv";

dotenv.config();
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 UNHANDLED REJECTION:", err);
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected");

    await db.sequelize.sync();
    console.log("Database synced");

    // async function seedPermissionTypes() {
    //   const { PermissionType } = db;

    //   const types = ["izin", "sakit"];

    //   for (const name of types) {
    //     await PermissionType.findOrCreate({
    //       where: { name },
    //     });
    //   }

    //   console.log("✅ Permission types seeded");
    // }
    // await seedPermissionTypes();

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
