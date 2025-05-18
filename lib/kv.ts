import { kv } from "@vercel/kv"
import type { TeamMember } from "@/lib/types"
import { migrateTeamMembersIfNeeded } from "./date"

// Key for storing all team members
const TEAM_MEMBERS_KEY = "attendance:team-members"

// Initialize the database with sample data if it doesn't exist
export async function initializeDatabase(): Promise<void> {
  const exists = await kv.exists(TEAM_MEMBERS_KEY)

  if (!exists) {
    const sampleData = createSampleData()
    await kv.set(TEAM_MEMBERS_KEY, JSON.stringify(sampleData))
  }
}

// Get all team members
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  await initializeDatabase();

  const data = await kv.get<string>(TEAM_MEMBERS_KEY);
  if (!data) return [];
  try {
    // Handle either string or object format correctly
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    return migrateTeamMembersIfNeeded(parsedData);
  } catch (error) {
    console.error("Error parsing team members data:", error);
    return [];
  }
}

// Update a team member
export async function updateAttendance(
  memberId: string,
  weekId: string,
  day: string,
  status: "office" | "remote",
  startTime: string | null = null,
  endTime: string | null = null
): Promise<TeamMember[]> {
  // Get all team members
  const teamMembers = await getAllTeamMembers();

  // Find the member to update (using index to maintain array structure)
  const memberIndex = teamMembers.findIndex((m) => m.id === memberId);
  if (memberIndex === -1) {
    throw new Error(`Team member with ID ${memberId} not found`);
  }

  // Create a deep copy to avoid reference issues
  const updatedTeamMembers = JSON.parse(JSON.stringify(teamMembers));
  const memberToUpdate = updatedTeamMembers[memberIndex];

  // Initialize the week structure if it doesn't exist
  if (!memberToUpdate.attendance[weekId]) {
    memberToUpdate.attendance[weekId] = {};
  }

  // Update only the specific day while preserving other days
  memberToUpdate.attendance[weekId][day.toLowerCase()] = {
    status,
    startTime: status === "office" ? startTime : null,
    endTime: status === "office" ? endTime : null,
  };

  // Add logging for debugging
  console.log(
    `Updating ${memberToUpdate.name}'s schedule: ${weekId}, ${day} -> ${status}`
  );

  // Save the updated array
  await kv.set(TEAM_MEMBERS_KEY, JSON.stringify(updatedTeamMembers));

  return updatedTeamMembers;
}
// Add a new team member
export async function addNewTeamMember(newMember: TeamMember): Promise<TeamMember[]> {
  const teamMembers = await getAllTeamMembers()
  const updatedTeamMembers = [...teamMembers, newMember]

  await kv.set(TEAM_MEMBERS_KEY, JSON.stringify(updatedTeamMembers))
  return updatedTeamMembers
}

export async function deleteScheduleDay(
  memberId: string,
  weekId: string,
  day: string
): Promise<TeamMember[]> {
  // Get all team members
  const teamMembers = await getAllTeamMembers();

  // Find the member to update
  const memberIndex = teamMembers.findIndex((m) => m.id === memberId);
  if (memberIndex === -1) {
    throw new Error(`Team member with ID ${memberId} not found`);
  }

  // Create a deep copy to avoid reference issues
  const updatedTeamMembers = JSON.parse(JSON.stringify(teamMembers));
  const memberToUpdate = updatedTeamMembers[memberIndex];

  // Check if the week and day exist
  if (
    !memberToUpdate.attendance[weekId] ||
    !memberToUpdate.attendance[weekId][day.toLowerCase()]
  ) {
    throw new Error(
      `No schedule found for ${memberToUpdate.name} on ${day} in week ${weekId}`
    );
  }

  // Delete the specific day's schedule
  delete memberToUpdate.attendance[weekId][day.toLowerCase()];

  // If the week is now empty, you might want to clean it up (optional)
  if (Object.keys(memberToUpdate.attendance[weekId]).length === 0) {
    delete memberToUpdate.attendance[weekId];
  }

  // Log the operation
  console.log(`Deleting ${memberToUpdate.name}'s schedule: ${weekId}, ${day}`);

  // Save the updated array
  await kv.set(TEAM_MEMBERS_KEY, JSON.stringify(updatedTeamMembers));

  return updatedTeamMembers;
}

// Create sample data
function createSampleData(): TeamMember[] {
  return [
    {
      id: "1",
      name: "Alex",
      avatar: "/assets/team/alex.JPG",
      attendance: {},
    },
    {
      id: "2",
      name: "Artem",
      avatar: "/assets/team/artem.JPG",
      attendance: {},
    },
    {
      id: "3",
      name: "Ye",
      avatar: "/assets/team/ye.JPG",
      attendance: {},
    },
    {
      id: "4",
      name: "Jason",
      avatar: "/assets/team/jason.JPG",
      attendance: {},
    },
    {
      id: "5",
      name: "Maria",
      avatar: "/assets/team/maria.webp",
      attendance: {},
    },
    {
      id: "6",
      name: "Sini",
      avatar: "/assets/team/sini.webp",
      attendance: {},
    },
    {
      id: "7",
      name: "Phuong",
      avatar: "/assets/team/phoung.webp",
      attendance: {},
    },
    {
      id: "8",
      name: "David",
      avatar: "/assets/team/david.webp",
      attendance: {},
    },
    {
      id: "9",
      name: "Chris",
      avatar: "/placeholder-user.jpg",
      attendance: {},
    },
    {
      id: "10",
      name: "Iryna",
      avatar: "/assets/team/iryna.jpg",
      attendance: {},
    },
    {
      id: "11",
      name: "Diana",
      avatar: "/assets/team/diana.jpg",
      attendance: {},
    },
  ];
}
