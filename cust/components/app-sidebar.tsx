"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { FileText, Plus, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SessionUser } from "@/lib/auth"

export function AppSidebar() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const router = useRouter()
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      router.push("/login")
    }
  }

  if (!user) return null

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/complaints", label: "View Complaints", icon: FileText },
    { href: "/raise-complaint", label: "Raise Complaint", icon: Plus },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">Customer</h1>
        <p className="text-sm text-gray-600">Portal</p>
      </div>

      <nav className="p-4 flex-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = 
            pathname === link.href || 
            (link.href === "/complaints" && pathname.startsWith("/complaint"))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-primary/10"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
