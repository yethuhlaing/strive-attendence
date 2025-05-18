"use server"

import type { TeamMember } from "@/lib/types"
import { getAllTeamMembers } from "@/lib/kv"
import {
  updateAttendance as kvUpdateAttendance,
  deleteScheduleDay as kvDeleteScheduleDay,
} from "@/lib/kv";
// Get attendance data - Server Action
export async function getAttendanceData(): Promise<TeamMember[]> {
  // Add a cache-busting parameter using the current timestamp
  // This ensures we always get fresh data from the database
  const timestamp = Date.now();
  return getAllTeamMembers({ cacheBuster: timestamp });
}
// Update attendance for a team member


export async function updateAttendance(
  memberId: string,
  weekId: string,
  day: string,
  status: "office" | "remote",
  startTime: string | null = null,
  endTime: string | null = null
) {
  return await kvUpdateAttendance(
    memberId,
    weekId,
    day,
    status,
    startTime,
    endTime
  );
}

export async function deleteScheduleDay(
  memberId: string,
  weekId: string,
  day: string
) {
  return await kvDeleteScheduleDay(memberId, weekId, day);
}
// Add a new team member
// export async function addTeamMember(name: string): Promise<TeamMember[]> {
//   const newMember: TeamMember = {
//     id: Date.now().toString(),
//     name,
//     avatar: null,
//     attendance: {
//       monday: {
//         status: "remote",
//         startTime: null,
//         endTime: null,
//       },
//       tuesday: {
//         status: "remote",
//         startTime: null,
//         endTime: null,
//       },
//       wednesday: {
//         status: "remote",
//         startTime: null,
//         endTime: null,
//       },
//       thursday: {
//         status: "remote",
//         startTime: null,
//         endTime: null,
//       },
//       friday: {
//         status: "remote",
//         startTime: null,
//         endTime: null,
//       },
//     },
//   }

//   return addNewTeamMember(newMember)
// }
