"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define user roles
export type UserRole = "admin" | "judge" | null

// Define user type
export type User = {
  id: string
  name: string
  email: string
  role: UserRole
} | null

// Define auth context type
type AuthContextType = {
  user: User
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin" as UserRole,
  },
  {
    id: "2",
    name: "Judge One",
    email: "judge1@example.com",
    password: "judge123",
    role: "judge" as UserRole,
  },
  {
    id: "3",
    name: "Judge Two",
    email: "judge2@example.com",
    password: "judge123",
    role: "judge" as UserRole,
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return {
    user: context.user,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
    isAuthenticated: !!context.user,
    userRole: context.user?.role || null,
  }
}
