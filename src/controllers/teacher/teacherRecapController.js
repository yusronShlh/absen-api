import TeacherRecapService from "../../services/teacher/teacherRecapServices.js";
import PDFDocument from "pdfkit";

class TeacherRecapController {
  static async getList(req, res) {
    try {
      const teacher_id = req.user.id;

      console.log("\n=== [CONTROLLER] RECAP LIST ===");
      console.log("Teacher:", teacher_id);

      const data = await TeacherRecapService.getList(teacher_id);

      res.json({ message: "List rekap berhasil ", data });
    } catch (err) {
      console.error("[ERROR LIST]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getDetail(req, res) {
    try {
      const teacher_id = req.user.id;
      const { subject_id, class_id, semester_id } = req.query;

      console.log("\n=== [CONTROLLER] RECAP DETAIL ===");
      console.log("Teacher:", teacher_id);
      console.log("Subjcet:", subject_id);
      console.log("Class:", class_id);
      console.log("Semester:", semester_id);

      const data = await TeacherRecapService.getDetail({
        teacher_id,
        subject_id,
        class_id,
        semester_id,
      });

      res.json({ message: "Detail rekap berhasil", data });
    } catch (err) {
      console.error("[ERROR DETAIL]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async getSemesters(req, res) {
    try {
      console.log("\n=== [CONTROLLER] TEACHER SEMESTER DROPDOWN ===");

      const data = await TeacherRecapService.getSemesters();

      res.json({ message: "Berhasil ambil semester", data });
    } catch (err) {
      console.error("[ERROR SEMESTER]:", err.message);
      res.status(500).json({ message: err.message });
    }
  }

  static async exportPDF(req, res) {
    try {
      console.log("\n=== [CONTROLLER] EXPORT PDF ===");

      const teacher_id = req.user.id;
      const { subject_id, class_id, semester_id } = req.query;

      const recap = await TeacherRecapService.getDetail({
        teacher_id,
        subject_id,
        class_id,
        semester_id,
      });

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 30,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=rekap-${recap.subject}.pdf`,
      );

      doc.pipe(res);

      // ================= HEADER =================
      doc.fontSize(16).text("LAPORAN ABSENSI SISWA", { align: "center" });
      doc.moveDown(0.5);

      doc.fontSize(12);
      doc.text(`Mata Pelajaran : ${recap.subject}`);
      doc.text(`Kelas          : ${recap.class}`);
      doc.text(`Total Pertemuan: ${recap.meetings.length}`);
      doc.moveDown();

      // ================= TABLE =================
      const startX = 30;
      let startY = doc.y;

      const rowHeight = 20;
      const colNameWidth = 150;

      // dynamic width biar muat
      const totalCols = recap.meetings.length + 6; // no + nama + H I S A
      const usableWidth = doc.page.width - 60 - colNameWidth - 30;
      const colWidth = Math.floor(usableWidth / totalCols);

      const drawCell = (text, x, y, width, height, align = "center") => {
        const padding = 5;

        doc.rect(x, y, width, height).stroke();

        let textX = x;
        let textWidth = width;

        if (align === "left") {
          textX = x + padding;
          textWidth = width - padding * 2;
        }

        if (align === "right") {
          textX = x + padding;
          textWidth = width - padding * 2;
        }

        doc.text(text, textX, y + 5, {
          width: textWidth,
          align,
        });
      };
      // ================= HEADER TABLE =================
      let x = startX;
      let y = startY;

      doc.font("Helvetica-Bold");

      drawCell("No", x, y, 30, rowHeight);
      x += 30;

      drawCell("Nama", x, y, colNameWidth, rowHeight, "left");
      x += colNameWidth;

      recap.meetings.forEach((m, i) => {
        drawCell(i + 1, x, y, colWidth, rowHeight);
        x += colWidth;
      });

      ["H", "I", "S", "A"].forEach((label) => {
        drawCell(label, x, y, colWidth, rowHeight);
        x += colWidth;
      });

      y += rowHeight;

      // ================= BODY =================
      doc.font("Helvetica");

      recap.data.forEach((row, index) => {
        // page break
        if (y + rowHeight > doc.page.height - 30) {
          doc.addPage();
          y = 30;
        }

        let x = startX;

        drawCell(index + 1, x, y, 30, rowHeight);
        x += 30;

        drawCell(row.student_name, x, y, colNameWidth, rowHeight, "left");
        x += colNameWidth;

        row.pertemuan.forEach((p) => {
          drawCell(p, x, y, colWidth, rowHeight);
          x += colWidth;
        });

        [row.hadir, row.izin, row.sakit, row.alpha].forEach((val) => {
          drawCell(val, x, y, colWidth, rowHeight);
          x += colWidth;
        });

        y += rowHeight;
      });

      doc.end();
    } catch (err) {
      console.error("❌ EXPORT PDF ERROR:", err.message);
      res.status(500).json({ message: err.message });
    }
  }
}
export default TeacherRecapController;
