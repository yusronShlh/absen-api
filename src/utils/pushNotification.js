import admin from "../config/firebase.js";

export async function sendPushNotification({ token, title, body }) {
  try {
    const message = {
      token,

      notification: { title, body },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Push notification sent:", response);
  } catch (err) {
    console.error("❌ Push notification error:", err.message);
  }
}
