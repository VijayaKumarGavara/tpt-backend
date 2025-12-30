export default function normalizeHours(input) {
  const value = Number(input);

  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 100);

  if (minutes >= 60) {
    throw new Error("Invalid time format. Minutes must be less than 60.");
  }

  const normalized = hours + minutes / 60;
  return Number(normalized.toFixed(4));
}
