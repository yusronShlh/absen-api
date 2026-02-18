import classServices from "../services/classServices.js";

class classController {
  static async getAll(req, res) {
    try {
      console.log("GET ALL CLASSES | query:", req.query);

      const data = await classServices.getAll(req.query);
      console.log("RESULT COUNT:", data.count);

      res.json({
        meta: { total: data.count, page: Number(req.query.page || 1) },
        classes: data.rows,
      });
    } catch (err) {
      console.log("ERROR GET ALL:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      console.log("CREATE CLASS | body:", req.body);
      await classServices.create(req.body);

      console.log("CREATE SUCCESS");
      res.json({ message: "Kelas berhasil ditambahkan" });
    } catch (err) {
      console.log("ERROR CREATE:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      console.log("UPDATE CLASS | id:", req.params.id);
      console.log("UPDATE BODY:", req.body);
      await classServices.update(req.params.id, req.body);

      res.json({ message: "Kelas berhasil di perbarui" });
    } catch (err) {
      console.log("ERROR UPDATE:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      console.log("DELETE CLASS | id:", req.params.id);
      await classServices.delete(req.params.id);

      res.json({ message: "Kelas berhasil dihapus" });
    } catch (err) {
      console.log("ERROR DELETE:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async detail(req, res) {
    try {
      console.log("DETAIL CLASS | id:", req.params.id);

      const data = await classServices.detail(req.params.id);
      res.json(data);
    } catch (err) {
      console.log("ERROR DETAIL:", err.message);
      res.status(400).json({ message: err.message });
    }
  }

  static async select(req, res) {
    try {
      console.log("GET TEACHER SELECT");
      const data = await classServices.select();

      console.log("TEACHER COUNT:", data.length);
      res.json({ data });
    } catch (err) {
      console.log("ERROR SELECT:", err.message);
      res.status(400).json({ message: err.message });
    }
  }
}
export default classController;
