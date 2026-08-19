export function getWIBDate() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
}

export function getWIBDateString() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now);
}

export function getWIBTimeString() {
  return getWIBDate().toTimeString().slice(0, 5);
}

export function getWIBDayName() {
  return getWIBDate()
    .toLocaleDateString("id-ID", { weekday: "long" })
    .toLowerCase();
}

export function getCurrentWIBYear() {
  return getWIBDate().getFullYear();
}

export function getCurrentWIBMonth() {
  return getWIBDate().getMonth() + 1;
}

export const getMonthName = (month) => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return months[Number(month) - 1] || month;
};
