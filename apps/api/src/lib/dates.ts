import { eachDayOfInterval, formatISO, parseISO, startOfDay } from "date-fns";

export function toDateOnly(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return startOfDay(date);
}

export function dateKey(value: Date) {
  return formatISO(value, { representation: "date" });
}

export function dateRange(startDate: Date, endDate: Date) {
  return eachDayOfInterval({ start: startDate, end: endDate });
}
