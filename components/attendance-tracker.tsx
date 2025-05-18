"use client";

import { useState, useEffect } from "react";
import { deleteScheduleDay, getAttendanceData, updateAttendance } from "@/app/actions";
import TeamMemberSelector from "./team-member-selector";
import UserSchedule from "./user-schedule";
import WeekSelector from "./week-selector";
import CalendarView from "./calendar-view";
import { getCurrentWeekId, getNextWeeks } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";
import { Copy, GitCompare } from "lucide-react";

interface AttendanceTrackerProps {
  initialTeamMembers: TeamMember[];
}

export default function AttendanceTracker({
  initialTeamMembers,
}: AttendanceTrackerProps) {
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>(initialTeamMembers);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Add week selection state
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>(
    getCurrentWeekId()
  );
  const [showCopyControls, setShowCopyControls] = useState<boolean>(false);
  const [copySourceWeekId, setCopySourceWeekId] = useState<string>("");

  // Add loading state to prevent UI issues during updates
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Initialize available weeks on component mount
  useEffect(() => {
    // Get current week plus next 8 weeks (2 months)
    const weeks = getNextWeeks(8);
    setAvailableWeeks(weeks);

    // Set initial copy source week to current week
    setCopySourceWeekId(getCurrentWeekId());
    setTeamMembers(initialTeamMembers);
  }, []);

  useEffect(() => {
    const refreshData = async () => {
      try {
        // Fetch fresh data from the server on each page load
        const freshData = await getAttendanceData();
        setTeamMembers(freshData);

        // If a member was previously selected, update that selection with fresh data
        if (selectedMember) {
          const updatedMember = freshData.find(
            (m) => m.id === selectedMember.id
          );
          if (updatedMember) {
            setSelectedMember(updatedMember);
          }
        }
      } catch (error) {
        console.error("Error refreshing attendance data:", error);
      }
    };

    // Refresh data when component mounts and when weekId changes
    refreshData();
  }, [selectedWeekId]); // Also refresh when week changes
  

  const handleToggleDay = async (
    day: string,
    status: "office" | "remote",
    startTime: string | null = null,
    endTime: string | null = null
  ) => {
    if (!selectedMember || isUpdating) return;

    try {
      setIsUpdating(true);

      // Pass the selected week ID to the updateAttendance function
      const updatedMembers = await updateAttendance(
        selectedMember.id,
        selectedWeekId,
        day,
        status,
        startTime,
        endTime
      );

      // Replace the entire team members array to ensure state is fully updated
      setTeamMembers((prevMembers) => {
        // Create a deep copy of the previous state
        const newState = JSON.parse(JSON.stringify(updatedMembers));
        return newState;
      });

      // Update the selected member with the new data
      setSelectedMember((prevMember) => {
        if (!prevMember) return null;
        // Find the updated member in the new array
        const updatedMember = updatedMembers.find(
          (m) => m.id === prevMember.id
        );
        // Return a deep copy to ensure no reference issues
        return updatedMember
          ? JSON.parse(JSON.stringify(updatedMember))
          : prevMember;
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDay = async (day: string) => {
    if (!selectedMember || isUpdating) return;

    const confirmMessage = `Are you sure you want to delete ${
      selectedMember.name
    }'s schedule for ${day.charAt(0).toUpperCase() + day.slice(1)}?`;

    if (window.confirm(confirmMessage)) {
      try {
        setIsUpdating(true);

        // Call the server action to delete the day's schedule
        const updatedMembers = await deleteScheduleDay(
          selectedMember.id,
          selectedWeekId,
          day
        );

        // Update state with the new data
        setTeamMembers(updatedMembers);

        // Update the selected member with the new data
        const updatedSelectedMember = updatedMembers.find(
          (m) => m.id === selectedMember.id
        );

        if (updatedSelectedMember) {
          setSelectedMember(updatedSelectedMember);
        }
      } catch (error) {
        console.error("Error deleting day schedule:", error);
      } finally {
        setIsUpdating(false);
      }
    }
  };
  // Copy schedule from one week to another
  const handleCopySchedule = async () => {
    if (!selectedMember || !copySourceWeekId || isUpdating) return;

    const sourceWeekSchedule = selectedMember.attendance[copySourceWeekId];
    if (!sourceWeekSchedule) {
      console.log("No source week schedule found");
      return;
    }

    try {
      setIsUpdating(true);
      let currentMembers = [...teamMembers];

      // Copy each day's schedule from source week to target week
      for (const [day, schedule] of Object.entries(sourceWeekSchedule)) {
        if (schedule && schedule.status) {
          currentMembers = await updateAttendance(
            selectedMember.id,
            selectedWeekId,
            day,
            schedule.status,
            schedule.startTime,
            schedule.endTime
          );
        }
      }

      // Update state with the final result
      setTeamMembers(currentMembers);

      // Update the selected member with the new data
      const updatedSelectedMember = currentMembers.find(
        (m) => m.id === selectedMember.id
      );
      if (updatedSelectedMember) {
        setSelectedMember(updatedSelectedMember);
      }

      // Hide copy controls after successful copy
      setShowCopyControls(false);
    } catch (error) {
      console.error("Error copying schedule:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <TeamMemberSelector
        teamMembers={teamMembers}
        selectedMember={selectedMember}
        onSelectMember={setSelectedMember}
      />

      <WeekSelector
        availableWeeks={availableWeeks}
        selectedWeekId={selectedWeekId}
        onSelectWeek={setSelectedWeekId}
      />

      {selectedMember ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-xl font-semibold">
              {`${selectedMember.name}'s Schedule`}
            </h2>

            <div className="flex items-center gap-2">
              {showCopyControls ? (
                <>
                  <select
                    value={copySourceWeekId}
                    onChange={(e) => setCopySourceWeekId(e.target.value)}
                    className="text-sm border rounded-md px-3 py-1.5"
                    disabled={isUpdating}
                  >
                    {availableWeeks.map((weekId) => (
                      <option key={weekId} value={weekId}>
                        {weekId === getCurrentWeekId()
                          ? "Current Week"
                          : weekId}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleCopySchedule}
                    className={`flex items-center gap-1.5 text-sm bg-primary text-white px-3 py-1.5 rounded-md ${
                      isUpdating
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-primary/90"
                    }`}
                    disabled={isUpdating}
                  >
                    <GitCompare size={16} />
                    Copy to{" "}
                    {selectedWeekId === getCurrentWeekId()
                      ? "Current Week"
                      : selectedWeekId}
                  </button>

                  <button
                    onClick={() => setShowCopyControls(false)}
                    className="text-sm text-gray-500 px-3 py-1.5 hover:text-gray-700"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCopyControls(true)}
                  className={`flex items-center gap-1.5 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md ${
                    isUpdating
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-200"
                  }`}
                  disabled={isUpdating}
                >
                  <Copy size={16} />
                  Copy from Week
                </button>
              )}
            </div>
          </div>

          <UserSchedule
            selectedMember={selectedMember}
            weekId={selectedWeekId}
            onToggleDay={handleToggleDay}
            onDeleteDay={handleDeleteDay}
          />

          {isUpdating && (
            <div className="text-center text-sm text-primary">
              Saving changes...
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg shadow-md p-6 text-center">
          <p>Select your name to update your schedule</p>
        </div>
      )}

      <CalendarView teamMembers={teamMembers} weekId={selectedWeekId} />
    </div>
  );
}
