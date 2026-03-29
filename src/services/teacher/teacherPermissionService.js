import { Op } from "sequelize";
import db from "../../models/index.js";

const {
  TeacherPermission,
  TeacherPermissionDetail,
  Schedule,
  Class,
  Subject,
  LessonTime,
} = db;

class TeacherPermissionService {
  static async createPermission(data) {
    console.log("=== SERVICE CREATE TEACHER PERMISSION ===");

    const {
      teacher_id,
      start_date,
      end_date,
      reason,
      is_full_day,
      schedules,
      letter,
    } = data;
    console.log("📌 Data diterima:", data);

    if (new Date(start_date) > new Date(end_date)) {
      throw new Error("Tanggal tidak valid");
    }

    let fullDay = is_full_day;
    let finalSchedules = schedules;

    if (start_date !== end_date) {
      fullDay = true;
      finalSchedules = null;
      console.log("📌  Multi day → full day otomatis & ignore schedules");
    }

    const overlap = await TeacherPermission.findOne({
      where: { teacher_id, status: { [Op.in]: ["pending", "approved"] } },
    });

    if (overlap) {
      console.log("⚠️ Ada izin lain yang masih aktif");
      throw new Error("ada izin yang masih aktif");
    }

    const permission = await TeacherPermission.create({
      teacher_id,
      start_date,
      end_date,
      is_full_day: fullDay,
      reason,
      letter,
    });

    console.log("✅ Permission created ID:", permission.id);

    if (!fullDay) {
      if (!finalSchedules || finalSchedules.length === 0) {
        throw new Error("Pilih minimal 1 jadwal");
      }
      console.log("📚 Partial schedules:", finalSchedules);

      const validSchedules = await Schedule.findAll({
        where: { teacher_id, id: finalSchedules },
      });

      if (validSchedules.length !== finalSchedules.length) {
        throw new Error("Jadwal tidak valid");
      }

      const details = finalSchedules.map((schedule_id) => ({
        permission_id: permission.id,
        schedule_id,
      }));

      await TeacherPermissionDetail.bulkCreate(details);

      console.log("✅ Permission details inserted:", details.length);
    }

    return permission;
  }

  static async getScheduleByDate({ teacherId, start, end }) {
    if (!start || !end) {
      throw new Error("Tanggal awal dan akhir izin wajib di isi");
    }

    if (new Date(start) > new Date(end)) {
      throw new Error("Tanggal tidak valid");
    }

    if (start !== end) {
      return { is_full_day: true, schedules: [] };
    }

    const dateObj = new Date(start);

    const dayName = dateObj
      .toLocaleDateString("id-ID", { weekday: "long" })
      .toLocaleLowerCase();
    console.log("📅 Hari:", dayName);

    const schedules = await Schedule.findAll({
      where: { teacher_id: teacherId, day: dayName },
      include: [
        { model: Class, attributes: ["id", "name"] },
        { model: Subject, attributes: ["id", "name"] },
        {
          model: LessonTime,
          attributes: ["id", "start_time", "end_time", "order"],
        },
      ],
      order: [[LessonTime, "order", "ASC"]],
    });
    console.log(`✅ Found schedules: ${schedules.length}`);

    return { is_multi_day: false, schedules };
  }
}

export default TeacherPermissionService;
