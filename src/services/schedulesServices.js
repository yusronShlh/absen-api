import db from "../models/index.js";
import { Op } from "sequelize";
// import lessonTime from "../models/lessonTimeModel.js";

const { Schedule, TeachingAssignment, Class, Subject, LessonTime, User } = db;

class ScheduleService {
  // =========
  // CREATE
  // =========
  static async create(data) {
    console.log("\n📸 [SERVICE] CREATE SCHEDULE");
    console.log("BODY:", data);

    const { day, teaching_assignment_id, lesson_time_id } = data;

    if (!day || !teaching_assignment_id || !lesson_time_id) {
      throw new Error("Semua field wajib di isi");
    }

    // VALIDASI ASSIGNMENT
    const assignment = await TeachingAssignment.findByPk(
      teaching_assignment_id,
      {
        include: [
          { model: Class },
          { model: Subject },
          { model: User, as: "teacher" },
        ],
      },
    );

    if (!assignment) {
      throw new Error("Teaching assignment tidak valid");
    }

    console.log("✅ Assignment ditemukan:", assignment.id);

    // VALIDASI LESSON TIME
    const lessonTime = await LessonTime.findByPk(lesson_time_id);

    if (!lessonTime) {
      throw new Error("Jam pelajaran tidak valid");
    }

    // CEK BENTROK KELAS
    const classConflict = await Schedule.findOne({
      where: { day, lesson_time_id },
      include: [
        {
          model: TeachingAssignment,
          where: {
            class_id: assignment.class_id,
          },
        },
      ],
    });

    if (classConflict) {
      throw new Error("Kelas sudah punya jadwal di jam ini");
    }

    // CEK BENTROK GURU
    const teacherConflict = await Schedule.findOne({
      where: { day, lesson_time_id },
      include: [
        {
          model: TeachingAssignment,
          where: {
            teacher_id: assignment.teacher_id,
          },
        },
      ],
    });

    if (teacherConflict) {
      throw new Error("Guru sudah mengajar di jam ini");
    }

    const schedule = await Schedule.create({
      day,
      teaching_assignment_id,
      lesson_time_id,
    });

    console.log("✅ Schedule created:", schedule.id);

    return schedule;
  }

  static async getAll(filters) {
    console.log("[SERVICE] getAll schedules:", filters);
    const { class_id, classId, day } = filters;
    const finalClassId = class_id || classId;
    const where = {};

    // if (finalClassId) where.class_id = finalClassId;
    if (day) where.day = day;

    const schedules = await Schedule.findAll({
      where,
      include: [
        {
          model: TeachingAssignment,
          where: finalClassId ? { class_id: finalClassId } : undefined,
          include: [
            { model: Class },
            { model: Subject },
            { model: User, as: "teacher", attributes: ["id", "name"] },
          ],
        },
        { model: LessonTime },
      ],
      order: [["lesson_time_id", "ASC"]],
    });
    console.log(schedules.length);
    return schedules;
  }

  static async update(id, data) {
    console.log("\n📸 [SERVICE] UPDATE SCHEDULE");
    console.log("ID:", id);
    console.log("BODY:", data);

    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      throw new Error("Jadwal tidak di temukan");
    }

    const { day, teaching_assignment_id, lesson_time_id } = data;

    let assignment = null;

    if (teaching_assignment_id) {
      assignment = await TeachingAssignment.findByPk(teaching_assignment_id, {
        include: [
          { model: Class },
          { model: Subject },
          { model: User, as: "teacher" },
        ],
      });

      if (!assignment) {
        throw new Error("Teaching assignment tidak valid");
      }

      console.log("✅ Assignment ditemukan:", assignment.id);
    } else {
      assignment = await TeachingAssignment.findByPk(
        schedule.teaching_assignment_id,
        {
          include: [
            { model: Class },
            { model: Subject },
            { model: User, as: "teacher" },
          ],
        },
      );
    }

    if (lesson_time_id) {
      const lessonTime = await LessonTime.findByPk(lesson_time_id);

      if (!lessonTime) {
        throw new Error("Jam pelajaran tidak valid");
      }
    }

    const finalDay = day || schedule.day;

    const finalLessonTimeId = lesson_time_id || schedule.lesson_time_id;

    const finalTeachingAssignmentId =
      teaching_assignment_id || schedule.teaching_assignment_id;

    const classConflict = await Schedule.findOne({
      where: {
        id: { [Op.ne]: id },
        day: finalDay,
        lesson_time_id: finalLessonTimeId,
      },
      include: [
        {
          model: TeachingAssignment,
          where: {
            class_id: assignment.class_id,
          },
        },
      ],
    });

    if (classConflict) {
      throw new Error("Kelas sudah punya jadwal di jam ini");
    }

    const teacherConflict = await Schedule.findOne({
      where: {
        id: { [Op.ne]: id },
        day: finalDay,
        lesson_time_id: finalLessonTimeId,
      },
      include: [
        {
          model: TeachingAssignment,
          where: {
            teacher_id: assignment.teacher_id,
          },
        },
      ],
    });

    if (teacherConflict) {
      throw new Error("Guru sudah mengajar di jam ini");
    }

    await schedule.update({
      day: finalDay,
      teaching_assignment_id: finalTeachingAssignmentId,
      lesson_time_id: finalLessonTimeId,
    });

    console.log("✅ Schedule updated:", schedule.id);

    return schedule;
  }

  static async delete(id) {
    console.log("[SERVICE] delete schedule:", id);

    const schedule = await Schedule.findByPk(id);
    if (!schedule) {
      throw new Error("Jadwal tidak di temukan");
    }

    // 🔥 PREVENT DELETE (lebih clean)
    const session = await db.AttendanceSession.findOne({
      where: { schedule_id: id },
    });

    if (session) {
      throw new Error(
        "Jadwal tidak bisa dihapus karena sudah berjalan dan memiliki absensi",
      );
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
      attributes: ["id", "name"],
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

    const assignments = await TeachingAssignment.findAll({
      include: [
        { model: Class, attributes: ["id", "name"] },
        { model: Subject, attributes: ["id", "name"] },
        { model: User, as: "teacher", attributes: ["id", "name"] },
      ],
      order: [["id", "ASC"]],
    });

    console.log(`🔍 Assignments fetched: ${assignments.length}`);

    return {
      days,
      teachingAssignments: assignments,
      lessonTimes: formattedTimes,
    };
  }
}

export default ScheduleService;
