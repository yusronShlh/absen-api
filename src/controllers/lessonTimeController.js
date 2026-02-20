import lessonTimeServices from "../services/lessonTimeServices.js";

class lessonTimeController {
  static async getAll(req, res) {
    try {
      console.log("GET lesson times");
      const data = await lessonTimeServices.getAll();

      res.json(data);
    } catch (err) {
      console.log("error get:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      console.log("CREATE lesson | body:", req.body);
      await lessonTimeServices.create(req.body);

      res.json({ message: "Jam pelajaran berhasil di tambahkan" });
    } catch (err) {
      console.log("error create:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      console.log("UPDATE lesson | id:", req.params.id);
      console.log("BODY:", req.body);
      await lessonTimeServices.update(req.params.id, req.body);

      res.json({ message: "Jam pelajaran berhasil di perbarui" });
    } catch (err) {
      console.log("error update:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      console.log("DELETE lesson | id:", req.params.id);

      await lessonTimeServices.delete(req.params.id);

      res.json({ message: "Jam berhasil di hapus" });
    } catch (err) {
      console.log("error delete:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
}

export default lessonTimeController;
