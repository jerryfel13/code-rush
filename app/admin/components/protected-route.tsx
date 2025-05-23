"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"
import type { UserRole } from "../context/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles = ["admin", "judge"] }: ProtectedRouteProps) {
  const { isAuthenticated, userRole, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login")
    } else if (!isLoading && isAuthenticated && userRole && !allowedRoles.includes(userRole)) {
      // Redirect if user doesn't have the required role
      router.push("/admin/unauthorized")
    }
  }, [isAuthenticated, isLoading, router, userRole, allowedRoles])

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

  // If authenticated but wrong role, don't render children
  if (userRole && !allowedRoles.includes(userRole)) {
    return null
  }

  // If authenticated and has correct role, render children
  return <>{children}</>
}
