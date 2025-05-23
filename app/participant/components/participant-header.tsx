"use client"

import type { Participant } from "../context/participant-auth-context"
import { Button } from "@/components/ui/button"
import { Code, LogOut } from "lucide-react"

interface ParticipantHeaderProps {
  participant: Participant
  onLogout: () => void
}

export function ParticipantHeader({ participant, onLogout }: ParticipantHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">CodeCompete</span>
          <span className="text-sm text-muted-foreground ml-2">Participant Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm hidden md:inline-block">
            Logged in as <span className="font-medium">{participant?.name}</span>
          </span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
