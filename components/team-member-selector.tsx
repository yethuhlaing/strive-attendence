"use client";

import type { TeamMember } from "@/lib/types";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMemberSelectorProps {
  teamMembers: TeamMember[];
  selectedMember: TeamMember | null;
  onSelectMember: (member: TeamMember | null) => void;
}

export default function TeamMemberSelector({
  teamMembers,
  selectedMember,
  onSelectMember,
}: TeamMemberSelectorProps) {
  return (
    <div className="rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Select Your Name</h2>
      <Select
        value={selectedMember?.id || ""}
        onValueChange={(value) => {
          const member = teamMembers.find((m) => m.id === value) || null;
          onSelectMember(member);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your name" />
        </SelectTrigger>
        <SelectContent>
          {teamMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              <div className="flex items-center">
                {member.avatar && (
                  <div className="mr-2 relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {member.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
