"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include", // Ensure cookies are sent
        })
        const data = await response.json()
        const { user } = data

        // Public routes that don't need authentication
        const publicRoutes = ["/login", "/signup"]
        const isPublicRoute = publicRoutes.includes(pathname)

        if (!user && !isPublicRoute) {
          // Not authenticated and trying to access protected route
          window.location.href = "/login"
          return
        }

        if (user && isPublicRoute) {
          // Already authenticated and trying to access auth pages
          // Use replace to prevent redirect loops
          window.location.replace("/")
          return
        }

        setIsAuthenticated(!!user)
      } catch (error) {
        console.error("Error checking auth:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const isPublicRoute = ["/login", "/signup"].includes(pathname)

  // For public routes, render without sidebar
  if (isPublicRoute) {
    return <>{children}</>
  }

  // For protected routes, render with sidebar and header
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <AppHeader />
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
