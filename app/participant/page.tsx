"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ParticipantInterface } from "./components/participant-interface"
import { useParticipantAuth } from "./context/participant-auth-context"

export default function ParticipantPage() {
  const { isAuthenticated, isLoading } = useParticipantAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated after the component mounts
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // If loading or not authenticated, show loading or nothing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // If authenticated, show the participant interface
  return <ParticipantInterface />
}
