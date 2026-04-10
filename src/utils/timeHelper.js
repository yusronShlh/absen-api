export function getWIBDate() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
}

export function getWIBDateString() {
  return getWIBDate().toISOString().slice(0, 10);
}

export function getWIBTimeString() {
  return getWIBDate().toTimeString().slice(0, 5);
}

export function getWIBDayName() {
  return getWIBDate()
    .toLocaleDateString("id-ID", { weekday: "long" })
    .toLowerCase();
}
