"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParticipantAuth } from "../context/participant-auth-context"

interface ProtectedParticipantRouteProps {
  children: React.ReactNode
}

export function ProtectedParticipantRoute({ children }: ProtectedParticipantRouteProps) {
  const { isAuthenticated, isLoading } = useParticipantAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(" /login")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}
