"use client";

import type { TeamMember } from "@/lib/types";
import { formatWeekDisplay } from "@/lib/utils";

interface WeeklyCalendarViewProps {
  teamMembers: TeamMember[];
  weekId: string;
}

export default function WeeklyCalendarView({
  teamMembers,
  weekId,
}: WeeklyCalendarViewProps) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Filter out team members who haven't set any schedule for this week
  const membersWithSchedule = teamMembers.filter((member) => {
    const weekSchedule = member.attendance[weekId];
    if (!weekSchedule) return false;

    // Check if at least one day is set to "office"
    return Object.values(weekSchedule).some((day) => day?.status === "office");
  });

  if (membersWithSchedule.length === 0) {
    return (
      <div className="rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Team Schedule - {formatWeekDisplay(weekId)}
        </h2>
        <p className="text-center text-gray-500 py-8">
          No team members have scheduled office time for this week.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        Team Schedule - {formatWeekDisplay(weekId)}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 font-medium">Team Member</th>
              {days.map((day) => (
                <th key={day} className="text-left py-2 px-3 font-medium">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {membersWithSchedule.map((member) => {
              const weekSchedule = member.attendance[weekId] || {};

              return (
                <tr key={member.id} className="border-t">
                  <td className="py-2 px-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                      {member.avatar && (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </td>
                  {days.map((day) => {
                    const dayLower = day.toLowerCase();
                    const dayData = weekSchedule[dayLower] || {
                      status: "remote",
                      startTime: null,
                      endTime: null,
                    };
                    const isOffice = dayData.status === "office";

                    return (
                      <td key={day} className="py-2 px-3">
                        {isOffice ? (
                          <div>
                            <span className="inline-block bg-primary/20 text-primary px-2 py-1 rounded-md text-xs font-medium">
                              {dayData.startTime && dayData.endTime
                                ? `${dayData.startTime} - ${dayData.endTime}`
                                : "In Office"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Remote</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
