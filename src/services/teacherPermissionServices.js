import { Op } from "sequelize";
import db from "../models/index.js";
import { getWIBDateString, getWIBDate } from "../utils/timeHelper.js";
const { TeacherPermission, User, TeachingAssignment } = db;

const BASE_URL = process.env.BASE_URL || "http://100.105.63.68:4000";
function buildFileUrl(file) {
  if (!file) return null;
  return `${BASE_URL}/uploads/teacher-permissions/${file}`;
}

const permissionInclude = [
  { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
  {
    model: db.TeacherPermissionDetail,
    as: "details",
    include: [
      {
        model: db.Schedule,
        include: [
          {
            model: db.TeachingAssignment,
            include: [
              { model: db.Subject, attributes: ["id", "name"] },
              { model: db.Class, attributes: ["id", "name"] },
              { model: db.User, as: "teacher", attributes: ["id", "name"] },
            ],
          },
          { model: db.LessonTime, attributes: ["start_time", "end_time"] },
        ],
      },
    ],
  },
];

function formatPermissions(data) {
  return data.map((item) => {
    const obj = item.toJSON();
    obj.letter = buildFileUrl(obj.letter);
    return obj;
  });
}

class TeacherPermissionServices {
  static async getAll() {
    console.log("[SERVICE] getAll teacher permissions");

    const today = getWIBDateString();
    console.log("Today:", today);
    console.log("Now:", new Date());
    console.log("WIB:", getWIBDate());

    const sevenDaysAgo = new Date(getWIBDate());
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const limitDate = sevenDaysAgo.toISOString().split("T")[0];

    const pending = await TeacherPermission.findAll({
      where: { status: "pending" },
      include: permissionInclude,
      order: [["createdAt", "DESC"]],
    });

    const active = await TeacherPermission.findAll({
      where: {
        status: "approved",
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
      },
      include: permissionInclude,
      order: [["start_date", "ASC"]],
    });

    const recent = await TeacherPermission.findAll({
      where: {
        status: { [Op.in]: ["approved", "rejected"] },
        end_date: { [Op.gte]: limitDate, [Op.lt]: today },
      },
      include: permissionInclude,
      order: [["end_date", "DESC"]],
    });

    return {
      pending: formatPermissions(pending),
      active: formatPermissions(active),
      recent: formatPermissions(recent),
    };
  }

  static async getById(id) {
    console.log("[SERVICE] getById:", id);

    const data = await TeacherPermission.findByPk(id, {
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "nip"] },
        {
          model: db.TeacherPermissionDetail,
          as: "details",
          include: [
            {
              model: db.Schedule,
              include: [
                {
                  model: db.TeachingAssignment,
                  include: [
                    { model: db.Subject },
                    { model: db.Class },
                    {
                      model: db.User,
                      as: "teacher",
                    },
                  ],
                },
                { model: db.LessonTime },
              ],
            },
          ],
        },
      ],
    });
    if (!data) {
      console.log("❌ Permission not found");
      throw new Error("Izin guru tidak di temukan");
    }
    const result = data.toJSON();

    result.letter = buildFileUrl(result.letter);

    return result;
  }

  static async approve(id) {
    console.log("[SERVICE] approve:", id);

    const permission = await TeacherPermission.findByPk(id);
    if (!permission) {
      throw new Error("Izin tidak di temukan");
    }

    if (permission.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    if (!permission.is_full_day) {
      const details = await db.TeacherPermissionDetail.findAll({
        where: { permission_id: permission.id },
      });

      if (!details.length) {
        throw new Error("Detail jadwal izin tidak di temukan");
      }
    }

    await permission.update({ status: "approved" });
    console.log("✅ Approved:", id);

    return true;
  }

  static async reject(id) {
    console.log("[SERVICE] reject:", id);

    const permission = await TeacherPermission.findByPk(id);

    if (!permission) {
      throw new Error("Izin tidak di temukan");
    }

    if (permission.status !== "pending") {
      throw new Error("Izin sudah di proses");
    }

    await permission.update({ status: "rejected" });

    console.log("❌ Rejected:", id);

    return true;
  }
}

export default TeacherPermissionServices;
