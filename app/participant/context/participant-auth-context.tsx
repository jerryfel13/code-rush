"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"

// Define participant roles
export type ParticipantRole = "participant" | null

// Define participant type
export type Participant = {
  id: string
  name: string
  email: string
  teamId: string
  teamName: string
  role: string
} | null

// Define auth context type
type ParticipantAuthContextType = {
  participant: Participant | null
  login: (participant: Participant) => void
  logout: () => Promise<void>
}

// Create the auth context
const ParticipantAuthContext = createContext<ParticipantAuthContextType | undefined>(undefined)

export function ParticipantAuthProvider({ children }: { children: React.ReactNode }) {
  const [participant, setParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const storedParticipant = localStorage.getItem("participant")
        if (storedParticipant) {
          setParticipant(JSON.parse(storedParticipant))
        }
      } else {
        // User is signed out
        setParticipant(null)
        localStorage.removeItem("participant")
      }
    })

    return () => unsubscribe()
  }, [])

  const login = (participant: Participant) => {
    setParticipant(participant)
    localStorage.setItem("participant", JSON.stringify(participant))
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setParticipant(null)
      localStorage.removeItem("participant")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <ParticipantAuthContext.Provider value={{ participant, login, logout }}>
      {children}
    </ParticipantAuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useParticipantAuth() {
  const context = useContext(ParticipantAuthContext)
  if (context === undefined) {
    throw new Error("useParticipantAuth must be used within a ParticipantAuthProvider")
  }
  return context
}
