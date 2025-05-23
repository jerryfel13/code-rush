"use client"

import type React from "react"

import { ParticipantAuthProvider } from "./context/participant-auth-context"

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ParticipantAuthProvider>{children}</ParticipantAuthProvider>
}
