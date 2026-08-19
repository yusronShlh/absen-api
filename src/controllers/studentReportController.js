import StudentReportService from "../services/studentReportServices.js";
import PDFDocument from "pdfkit";
import {
  getCurrentWIBMonth,
  getCurrentWIBYear,
  getMonthName,
} from "../utils/timeHelper.js";

class StudentReportController {
  static async getReport(req, res) {
    try {
      const { semester_id, month, year, class_id, subject_id } = req.query;

      // if (!semester_id) {
      //   return res
      //     .status(400)
      //     .json({ message: "pilih semester untuk di tampilkan" });
      // }

      if (!class_id) {
        return res
          .status(400)
          .json({ message: "Pilih kelas untuk di tampilkan" });
      }
      if (!semester_id && !(month && year)) {
        return res
          .status(400)
          .json({ message: "semester atau bulan dan tahun wajib di isi" });
      }

      const data = await StudentReportService.getReport({
        semester_id,
        month,
        year,
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

  static async getPeriods(req, res) {
    try {
      const data = await StudentReportService.getPeriods();

      return res.json({
        message: "Berhasil ambil daftar periode",
        data,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }

  static async getSubjects(req, res) {
    try {
      const { semester_id, month, year, class_id } = req.query;

      if (!class_id) {
        return res.status(400).json({
          message: "Pilih kelas untuk ditampilkan",
        });
      }

      if (!semester_id && !(month && year)) {
        return res.status(400).json({
          message: "semester atau bulan dan tahun wajib di isi",
        });
      }

      const data = await StudentReportService.getSubjectsByClass({
        semester_id,
        month,
        year,
        class_id,
      });

      return res.json({
        message: "Berhasil ambil mata pelajaran",
        data,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
  static async semesterSelect(req, res) {
    try {
      const data = await StudentReportService.getSemesters();

      res.json({ data });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async exportPdf(req, res) {
    try {
      const { semester_id, month, year, class_id, subject_id } = req.query;

      if (!class_id) {
        return res.status(400).json({
          message: "Kelas wajib di isi",
        });
      }

      const result = await StudentReportService.getReport({
        semester_id,
        month,
        year,
        class_id,
        subject_id,
      });

      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "landscape",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=student-report.pdf",
      );

      doc.pipe(res);

      // =========================================================
      // HELPER
      // =========================================================

      const drawRow = (xStart, y, columns, widths) => {
        let x = xStart;

        columns.forEach((text, i) => {
          doc
            .rect(x, y, widths[i], 20)
            .stroke()
            .fontSize(10)
            .text(String(text), x + 5, y + 5, {
              width: widths[i] - 10,
              height: 10,
              align: "center",
              lineBreak: false,
            });

          x += widths[i];
        });
      };

      const getTableStartX = (widths) => {
        const tableWidth = widths.reduce((total, width) => total + width, 0);

        const availableWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;

        return doc.page.margins.left + (availableWidth - tableWidth) / 2;
      };

      const getSubjectChunks = (subjects) => {
        const availableWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;

        // Lebar kolom nama siswa
        const nameWidth = 160;

        // Padding kiri + kanan untuk teks nama mapel
        const subjectPadding = 20;

        // Lebar minimal kolom mapel
        const minSubjectWidth = 60;

        const chunks = [];

        let currentChunk = [];
        let currentWidth = nameWidth;

        subjects.forEach((subject) => {
          const subjectText = String(subject);

          const textWidth =
            doc.widthOfString(subjectText, {
              fontSize: 10,
            }) + subjectPadding;

          const subjectWidth = Math.max(textWidth, minSubjectWidth);

          // Kalau mapel berikutnya tidak muat,
          // buat kelompok mapel baru.
          if (
            currentChunk.length > 0 &&
            currentWidth + subjectWidth > availableWidth
          ) {
            chunks.push(currentChunk);

            currentChunk = [];
            currentWidth = nameWidth;
          }

          currentChunk.push({
            name: subjectText,
            width: subjectWidth,
          });

          currentWidth += subjectWidth;
        });

        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }

        return chunks;
      };

      const drawReportHeader = (title = "LAPORAN ABSENSI SISWA") => {
        let headerY = 40;

        doc.fontSize(16).text(title, 0, headerY, {
          align: "center",
        });

        headerY += 22;

        if (semester_id) {
          doc.fontSize(10).text(`Periode Semester ${result.semester}`, {
            align: "center",
          });
        } else {
          doc
            .fontSize(10)
            .text(`Periode Bulan ${getMonthName(month)} ${year}`, {
              align: "center",
            });
        }

        headerY += 18;

        doc.fontSize(11).text(`Kelas : ${result.class_name}`, 30, headerY);

        headerY += 14;

        if (semester_id) {
          doc.text(
            `Semester : ${result.semester} (${result.academic_year})`,
            30,
            headerY,
          );
        } else {
          doc.text(`Periode : ${getMonthName(month)} ${year}`, 30, headerY);
        }

        return headerY + 22;
      };

      // =========================================================
      // MODE SEMUA MAPEL
      // =========================================================

      if (!subject_id) {
        const { subjects, data } = result;

        const subjectChunks = getSubjectChunks(subjects);

        subjectChunks.forEach((currentSubjects, chunkIndex) => {
          if (chunkIndex > 0) {
            doc.addPage();
          }

          let y = drawReportHeader();

          const headers = [
            "Nama",
            ...currentSubjects.map((subject) => subject.name),
          ];

          const widths = [
            160,
            ...currentSubjects.map((subject) => subject.width),
          ];

          const startX = getTableStartX(widths);

          drawRow(startX, y, headers, widths);

          y += 20;

          // -----------------------------------------------------
          // DATA SISWA
          // -----------------------------------------------------

          data.forEach((row) => {
            const values = [
              row.name,
              ...currentSubjects.map((subject) => row[subject.name] || 0),
            ];

            drawRow(startX, y, values, widths);

            y += 20;

            // ---------------------------------------------------
            // Kalau siswa sudah tidak muat secara vertikal
            // ---------------------------------------------------

            if (y + 20 > doc.page.height - doc.page.margins.bottom) {
              doc.addPage();

              y = 40;

              doc.fontSize(14).text("LAPORAN ABSENSI SISWA (Lanjutan)", 0, y, {
                align: "center",
              });

              y += 24;

              // Header tabel diulang
              drawRow(startX, y, headers, widths);

              y += 20;
            }
          });
        });
      } else {
        const { subject, data } = result;

        let y = 80;

        doc.fontSize(16).text("LAPORAN ABSENSI SISWA", 0, 40, {
          align: "center",
        });

        if (semester_id) {
          doc.fontSize(10).text(`Periode Semester ${result.semester}`, {
            align: "center",
          });
        } else {
          doc.fontSize(10).text(`Periode Bulan ${month}/${year}`, {
            align: "center",
          });
        }

        doc.fontSize(12).text(`Kelas: ${result.class_name}`, 40, y);

        y += 15;

        if (semester_id) {
          doc.text(
            `Semester: ${result.semester} (${result.academic_year})`,
            40,
            y,
          );
        } else {
          doc.text(`Periode: ${getMonthName(month)} ${year}`, 40, y);
        }

        y += 15;

        doc.text(`Mata Pelajaran: ${subject}`, 40, y);

        y += 20;

        const headers = ["Nama", "Total", "Hadir", "Izin", "Sakit", "Alpha"];

        const widths = [160, 70, 70, 70, 70, 70];

        const startX = getTableStartX(widths);

        drawRow(startX, y, headers, widths);

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

          drawRow(startX, y, values, widths);

          y += 20;

          if (y + 20 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();

            y = 50;

            doc.fontSize(14).text("LAPORAN ABSENSI SISWA (Lanjutan)", 0, y, {
              align: "center",
            });

            y += 24;

            drawRow(startX, y, headers, widths);

            y += 20;
          }
        });
      }

      doc.end();
    } catch (err) {
      console.error("[ERROR EXPORT PDF STUDENT]", err.message);

      res.status(500).json({
        message: err.message,
      });
    }
  }
}

export default StudentReportController;
