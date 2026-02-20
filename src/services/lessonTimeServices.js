import { Op } from "sequelize";
import db from "../models/index.js";

const { LessonTime } = db;

class lessonTimeServices {
  static async getAll() {
    console.log("Services get all lesson times");

    const data = await LessonTime.findAll({ order: [["order", "ASC"]] });

    console.log("FOUND lesson times:", data.length);

    return data;
  }

  static async checkOverlap(start, end, excludeId = null) {
    console.log("CHECK overlap:", start, end);

    const where = {
      start_time: { [Op.lt]: end },
      end_time: { [Op.gt]: start },
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const conflict = await LessonTime.findOne({ where });

    console.log("OVERLAP FOUND:", !!conflict);

    return conflict;
  }

  static async siftOrder(fromOrder) {
    console.log("SHIFT order from:", fromOrder);

    const times = await LessonTime.findAll({
      where: { order: { $gte: fromOrder } },
      order: [["order", "DESC"]],
    });

    for (const time of times) {
      await time.update({ order: time.order + 1 });
    }

    console.log("SHIFT done:", times.length);
  }

  static async create(data) {
    console.log("SERVICE create lesson:", data);
    const { order, name, start_time, end_time, type } = data;

    if (!order || !name || !start_time || !end_time) {
      throw new Error("Semua field wajib di isi");
    }
    if (start_time >= end_time) {
      throw new Error("Waktu tidak valid");
    }

    const conflict = await this.checkOverlap(start_time, end_time);

    if (conflict) {
      throw new Error("Waktu bentrok");
    }

    await this.siftOrder(order);

    const result = await LessonTime.create({
      order,
      name,
      start_time,
      end_time,
      type: type || "lesson",
    });

    console.log("LESSON CREATED:", result.id);
    return result;
  }

  static async update(id, data) {
    const lesson = await LessonTime.findByPk(id);

    console.log("CHECK lesson:", !!lesson);

    if (!lesson) {
      throw new Error("Data tidak di temukan");
    }

    const { order, name, start_time, end_time, type } = data;

    if (start_time && end_time) {
      if (start_time >= end_time) {
        throw new Error("Waktu tidak valid");
      }

      const conflict = await this.checkOverlap(start_time, end_time, id);

      if (conflict) {
        throw new Error("Waktu bentrok ");
      }
    }
    if (order && order !== lesson.order) {
      await this.siftOrder(order);
    }

    await lesson.update({
      order: order ?? lesson.order,
      name: name ?? lesson.name,
      start_time: start_time ?? lesson.start_time,
      end_time: end_time ?? lesson.end_time,
      type: type ?? lesson.type,
    });

    console.log("LESSON UPDATED");

    return lesson;
  }

  static async delete(id) {
    console.log("SERVICE delete lesson:", id);

    const lesson = await LessonTime.findByPk(id);

    console.log("CHECK lesson:", !!lesson);
    if (!lesson) {
      throw new Error("Data tidak di temukan");
    }

    const deleteOrder = lesson.order;
    await lesson.destroy();
    console.log("LESSON DELETED");

    const after = await LessonTime.findAll({
      where: { order: { $gt: deleteOrder } },
    });

    for (const time of after) {
      await time.update({ order: time.order - 1 });
    }

    console.log("REORDER DONE:", after.length);
  }
}
export default lessonTimeServices;
