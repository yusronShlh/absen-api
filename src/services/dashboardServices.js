import { Op, fn, col, literal } from "sequelize";
import db from "../models/index.js";

const {
  User,
  Student,
  Class,
  StudentPermission,
  TeacherPermission,
  sequelize,
} = db;

class DashboardServices {
  static async getDashboardData() {
    const today = new Date().toISOString().slice(0, 10);

    // STATISTIK SISWA
    const totalStudents = await Student.count();
    const maleStudents = await Student.count({ where: { gender: "L" } });
    const femaleStudents = await Student.count({ where: { gender: "P" } });

    console.log("Students:", {
      total: totalStudents,
      male: maleStudents,
      female: femaleStudents,
    });

    // TOTAL GURU
    const totalTeachers = await User.count({ where: { role: "guru" } });

    console.log("Total teachers: ", totalTeachers);

    // DATA PERKELAS
    console.log("Get class statistics...");

    const classStats = await Class.findAll({
      attributes: [
        "id",
        "name",
        // hitung laki-laki
        [
          fn(
            "SUM",
            literal(`CASE WHEN Students.gender = 'L' THEN 1 ELSE 0 END`),
          ),
          "male",
        ],
        [
          fn(
            "SUM",
            literal(`CASE WHEN Students.gender = 'P' THEN 1 ELSE 0 END`),
          ),
          "female",
        ],
      ],
      include: [
        {
          model: Student,
          attributes: [],
          required: false, //Left join
        },
      ],

      group: ["Class.id"],
      order: [["id", "ASC"]],
      raw: true,
    });

    console.log("Class stats: ", classStats.length, "rows");
    // format ulang
    const classes = classStats.map((item) => ({
      class_id: item.id,
      class_name: item.name,
      male: Number(item.male || 0),
      female: Number(item.female || 0),
    }));

    // IZIN HARI INI
    console.log("Get today permits...");

    const studentPermitsToday = await StudentPermission.count({
      where: { date: today, status: "approved" },
    });
    const teacherPermitsToday = await TeacherPermission.count({
      where: { date: today, status: "approved" },
    });

    console.log("Todays permits: ", {
      students: studentPermitsToday,
      teachers: teacherPermitsToday,
    });

    // FINAL RESULT

    const result = {
      students: {
        total: totalStudents,
        male: maleStudents,
        female: femaleStudents,
      },

      teachers: { total: totalTeachers },

      classes,

      today_permits: {
        students: studentPermitsToday,
        teachers: teacherPermitsToday,
      },
    };

    console.log("=== DASHBOARD SERVICE END ===");

    return result;
  }
}

export default DashboardServices;
