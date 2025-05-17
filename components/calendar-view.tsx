"use client";

import { useState } from "react";
import { Calendar, Users } from "lucide-react";
import type { TeamMember } from "@/lib/types";
import {
  getWeekDates,
  getShortWeekdayNames,
  formatWeekDisplay,
} from "@/lib/date";

interface CalendarViewProps {
  teamMembers: TeamMember[];
  weekId: string;
}

export default function CalendarView({
  teamMembers,
  weekId,
}: CalendarViewProps) {
  const [viewType, setViewType] = useState<"list" | "calendar">("calendar");

  const weekdays = getShortWeekdayNames();
  const dates = getWeekDates(weekId);

  // Get team members who are in the office for each day
  const getMembersInOfficeByDay = () => {
    const membersByDay: Record<string, TeamMember[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    teamMembers.forEach((member) => {
      const weekSchedule = member.attendance[weekId];
      if (!weekSchedule) return;

      Object.entries(weekSchedule).forEach(([day, schedule]) => {
        if (schedule?.status === "office") {
          membersByDay[day].push(member);
        }
      });
    });

    return membersByDay;
  };

  const membersByDay = getMembersInOfficeByDay();

  // Format date as "14" (just the day)
  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  return (
    <div className="rounded-lg shadow-md p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Office Schedule - {formatWeekDisplay(weekId)}
        </h2>

        <div className="flex rounded-md overflow-hidden">
          <button
            onClick={() => setViewType("list")}
            className={`flex items-center px-3 py-1.5 text-sm font-medium ${
              viewType === "list"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Users size={16} className="mr-2" />
            List
          </button>
          <button
            onClick={() => setViewType("calendar")}
            className={`flex items-center px-3 py-1.5 text-sm font-medium ${
              viewType === "calendar"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar size={16} className="mr-2" />
            Calendar
          </button>
        </div>
      </div>

      {viewType === "list" ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-medium">Team Member</th>
                {weekdays.map((day, index) => (
                  <th key={day} className="text-left py-2 px-3 font-medium">
                    <div>{day}</div>
                    <div className="text-xs text-gray-500">
                      {formatDay(dates[index])}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => {
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
                        <div className="text-xs text-gray-500">
                          {member.role}
                        </div>
                      </div>
                    </td>
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                    ].map((day) => {
                      const dayData = weekSchedule[day] || {
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
                            <span className="text-gray-400 text-sm">
                              Remote
                            </span>
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
      ) : (
        <div className="grid md:grid-cols-5 gap-4">
          {["monday", "tuesday", "wednesday", "thursday", "friday"].map(
            (day, index) => {
              const membersInOffice = membersByDay[day] || [];

              return (
                <div key={day} className="rounded-lg border p-4">
                  <div className="text-center mb-3">
                    <div className="font-medium">{weekdays[index]}</div>
                    <div className="text-3xl font-bold mt-1">
                      {formatDay(dates[index])}
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 mb-3" />

                  {membersInOffice.length > 0 ? (
                    <div className="space-y-3">
                      {membersInOffice.map((member) => {
                        const schedule = member.attendance[weekId]?.[day];
                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-2"
                          >
                            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                              {member.avatar && (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {member.name}
                              </div>
                              {schedule?.startTime && schedule?.endTime && (
                                <div className="text-xs text-gray-500">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No team members in office
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
