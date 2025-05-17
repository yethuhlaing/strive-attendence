import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function getWeekId(date: Date): string {
  const year = date.getFullYear();
  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  // Calculate the week number (1-based)
  const weekNumber = Math.ceil(
    ((date.getTime() - firstDayOfYear.getTime()) / 86400000 +
      firstDayOfYear.getDay() +
      1) /
      7
  );

  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

export function getWeekRange(weekId: string): { start: Date; end: Date } {
  const [year, week] = weekId.split("-W");
  const firstDayOfYear = new Date(parseInt(year), 0, 1);
  const dayOffset = firstDayOfYear.getDay(); // 0 is Sunday, 1 is Monday, etc.

  // Calculate the first day of the week (Monday)
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(
    firstDayOfYear.getDate() + (parseInt(week) - 1) * 7 - dayOffset + 1
  );

  // Calculate the last day of the week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { start: weekStart, end: weekEnd };
}

export function formatWeekDisplay(weekId: string): string {
  const { start, end } = getWeekRange(weekId);
  const startMonth = start.toLocaleString("default", { month: "short" });
  const endMonth = end.toLocaleString("default", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  } else {
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  }
}

export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

export function getNextWeeks(count: number): string[] {
  const weeks = [];
  const currentDate = new Date();
  const currentWeekId = getWeekId(currentDate);
  weeks.push(currentWeekId);

  for (let i = 1; i <= count; i++) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + i * 7);
    weeks.push(getWeekId(nextDate));
  }

  return weeks;
}