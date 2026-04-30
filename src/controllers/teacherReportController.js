import TeacherReportService from "../services/teacherReportServices.js";
import PDFDocument from "pdfkit";

class TeacherReportController {
  static async getReport(req, res) {
    try {
      const { semester_id, teacher_id } = req.query;

      if (!semester_id) {
        return res.status(400).json({ message: "semester wajib di isi" });
      }

      const data = await TeacherReportService.getReport({
        semester_id,
        teacher_id,
      });

      res.json({ message: "Berhasil ambil laporan absen guru", data });
    } catch (err) {
      console.error("[ERROR]", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const data = await TeacherReportService.getAll();

      return res.json({ message: "Berhasil ambil data semester", data });
    } catch (err) {
      console.error("[ERROR] GET SEMESTERS:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getTeachers(req, res) {
    try {
      const { semester_id } = req.query;

      if (!semester_id) {
        return res.status(400).json({ message: "Semester wajib di isi" });
      }

      const data = await TeacherReportService.getBySemesters(semester_id);

      return res.json({ message: "Berhasil ambil data guru", data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async exportPdf(req, res) {
    try {
      const { semester_id, teacher_id } = req.query;

      if (!semester_id) {
        return res.status(400).json({ message: "semester wajib di isi" });
      }

      const result = await TeacherReportService.getReportForExport({
        semester_id,
        teacher_id,
      });

      const doc = new PDFDocument({ margin: 40, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=teacher-report.pdf",
      );

      doc.pipe(res);

      // ======================
      // TITLE
      // ======================
      doc.fontSize(16).text("LAPORAN ABSENSI GURU", { align: "center" });
      doc.moveDown(2);

      let y = doc.y;

      // ======================
      // HELPER TABLE
      // ======================
      const startX = 40;
      const tableWidth = 510;

      const columnWidths = [30, 180, 70, 70, 70, 70];
      // (nama lebih panjang)

      const drawTableRow = (y, row) => {
        let x = startX;

        row.forEach((text, i) => {
          doc
            .rect(x, y, columnWidths[i], 20) // kotak cell
            .stroke();

          doc.text(text, x + 5, y + 5, {
            width: columnWidths[i] - 10,
            align: i === 0 ? "left" : "center",
          });

          x += columnWidths[i];
        });
      };

      const drawTableLine = (y) => {
        doc
          .moveTo(startX, y)
          .lineTo(startX + tableWidth, y)
          .stroke();
      };

      // ======================
      // MODE 1: ALL TEACHERS
      // ======================
      if (!teacher_id) {
        doc.fontSize(12).text("Rekap Semua Guru");
        y += 20;

        // HEADER
        drawTableRow(y, ["No", "Nama", "Total", "Hadir", "Izin", "Alpha"]);
        y += 20;

        // DATA
        result.data.forEach((item) => {
          drawTableRow(y, [
            item.no ? item.no.toString() : "",
            item.teacher_name,
            item.total_pertemuan.toString(),
            item.hadir.toString(),
            item.izin.toString(),
            item.alpha.toString(),
          ]);

          y += 20;

          if (y > 750) {
            doc.addPage();
            y = 50;
          }
        });
      }

      // ======================
      // MODE 2: DETAIL TEACHER
      // ======================
      else {
        doc.fontSize(12).text(`Nama guru: ${result.teacher_name}`);
        y += 20;

        // HEADER
        drawTableRow(y, [
          "No",
          "Mapel (Kelas)",
          "Total",
          "Hadir",
          "Izin",
          "Alpha",
        ]);
        y += 20;

        result.data.forEach((item) => {
          drawTableRow(y, [
            item.no ? item.no.toString() : "",
            item.subject,
            item.total_pertemuan.toString(),
            item.hadir.toString(),
            item.izin.toString(),
            item.alpha.toString(),
          ]);

          y += 20;

          if (y > 750) {
            doc.addPage();
            y = 50;
          }
        });
      }

      doc.end();
    } catch (err) {
      console.error("[ERROR EXPORT PDF]", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}
export default TeacherReportController;
