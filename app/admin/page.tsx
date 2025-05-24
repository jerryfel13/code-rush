"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./context/auth-context"
import { ProtectedRoute } from "./components/protected-route"
import { AdminDashboard } from "./components/admin-dashboard"
import { JudgeInterface } from "./components/judge-interface"
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPage() {
  const { userRole, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <ProtectedRoute>
      {userRole === "admin" ? <AdminDashboard /> : userRole === "judge" ? <JudgeInterface /> : null}
    </ProtectedRoute>
  )
}
