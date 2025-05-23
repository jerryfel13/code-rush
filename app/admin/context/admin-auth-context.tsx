"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"

// Define admin type
export type Admin = {
  id: string
  name: string
  email: string
  role: string
} | null

// Define auth context type
type AdminAuthContextType = {
  admin: Admin | null
  login: (admin: Admin) => void
  logout: () => Promise<void>
}

// Create the auth context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const storedAdmin = localStorage.getItem("admin")
        if (storedAdmin) {
          setAdmin(JSON.parse(storedAdmin))
        }
      } else {
        // User is signed out
        setAdmin(null)
        localStorage.removeItem("admin")
      }
    })

    return () => unsubscribe()
  }, [])

  const login = (admin: Admin) => {
    setAdmin(admin)
    localStorage.setItem("admin", JSON.stringify(admin))
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setAdmin(null)
      localStorage.removeItem("admin")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
} 