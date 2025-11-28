"use client"

import type React from "react"

import { createContext, useEffect } from "react"
import { useAuthStore } from "@/lib/store"

const AuthContext = createContext<null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedAuth = localStorage.getItem("auth")
    if (storedAuth) {
      const auth = JSON.parse(storedAuth)
      useAuthStore.setState({
        isAuthenticated: true,
        admin: auth.admin,
      })
    }
  }, [])

  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>
}
