export interface DaySchedule {
  status: "office" | "remote";
  startTime: string | null;
  endTime: string | null;
}

export interface WeekSchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  [key: string]: DaySchedule | undefined;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  // Updated to support multiple weeks
  attendance: {
    [weekId: string]: WeekSchedule;
  };
}

// Week helper types
export interface WeekRange {
  start: Date;
  end: Date;
}

export interface WeekOption {
  id: string;
  display: string;
  isCurrent: boolean;
}
