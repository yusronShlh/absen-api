import subjectServices from "../services/subjectServices.js";

class subjcetController {
  static async getAll(req, res) {
    try {
      console.log("get subject | query:", req.query);
      const data = await subjectServices.getAll(req.query);

      res.json(data);
    } catch (err) {
      console.log("error get:", err.message);

      res.status(400).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      console.log("create subject | body:", req.body);
      await subjectServices.create(req.body);
      res.json({ message: "mapel berhasil di tambahkan" });
    } catch (err) {
      console.log("error create:", err.message);

      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      console.log("update subject | id:", req.params.id);
      console.log("body:", req.body);

      await subjectServices.update(req.params.id, req.body);
      res.json({ message: "Mapel behasil di perbarui" });
    } catch (err) {
      console.log("error update:", err.message);

      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      console.log("delete subject | id:", req.params.id);
      await subjectServices.delete(req.params.id);

      res.json({ message: "mapel berhasil di hapus" });
    } catch (err) {
      console.log("error delete:", err.message);

      res.status(400).json({ message: err.message });
    }
  }

  static async detail(req, res) {
    try {
      console.log("Detail subject || id:", req.params.id);

      const data = await subjectServices.detail(req.params.id);

      res.json(data);
    } catch (err) {
      console.log("error detail:", err.message);

      res.status(400).json({ message: err.message });
    }
  }

  static async formOptions(req, res) {
    try {
      console.log("get form options");

      const data = await subjectServices.formOptions();

      res.json(data);
    } catch (err) {
      console.log("error options:", err.message);

      res.status(400).json({ message: err.message });
    }
  }
}

export default subjcetController;
