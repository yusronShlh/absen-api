import db from "../models/index.js";
import { sendPushNotification } from "../utils/pushNotification.js";

const {
  Notification,
  User,
  Schedule,
  Subject,
  Class,
  LessonTime,
  TeacherNotificationLog,
} = db;

import {
  getWIBDayName,
  getWIBTimeString,
  getWIBDateString,
} from "../utils/timeHelper.js";

class NotificationService {
  static async create({ user_id, title, message }) {
    console.log("[NOTIF] create →", { user_id, title });

    const notif = await Notification.create({ user_id, title, message });

    const user = await User.findByPk(user_id);

    if (user?.fcm_token) {
      await sendPushNotification({
        token: user.fcm_token,
        title,
        body: message,
      });
    } else {
      console.log("[FCM] user belum punya token");
    }
    return notif;
  }

  static async generateTeacherNotifications() {
    try {
      const today = getWIBDayName();
      const now = getWIBTimeString();
      const date = getWIBDateString();

      console.log("\n[CRON] Checking teacher notifications...");
      console.log({ today, now });

      const schedules = await Schedule.findAll({
        where: { day: today },
        include: [
          { model: Subject },
          { model: Class },
          { model: User, as: "teacher" },
          { model: LessonTime },
        ],
      });

      for (const s of schedules) {
        const start = s.LessonTime.start_time.slice(0, 5);
        const end = s.LessonTime.end_time.slice(0, 5);

        if (now >= start && now <= end) {
          console.log(`[MATCH] schedule ${s.id}`);

          const already = await TeacherNotificationLog.findOne({
            where: { schedule_id: s.id, date },
          });

          if (already) {
            console.log("[SKIP] already notified");
            continue;
          }

          const message = `Hi ${s.teacher.name},
        jadwal pelajaran ${s.Subject.name} kelas ${s.Class.name} telah di mulai,
        silahkan lakukan absensi sekarang`;

          await this.create({
            user_id: s.teacher.id,
            title: "Jadwal Dimulai",
            message,
          });

          await TeacherNotificationLog.create({ schedule_id: s.id, date });

          console.log("[SUCCESS] notif sent to teacher");
        }
      }
    } catch (err) {
      console.error("[CRON ERROR]", err.message);
    }
  }

  //NOTIFIKASI SISWA
  static async notifyStudentsAfterAttendance({
    class_id,
    subject_name,
    class_name,
  }) {
    console.log("\n[EVENT] notify students after attendance");

    const students = await db.Student.findAll({
      where: { class_id },
      include: [{ model: User, required: true }],
    });

    for (const s of students) {
      if (!s.User) continue;
      await this.create({
        user_id: s.User.id,
        title: "Absensi Selesai",
        message: `Absensi pelajaran ${subject_name} kelas ${class_name} telah dilakukan, silahkan cek status kehadiran anda`,
      });
    }
    console.log("[SUCCESS] notif sent to all students");
  }
  //   get user notif
  static async getByUser(user_id) {
    return await Notification.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });
  }

  //   MARK AS READ
  static async markAsRead(id) {
    const notif = await Notification.findByPk(id);

    if (!notif) throw new Error("Notifikasi tidak di temukan");

    notif.is_read = true;
    await notif.save();

    return notif;
  }
}

export default NotificationService;
