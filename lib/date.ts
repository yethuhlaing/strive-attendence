import { WeekRange, WeekOption } from "@/lib/types";

/**
 * Generates a week identifier in the format YYYY-Wnn (e.g., 2025-W20)
 */
export function getWeekId(date: Date): string {
  const year = date.getFullYear();

  // Get first day of the year
  const firstDay = new Date(year, 0, 1);

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();

  // Calculate days since first day of year
  const daysSinceFirstDay = Math.floor(
    (date.getTime() - firstDay.getTime()) / 86400000
  );

  // Calculate the week number
  // Add days in the first week and divide by 7, rounding up
  const weekNum = Math.ceil((daysSinceFirstDay + firstDayOfWeek + 1) / 7);

  // Format with padding (e.g., 2025-W01 instead of 2025-W1)
  return `${year}-W${weekNum.toString().padStart(2, "0")}`;
}

/**
 * Gets the week ID for the current week
 */
export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

/**
 * Gets the date range for a given week ID
 */
export function getWeekRange(weekId: string): WeekRange {
  const [yearStr, weekStr] = weekId.split("-W");
  const year = parseInt(yearStr);
  const weekNum = parseInt(weekStr);

  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);

  // Get the day of week for Jan 1 (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeekDay = firstDayOfYear.getDay();

  // Calculate the date for the first day of the requested week
  // Start with Jan 1, adjust for first day not being Monday, then add weeks
  const dayOffset = firstDayOfWeekDay === 0 ? 1 : firstDayOfWeekDay; // If Sunday, add 1, otherwise adjust by day number
  const daysToAdd = (weekNum - 1) * 7 - (dayOffset - 1);

  const weekStart = new Date(year, 0, 1);
  weekStart.setDate(weekStart.getDate() + daysToAdd);

  // End date is 6 days after start (inclusive range)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { start: weekStart, end: weekEnd };
}

/**
 * Formats a week ID for display (e.g., "May 18 - 24, 2025")
 */
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

/**
 * Checks if a week ID represents the current week
 */
export function isCurrentWeek(weekId: string): boolean {
  return weekId === getCurrentWeekId();
}

/**
 * Gets a list of week options for the selector
 */
export function getWeekOptions(numWeeks: number = 8): WeekOption[] {
  const currentDate = new Date();
  const currentWeekId = getCurrentWeekId();
  const options: WeekOption[] = [];

  // Add current week
  options.push({
    id: currentWeekId,
    display: `Current Week (${formatWeekDisplay(currentWeekId)})`,
    isCurrent: true,
  });

  // Add future weeks
  for (let i = 1; i <= numWeeks; i++) {
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + i * 7);

    const weekId = getWeekId(futureDate);
    options.push({
      id: weekId,
      display: formatWeekDisplay(weekId),
      isCurrent: false,
    });
  }

  return options;
}

/**
 * Gets a list of week IDs for the next n weeks including current week
 */
export function getNextWeeks(count: number = 8): string[] {
  return getWeekOptions(count).map((option) => option.id);
}

/**
 * Gets the day names for a week
 */
export function getWeekdayNames(): string[] {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
}

/**
 * Gets shortened day names
 */
export function getShortWeekdayNames(): string[] {
  return ["Mon", "Tue", "Wed", "Thu", "Fri"];
}

/**
 * Gets the dates for each day in a week
 */
export function getWeekDates(weekId: string): Date[] {
  const { start } = getWeekRange(weekId);
  const dates: Date[] = [];

  // Add Monday through Friday
  for (let i = 0; i < 5; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }

  return dates;
}

export function migrateTeamMembersIfNeeded(members: any) {
  if (!Array.isArray(members)) {
    console.error("Expected array of members, got:", typeof members);
    return [];
  }

  const currentWeekId = getCurrentWeekId();
  let needsMigration = false;

  // Check if any member needs migration (has old format attendance)
  for (const member of members) {
    if (
      member.attendance &&
      typeof member.attendance === "object" &&
      !Object.keys(member.attendance).some((key) => key.includes("-W"))
    ) {
      needsMigration = true;
      break;
    }
  }

  if (!needsMigration) {
    return members;
  }

  console.log("Migrating team members data to multi-week format");

  // Perform migration
  const migratedMembers = members.map((member) => {
    // If member doesn't have attendance or it's not an object, initialize it
    if (!member.attendance || typeof member.attendance !== "object") {
      return {
        ...member,
        attendance: {
          [currentWeekId]: {},
        },
      };
    }

    // If the member already has the new format, return as is
    if (Object.keys(member.attendance).some((key) => key.includes("-W"))) {
      return member;
    }

    // Migrate from old format to new format by moving all attendance
    // data under the current week ID
    const oldAttendance = { ...member.attendance };

    return {
      ...member,
      attendance: {
        [currentWeekId]: oldAttendance,
      },
    };
  });

  // Save the migrated data
  console.log("Migration complete. Saving migrated data...");

  try {
    // Note: This is handled outside the function in the main code
    // kv.set(TEAM_MEMBERS_KEY, JSON.stringify(migratedMembers))
    //   .catch(error => console.error("Error saving migrated data:", error));
  } catch (error) {
    console.error("Error during migration:", error);
  }

  return migratedMembers;
}
