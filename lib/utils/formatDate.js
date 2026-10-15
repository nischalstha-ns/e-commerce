/**
 * Normalize a Firestore Timestamp, Date, ISO string or epoch millis
 * into a Date. Returns null when the value can't be parsed.
 */
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === "function") {
    try {
      const d = value.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (typeof value.seconds === "number") {
    const d = new Date(value.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(timestamp, opts) {
  const d = toDate(timestamp);
  if (!d) return "N/A";
  return d.toLocaleDateString(
    "en-US",
    opts || { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );
}
