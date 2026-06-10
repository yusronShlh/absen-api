import XLSX from "xlsx";

export const generateStudentTemplate = (classes) => {
  const workbook = XLSX.utils.book_new();

  const templateData = [
    {
      nisn: "1234567890",
      name: "Ahmad Fauzi",
      gender: "L",
      class_name: "X IPA 1",
    },
  ];

  const templateSheet = XLSX.utils.json_to_sheet(templateData);

  XLSX.utils.book_append_sheet(workbook, templateSheet, "Template siswa");

  const classData = classes.map((item) => ({ id: item.id, name: item.name }));

  const classSheet = XLSX.utils.json_to_sheet(classData);

  XLSX.utils.book_append_sheet(workbook, classSheet, "Daftar Kelas");

  return workbook;
};
