"use client"

import type React from "react"

import { AuthProvider } from "./context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { AdminAuthProvider } from "./context/admin-auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
      <Toaster />
    </AuthProvider>
  )
}
