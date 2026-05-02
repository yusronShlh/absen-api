import db from "../models/index.js";

const {
  StudentPermission,
  Student,
  Class,
  User,
  AttendanceDetail,
  AttendanceSession,
  Schedule,
  PermissionType,
} = db;

const BASE_URL = process.env.BASE_URL || "http://100.105.63.68:4000";
function buildStudentFileUrl(file) {
  if (!file) return null;
  return `${BASE_URL}/${file}`;
}

class StudentPermissionService {
  static async getAll() {
    console.log("[SERVICE] getAll permissions");
    const data = await StudentPermission.findAll({
      include: [
        {
          model: Student,
          attributes: ["id"],
          include: [
            { model: User, attributes: ["id", "name", "nisn"] },
            { model: Class, attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    console.log(`[SERVICE] Found ${data.length} permissions`);

    const result = data.map((item) => {
      const obj = item.toJSON();
      obj.letter = buildStudentFileUrl(obj.proof_file);
      return obj;
    });

    return result;
  }

  static async getById(id) {
    console.log("[SERVICE] get permission detail:", id);
    const data = await StudentPermission.findByPk(id, {
      include: [
        {
          model: Student,
          include: [
            { model: User, attributes: ["name", "nisn"] },
            { model: Class, attributes: ["name"] },
          ],
        },

        { model: User, as: "approver", attributes: ["id", "name"] },
      ],
    });
    if (!data) {
      console.log("[SERVICE] Permission not found");
      throw new Error("Izin tidak di temukan");
    }

    const result = data.toJSON();
    result.letter = buildStudentFileUrl(result.proof_file);

    return result;
  }

  static async approve(id, adminId) {
    console.log("[SERVICE] approve permission:", id);
    const data = await StudentPermission.findByPk(id);
    if (!data) {
      console.log("[SERVICE] Permission not found");
      throw new Error("Izin tidak di temukan");
    }
    if (data.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    const student = await Student.findByPk(data.student_id);
    if (!student) {
      throw new Error("Student / Siswa tidak di temukan");
    }

    const classId = student.class_id;

    const type = await PermissionType.findByPk(data.permission_type_id);

    const statusMap = type.name.toLowerCase() === "sakit" ? "sakit" : "izin";

    await data.update({
      status: "approved",
      approved_by: adminId,
      approved_at: new Date(),
    });
    console.log("[SERVICE] Permission approved");

    let currentDate = new Date(data.start_date);
    const endDate = new Date(Date.end_date);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      console.log("[SERVICE] Process date:", dateStr);

      const sessions = await AttendanceSession.findAll({
        include: [{ model: Schedule, where: { class_id: classId } }],
        where: { date: dateStr },
      });

      for (const session of sessions) {
        const existing = await AttendanceDetail.findOne({
          where: { attendance_session_id: session.id, student_id: student.id },
        });

        if (existing) {
          console.log(
            `[SERVICE] Skip existing attendance (session ${session.id})`,
          );
          continue;
        }

        await AttendanceDetail.create({
          attendance_session_id: session.id,
          student_id: student.id,
          status: statusMap,
        });

        console.log(`[SERVICE] Insert attendance (session ${session.id})`);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return true;
  }

  static async reject(id, adminId) {
    console.log("[SERVICE] reject permission:", id);

    const data = await StudentPermission.findByPk(id);
    if (!data) {
      throw new Error("Izin tidak di temukan");
    }
    if (data.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    await data.update({
      status: "rejected",
      approved_by: adminId,
      approved_at: new Date(),
    });
    return true;
  }
}

export default StudentPermissionService;
