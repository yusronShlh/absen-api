import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL(
      "./notifikasi-sumpay-firebase-adminsdk-fbsvc-6ec707197d.json",
      import.meta.url,
    ),
  ),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
