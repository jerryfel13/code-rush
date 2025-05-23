"use client"
import { AdminDashboard, JudgeInterface } from "../components"
import { useAuth } from "../context/auth-context"

const Page = () => {
  const { userRole } = useAuth()

  if (userRole === "admin") {
    return <AdminDashboard />
  } else if (userRole === "judge") {
    return <JudgeInterface />
  } else {
    return <div>Access Denied</div>
  }
}

export default Page
