import XLSX from "xlsx";

export const generateTeacherTemplate = () => {
  const data = [];

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: ["nip", "name"],
  });

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Guru");

  return workbook;
};
