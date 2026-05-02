import StudentReportService from "../services/studentReportServices.js";
import PDFDocument from "pdfkit";

class StudentReportController {
  static async getReport(req, res) {
    try {
      const { class_id, subject_id } = req.query;

      if (!class_id) {
        return res.status(400).json({ message: "kelas wajib di isi" });
      }

      const data = await StudentReportService.getReport({
        class_id,
        subject_id,
      });

      return res.json({
        message: "Berhasil ambil laporan absensi siswa",
        data,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async classSelect(req, res) {
    try {
      const data = await StudentReportService.getClass();

      res.json({ data });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  static async getSubjects(req, res) {
    try {
      const { class_id } = req.query;

      if (!class_id) {
        return res.status(400).json({ message: "kelas wwajib di pilih " });
      }

      const data = await StudentReportService.getSubjectsByClass(class_id);

      return res.json({ message: "Berhasil ambil mata pelajaran", data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async exportPdf(req, res) {
    try {
      const { class_id, subject_id } = req.query;

      if (!class_id) {
        return res.status(400).json({ message: "Kelas wajib di isi" });
      }
      const result = await StudentReportService.getReport({
        class_id,
        subject_id,
      });

      const doc = new PDFDocument({ margin: 40, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=student-report.pdf",
      );
      doc.pipe(res);

      const drawRow = (y, columns, widths) => {
        let x = doc.page.margins.left;

        columns.forEach((text, i) => {
          doc
            .rect(x, y, widths[i], 20)
            .stroke()
            .fontSize(10)
            .text(String(text), x + 5, y + 5, {
              width: widths[i] - 10,
              align: "center",
            });

          x += widths[i];
        });
      };
      let y = 80;

      doc
        .fontSize(16)
        .text("LAPORAN ABSENSI SISWA", 0, 40, { align: "center" });

      if (!subject_id) {
        const { subjects, data } = result;

        doc.fontSize(12).text(`Nama kelas: ${result.class_name}`, 40, y);
        y += 20;

        const headers = ["Nama", ...subjects];

        const widths = [
          120,
          ...subjects.map(() => (500 - 120) / subjects.length),
        ];

        drawRow(y, headers, widths);
        y += 20;

        data.forEach((row) => {
          const values = [row.name, ...subjects.map((s) => row[s] || 0)];

          drawRow(y, values, widths);
          y += 20;

          if (y > 750) {
            doc.addPage();
            y = 50;
          }
        });
      } else {
        const { subject, data } = result;

        doc.fontSize(12).text(`Nama kelas: ${result.class_name}`, 40, y);
        y += 15;
        doc.text(`Mata Pelajaran: ${subject}`, 40, y);
        y += 20;

        const headers = ["Nama", "Total", "Hadir", "izin", "Sakit", "Alpha"];
        const widths = [120, 60, 60, 60, 60, 60];

        drawRow(y, headers, widths);
        y += 20;

        data.forEach((row) => {
          const values = [
            row.name,
            row.total,
            row.hadir,
            row.izin,
            row.sakit,
            row.alpha,
          ];

          drawRow(y, values, widths);
          y += 20;

          if (y > 750) {
            doc.addPage();
            y = 50;
          }
        });
      }

      doc.end();
    } catch (err) {
      console.error("[ERROR EXPORT PDF STUDENT]", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}

export default StudentReportController;
