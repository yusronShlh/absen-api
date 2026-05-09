import TeachingAssignmentService from "../services/teachingAssignmentServices.js";

class TeachingAssignmentController {
  // GET
  static async getAll(req, res) {
    try {
      console.log("\n📸 [CONTROLLER] GET ALL ASSIGNMENTS");

      const data = await TeachingAssignmentService.getAll();

      res.json({
        message: "Assignments fetched successfully",
        data,
      });
    } catch (err) {
      console.error("[ERROR]", err.message);

      res.status(400).json({
        message: err.message,
      });
    }
  }

  // CREATE
  static async create(req, res) {
    try {
      console.log("\n📸 [CONTROLLER] CREATE ASSIGNMENT");

      const data = await TeachingAssignmentService.create(req.body);

      res.status(201).json({
        message: "Assignment created successfully",
        data,
      });
    } catch (err) {
      console.error("[ERROR]", err.message);

      res.status(400).json({
        message: err.message,
      });
    }
  }

  // UPDATE
  static async update(req, res) {
    try {
      console.log("\n📸 [CONTROLLER] UPDATE ASSIGNMENT");

      const data = await TeachingAssignmentService.update(
        req.params.id,
        req.body,
      );

      res.json({
        message: "Assignment updated successfully",
        data,
      });
    } catch (err) {
      console.error("[ERROR]", err.message);

      res.status(400).json({
        message: err.message,
      });
    }
  }

  // DELETE
  static async delete(req, res) {
    try {
      console.log("\n📸 [CONTROLLER] DELETE ASSIGNMENT");

      await TeachingAssignmentService.delete(req.params.id);

      res.json({
        message: "Assignment deleted successfully",
      });
    } catch (err) {
      console.error("[ERROR]", err.message);

      res.status(400).json({
        message: err.message,
      });
    }
  }

  // OPTIONS SELECT
  static async getOptions(req, res) {
    try {
      console.log("\n📸 [CONTROLLER] GET OPTIONS");

      const data = await TeachingAssignmentService.getOptions();

      res.json({
        message: "Options fetched successfully",
        data,
      });
    } catch (err) {
      console.error("[ERROR]", err.message);

      res.status(400).json({
        message: err.message,
      });
    }
  }
}

export default TeachingAssignmentController;
