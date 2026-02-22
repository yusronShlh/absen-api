import db from "../models/index.js";
// import lessonTime from "../models/lessonTimeModel.js";

const { Schedule, Class, Subject, LessonTime, User } = db;

class ScheduleService {
  // =========
  // CREATE
  // =========
  static async create(data) {
    console.log("[SERVICE] create schedule:", data);
    const { day, class_id, subject_id, teacher_id, lesson_time_id } = data;

    if (!day || !class_id || !subject_id || !teacher_id || !lesson_time_id) {
      throw new Error("Semua field wajib di isi");
    }

    // =========================
    // VALIDASI MASTER DATA
    // =========================

    const kelas = await Class.findByPk(class_id);
    if (!kelas) throw new Error("Kelas tidak valid");

    const subject = await Subject.findByPk(subject_id);
    if (!subject) throw new Error("Mapel tidak valid");

    const teacher = await User.findOne({
      where: { id: teacher_id, role: "guru" },
    });
    if (!teacher) throw new Error("Guru tidak valid");

    const lessonTime = await LessonTime.findByPk(lesson_time_id);
    if (!lessonTime) throw new Error("Jam pelajaran tidak valid");

    // bentrok kelas
    const classConflict = await Schedule.findOne({
      where: { day, class_id, lesson_time_id },
    });

    if (classConflict) {
      throw new Error("Kelas sudah punya jadwal di jam ini");
    }

    // bentrok guru
    const teacherConflict = await Schedule.findOne({
      where: { day, teacher_id, lesson_time_id },
    });

    if (teacherConflict) {
      throw new Error("Guru sudah mengajar di jam ini");
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
        { model: LessonTime },
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

    const { day, class_id, subject_id, teacher_id, lesson_time_id } = data;

    // =========================
    // VALIDASI MASTER (OPTIONAL UPDATE)
    // =========================

    if (class_id) {
      const kelas = await Class.findByPk(class_id);
      if (!kelas) throw new Error("Kelas tidak valid");
    }

    if (subject_id) {
      const subject = await Subject.findByPk(subject_id);
      if (!subject) throw new Error("Mapel tidak valid");
    }

    if (teacher_id) {
      const teacher = await User.findOne({
        where: { id: teacher_id, role: "guru" },
      });
      if (!teacher) throw new Error("Guru tidak valid");
    }

    if (lesson_time_id) {
      const lessonTime = await LessonTime.findByPk(lesson_time_id);
      if (!lessonTime) throw new Error("Jam pelajaran tidak valid");
    }

    // =========================
    // CEK BENTROK UPDATE
    // =========================

    if (day || class_id || teacher_id || lesson_time_id) {
      const conflict = await Schedule.findOne({
        where: {
          id: { [Op.ne]: id },

          day: day || schedule.day,

          lesson_time_id: lesson_time_id || schedule.lesson_time_id,

          [Op.or]: [
            { class_id: class_id || schedule.class_id },
            { teacher_id: teacher_id || schedule.teacher_id },
          ],
        },
      });

      if (conflict) {
        throw new Error("Jadwal bentrok dengan jadwal lain");
      }
    }

    // =========================
    // UPDATE
    // =========================
    await schedule.update({
      day: day ?? schedule.day,
      class_id: class_id ?? schedule.class_id,
      subject_id: subject_id ?? schedule.subject_id,
      teacher_id: teacher_id ?? schedule.teacher_id,
      lesson_time_id: lesson_time_id ?? schedule.lesson_time_id,
    });

    console.log("✅ Schedule updated:", schedule.id);

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
