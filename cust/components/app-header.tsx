"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import type { SessionUser } from "@/lib/auth"

const pageNames: Record<string, string> = {
  "/": "Home",
  "/complaints": "Your Complaints",
  "/raise-complaint": "Raise a Complaint",
  "/complaint": "Complaint Details",
}

export function AppHeader() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const { user: sessionUser } = await response.json()
        setUser(sessionUser || null)
      } catch (error) {
        console.error("Error checking session:", error)
        setUser(null)
      }
    }
    checkUser()
  }, [])

  if (!user) return null

  const getPageName = () => {
    const basePath = pathname.split("/")[1]
    if (pathname.startsWith("/complaint/")) return "Complaint Details"
    return pageNames[`/${basePath}`] || pageNames["/"]
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{getPageName()}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          {user?.name || user?.email}
        </div>
      </div>
    </header>
  )
}
