import AttendanceTracker from "@/components/attendance-tracker"
import { getAttendanceData } from "@/app/actions"
import type { Metadata } from "next"
import Image from "next/image"
import { ModeToggle } from "@/components/ui/mode-toggle"

export const metadata: Metadata = {
  title: "Office Attendance Tracker",
  description: "Track who is coming to the office each day",
}

export default async function Home() {
  const teamMembers = await getAttendanceData()

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="relative w-full flex items-center justify-center py-20">
        {/* Background blurred team image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/assets/team/team-background.png"
            // Replace with your actual team image path
            fill
            alt="Team Background"
            className="object-cover w-full h-full filter blur-sm opacity-50"
            priority
          />
        </div>

        {/* Content with logo */}
        <div className="relative z-10 flex items-center justify-center gap-3">
          {/* Light mode image */}
          <Image
            src="/assets/logo-light.png"
            width={350}
            height={350}
            alt="Logo Light"
            className="block dark:hidden"
          />

          {/* Dark mode image */}
          <Image
            src="/assets/logo-dark.png"
            width={350}
            height={350}
            alt="Logo Dark"
            className="hidden dark:block"
          />
        </div>
      </div>
      <AttendanceTracker initialTeamMembers={teamMembers} />
      <div className="fixed bottom-4 right-4 z-50">
        <ModeToggle />
      </div>
    </main>
  );
}
