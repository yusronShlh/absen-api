import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL(
      "./notifikasi-sumpay-firebase-adminsdk-fbsvc-bd711b93d5.json",
      import.meta.url,
    ),
  ),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
