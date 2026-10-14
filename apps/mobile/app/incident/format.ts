// Dates on "Мой случай". Stored in UTC, shown on this phone's clock. Browsers ship no Tajik date locale; Russian month
// names are read by every Tajik speaker, English ones are not (decided 2026-10-10), so both languages format with ru-RU.

const dayMonth = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });
const dayMonthYear = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
const shortMonth = new Intl.DateTimeFormat("ru-RU", { month: "short" });
const clock = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

// "13 октября", with the year only when it is not this year.
export function formatDay(d: Date, now: Date): string {
  return d.getFullYear() === now.getFullYear() ? dayMonth.format(d) : dayMonthYear.format(d);
}

// "окт" for the calendar tile: the browser writes "окт.", the dot goes so every tile reads the same.
export function formatShortMonth(d: Date): string {
  return shortMonth.format(d).replace(/\.$/, "");
}

// "12:14", 24-hour.
export function formatTime(d: Date): string {
  return clock.format(d);
}
