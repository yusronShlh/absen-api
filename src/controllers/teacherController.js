import teacherServices from "../services/teacherServices.js";

class teacherController {
  static async getAll(req, res) {
    try {
      const data = await teacherServices.getAll(req.query);

      res.json({
        meta: { total: data.count, page: Number(req.query.page || 1) },
        teachers: data.rows,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      await teacherServices.create(req.body);

      res.json({ message: "Data guru berhasil di tambahkan" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      await teacherServices.update(req.params.id, req.body);
      console.log(req.params.id, req.body);

      res.json({ message: "Data guru berhasil di perbarui" });
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }

  static async delete(req, res) {
    try {
      await teacherServices.delete(req.params.id);

      res.json({ message: "Data guru berhasil di hapus" });
    } catch (err) {
      res.status(400).json({ message: err.message });
      console.log(err);
    }
  }
}

export default teacherController;
