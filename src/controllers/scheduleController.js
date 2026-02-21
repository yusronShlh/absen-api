import ScheduleService from "../services/schedulesServices.js";

class ScheduleController {
  static async create(req, res) {
    try {
      console.log("[CTRL] create schedule");
      console.log("BODY:", req.body);
      const result = await ScheduleService.create(req.body);

      return res
        .status(201)
        .json({ message: "Jadwal berhasil di buat", data: result });
    } catch (err) {
      console.log("Error create: ", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      console.log("[CTRL] get schedules");
      console.log("QUERY:", req.query);
      const result = await ScheduleService.getAll(req.query);

      return res.json({ message: "Data jadwal", data: result });
    } catch (err) {
      console.log("Error getAll: ", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      console.log("[CTRL] update schedule");
      const { id } = req.params;

      console.log("ID:", id);
      console.log("BODY:", req.body);

      const result = await ScheduleService.update(id, req.body);
      return res.json({ message: "Jadwal berhasil di update", data: result });
    } catch (err) {
      console.log("Error update: ", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      console.log("[CTRL] delete schedule");
      const { id } = req.params;
      console.log("ID:", id);

      await ScheduleService.delete(id);
      return res.json({ message: "Jadwal berhasil di hapus" });
    } catch (err) {
      console.log("Error Delete: ", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async getFormOption(req, res) {
    try {
      const result = await ScheduleService.getFormOption();

      return res.json(result);
    } catch (err) {
      console.error("🔥 [ERROR] Controller getFormOption failed!");
      console.error("Detail Message:", err.message);
      console.error("Stack Trace:", err.stack);

      res.status(500).json({ message: err.message });
    }
  }
}

export default ScheduleController;
