import db from "../models/index.js";
import lessonTime from "../models/lessonTimeModel.js";

const { Schedule, Class, Subject, LessonTime, User } = db;

class ScheduleService {
  static async create(data) {
    console.log("[SERVICE] create schedule:", data);
    const { day, class_id, subject_id, teacher_id, lesson_time_id } = data;

    const exists = await Schedule.findOne({
      where: { day, class_id, lesson_time_id },
    });
    if (exists) {
      throw new Error("Jadwal bentrok di jam tersebut!");
    }

    const schedule = await Schedule.create({
      day,
      class_id,
      subject_id,
      teacher_id,
      lesson_time_id,
    });

    return schedule;
  }

  static async getAll(filters) {
    console.log("[SERVICE] getAll schedules:", filters);
    const { class_id, classId, day } = filters;
    const finalClassId = class_id || classId;
    const where = {};

    if (finalClassId) where.class_id = finalClassId;
    if (day) where.day = day;

    const schedules = await Schedule.findAll({
      where,
      include: [
        { model: Class },
        { model: Subject },
        { model: lessonTime },
        { model: User, as: "teacher", attributes: ["id", "name"] },
      ],
      order: [["lesson_time_id", "ASC"]],
    });
    console.log(schedules.length);
    return schedules;
  }

  static async update(id, data) {
    console.log("[SERVICE] update schedule:", id, data);
    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      console.log("tidak ada schedule", !!schedule);
      throw new Error("Jadwal tidak di temukan");
    }
    await schedule.update(data);

    return schedule;
  }

  static async delete(id) {
    console.log("[SERVICE] delete schedule:", id);
    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      console.log("tidak ada schedule", !!schedule);
      throw new Error("Jadwal tidak di temukan");
    }

    await schedule.destroy();

    return true;
  }

  static async getFormOption() {
    console.log("--- [DEBUG] Memulai getFormOption ---");

    const days = [
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
      "minggu",
    ];

    const classes = await Class.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    console.log(`🔍 Classes fetched: ${classes.length} items`);

    const subjects = await Subject.findAll({
      attributes: ["id", "name", "class_id", "teacher_id"],
      order: [["name", "ASC"]],
    });
    console.log(`🔍 Subjects fetched: ${subjects.length} items`);

    const teachers = await User.findAll({
      where: { role: "guru" },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    console.log(`🔍 Teachers fetched: ${teachers.length} items`);

    const lessonTimes = await LessonTime.findAll({
      attributes: ["id", "name", "start_time", "end_time", "type"],
      order: [["order", "ASC"]],
    });
    console.log(`🔍 LessonTimes fetched: ${lessonTimes.length} items`);

    const formattedTimes = lessonTimes.map((t) => ({
      id: t.id,
      name: t.name,
      time: `${t.start_time} - ${t.end_time}`,
      type: t.type,
    }));

    console.log("✅ LessonTime formatted:", formattedTimes[0] || "No data");

    return {
      days,
      classes,
      subjects,
      teachers,
      lessonTimes: formattedTimes,
    };
  }
}

export default ScheduleService;
