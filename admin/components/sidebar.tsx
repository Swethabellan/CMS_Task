"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Users, AlertCircle, MessageSquare, Wrench, LogOut, Clock } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    localStorage.removeItem("auth")
    router.push("/")
  }

  const links = [
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/complaints", label: "Complaints", icon: AlertCircle },
    { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/dashboard/technicians", label: "Technicians", icon: Wrench },
    { href: "/dashboard/service-history", label: "Service History", icon: Clock },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">Admin</h1>
        <p className="text-sm text-gray-600">Dashboard</p>
      </div>

      <nav className="p-4 flex-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-primary-light"
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
