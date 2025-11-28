"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Sparkles, ArrowRight } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include", // Ensure cookies are sent
        })
        const { user: sessionUser } = await response.json()
        setUser(sessionUser || null)
      } catch (error) {
        console.error("Error checking session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDMuMzE0LTIuNjg2IDYtNiA2cy02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNnoiIGZpbGw9InJnYmEoNTksMTMwLDI0NiwwLjEpIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="w-full max-w-md relative z-10 animate-scale-in">
          <div className="glass rounded-2xl shadow-2xl p-8 border border-white/10 backdrop-blur-xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-float">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Welcome
            </h1>
            <p className="text-slate-300 text-center mb-8">Complaint Management System</p>
            <div className="space-y-3">
              <Link href="/login" className="w-full block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-glow">
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full block">
                <Button variant="outline" className="w-full glass hover:bg-white/10 border-white/20 text-white hover:text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Manage your complaints efficiently</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/complaints" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">View Complaints</h2>
            </div>
            <p className="text-gray-600 mb-4">View all your complaints and track their status</p>
            <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
              <span className="text-sm">View All</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </Link>

        <Link href="/raise-complaint" className="group">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Raise Complaint</h2>
            </div>
            <p className="text-gray-600 mb-4">File a new complaint and get it resolved quickly</p>
            <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
              <span className="text-sm">Get Started</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
