import StudentService from "../services/studentServices.js";

class studentController {
  static async getAll(req, res) {
    try {
      const data = await StudentService.getAll(req.query);

      res.json({
        meta: { total: data.count, page: Number(req.query.page || 1) },
        students: data.rows,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, password, nisn, class_id, gender } = req.body;
      if (!name || !password || !nisn || !class_id || !gender) {
        return res.status(400).json({ message: "Semua field wajib di isi" });
      }

      await StudentService.create(req.body);

      res.json({ message: "Data siswa telah di tambahkan" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { name, nisn, class_id, gender } = req.body;
      if (!name || !nisn || !class_id || !gender) {
        return res.status(400).json({ message: "Semua field wajib di isi" });
      }

      await StudentService.update(req.params.id, {
        name,
        nisn,
        class_id,
        gender,
      });

      res.json({ message: "Data siswa telah di perbarui" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await StudentService.delete(req.params.id);

      res.json({ message: "Siswa telah di hapus" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

export default studentController;
