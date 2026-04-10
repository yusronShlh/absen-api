import SemesterService from "../services/semesterServices.js";

class SemesterController {
  static async getAll(req, res) {
    try {
      const data = await SemesterService.getAll();
      res.json({ data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await SemesterService.create(req.body);
      res.json({ message: "Semester berhasil dibuat", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await SemesterService.update(req.params.id, req.body);
      res.json({ message: "Semester berhasil diperbarui", data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await SemesterService.delete(req.params.id);
      res.json({ message: "Semester berhasil dihapus" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static getTypes(req, res) {
    try {
      const data = SemesterService.getTypes();
      res.json({ data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default SemesterController;
