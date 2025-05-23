"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-context"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
        <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  )
}
