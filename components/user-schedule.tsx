"use client";

import type { TeamMember } from "@/lib/types";
import { Trash2 } from "lucide-react"; // Add this import

interface UserScheduleProps {
  selectedMember: TeamMember;
  weekId: string;
  onToggleDay: (
    day: string,
    status: "office" | "remote",
    startTime: string | null,
    endTime: string | null
  ) => void;
  onDeleteDay: (day: string) => void; // Add this prop
}
export default function UserSchedule({
  selectedMember,
  weekId,
  onToggleDay,
  onDeleteDay,
}: UserScheduleProps) {
  // Initialize the week schedule if it doesn't exist
  const weekSchedule = selectedMember.attendance[weekId] || {};

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ] as const;

  // Function to handle toggle that preserves existing data
  const handleToggle = (day: string, currentStatus: "office" | "remote") => {
    // If switching from remote to office, use default times or preserve existing if any
    const newStatus = currentStatus === "office" ? "remote" : "office";
    const dayData = weekSchedule[day.toLowerCase()] || {
      status: "remote",
      startTime: null,
      endTime: null,
    };

    // When switching to office, either keep existing times or use defaults
    const startTime =
      newStatus === "office" ? dayData.startTime || "09:00" : null;

    const endTime = newStatus === "office" ? dayData.endTime || "17:00" : null;

    onToggleDay(day.toLowerCase(), newStatus, startTime, endTime);
  };

  // Function to update time while preserving status and other time
  const handleTimeChange = (
    day: string,
    timeType: "startTime" | "endTime",
    value: string
  ) => {
    const dayData = weekSchedule[day.toLowerCase()] || {
      status: "office",
      startTime: "09:00",
      endTime: "17:00",
    };

    // Create updated times, preserving the other time value
    const startTime = timeType === "startTime" ? value : dayData.startTime;
    const endTime = timeType === "endTime" ? value : dayData.endTime;

    onToggleDay(day.toLowerCase(), "office", startTime, endTime);
  };

  return (
    <div className="rounded-lg shadow-md px-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-5">
        {days.map((day) => {
          const dayLower = day.toLowerCase();

          // Get day data from the selected week, or use default values
          const dayData = weekSchedule[dayLower] || {
            status: "remote",
            startTime: null,
            endTime: null,
          };

          const isOffice = dayData.status === "office";
          const hasSchedule = weekSchedule[dayLower] !== undefined;

          return (
            <div key={day} className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{day}</span>
                {hasSchedule && (
                  <button
                    onClick={() => onDeleteDay(dayLower)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete schedule"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => handleToggle(dayLower, dayData.status)}
                className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors mb-2 ${
                  isOffice
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {isOffice ? "In Office" : "Remote"}
              </button>

              {isOffice && (
                <div className="space-y-2">
                  <div className="flex flex-col">
                    <label
                      htmlFor={`${dayLower}-start`}
                      className="text-xs text-gray-500 mb-1"
                    >
                      Start Time
                    </label>
                    <input
                      id={`${dayLower}-start`}
                      type="time"
                      value={dayData.startTime || "09:00"}
                      onChange={(e) =>
                        handleTimeChange(dayLower, "startTime", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor={`${dayLower}-end`}
                      className="text-xs text-gray-500 mb-1"
                    >
                      End Time
                    </label>
                    <input
                      id={`${dayLower}-end`}
                      type="time"
                      value={dayData.endTime || "17:00"}
                      onChange={(e) =>
                        handleTimeChange(dayLower, "endTime", e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
