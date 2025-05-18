import AttendanceTracker from "@/components/attendance-tracker"
import { getAttendanceData } from "@/app/actions"
import type { Metadata } from "next"
import Image from "next/image"
import { ModeToggle } from "@/components/ui/mode-toggle"
import LogoHeader from "@/components/logo-header"

export const metadata: Metadata = {
  title: "Strive Attendence",
  description: "Track who is coming to the office each day",
}

export default async function Home() {
  const teamMembers = await getAttendanceData()
  console.log("team member", teamMembers)
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="relative w-full flex items-center justify-center py-20">
        {/* Background blurred team image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/team/team-background.webp"
            // Replace with your actual team image path
            fill
            alt="Team Background"
            className="object-cover w-full h-full filter blur-sm opacity-50"
            priority
          />
        </div>

        {/* Content with logo */}
        <LogoHeader />
      </div>
      <AttendanceTracker initialTeamMembers={teamMembers} />
      <div className="fixed bottom-4 right-4 z-50">
        <ModeToggle />
      </div>
    </main>
  );
}
