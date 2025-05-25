"use client"

import type { Participant } from "../context/participant-auth-context"
import { Button } from "@/components/ui/button"
import { Code, LogOut, User as UserIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

interface ParticipantHeaderProps {
  participant: Participant
  onLogout: () => void
}

export function ParticipantHeader({ participant, onLogout }: ParticipantHeaderProps) {
  return (
    <header className="border-b border-cyan-700/40 bg-[#181c24]/80 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-cyan-400 drop-shadow" />
          <span className="font-bold text-xl text-cyan-300 drop-shadow">CodeCompete</span>
          <span className="text-sm text-purple-300 ml-2 drop-shadow">Participant Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center justify-center h-9 w-9 rounded-full border-2 border-cyan-400 bg-black/40 shadow-[0_0_10px_rgba(0,255,247,0.2)] hover:shadow-[0_0_15px_rgba(0,255,247,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan-400">
                <UserIcon className="h-6 w-6 text-cyan-300" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#181c24] border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(0,255,247,0.2)]">
              <DropdownMenuLabel className="text-cyan-300">{participant?.name || "Participant"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer hover:bg-cyan-900/30 text-cyan-200">
                <LogOut className="h-4 w-4 mr-2 text-cyan-400" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
