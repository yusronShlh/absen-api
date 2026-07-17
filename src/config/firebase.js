import admin from "firebase-admin";
import fs from "fs";
import path from "path";

if (!process.env.FIREBASE_CREDENTIAL) {
  throw new Error("FIREBASE_CREDENTIAL belum diatur di file .env");
}

const credentialPath = path.resolve(process.env.FIREBASE_CREDENTIAL);

const serviceAccount = JSON.parse(fs.readFileSync(credentialPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
