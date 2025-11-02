import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function monthStringToDate(month: string): Date {
  const now = new Date();
  if (!month || month === "total") return now;
  const mapping: Record<string, number> = {
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
    january: 0,
    february: 1,
    march: 2,
  };
  const lower = month.toLowerCase();
  const monthIndex = mapping[lower];
  const year = ["january", "february", "march"].includes(lower)
    ? now.getFullYear() + 1
    : now.getFullYear();
  return Number.isInteger(monthIndex) ? new Date(year, monthIndex, 1) : now;
}

export const parseAmount = (value) =>
  Number(String(value).replace(/[^0-9.-]+/g, ""));

export const isSelectedMonth = (month: string, selectedMonth: string) => {
  return month == selectedMonth;
};
