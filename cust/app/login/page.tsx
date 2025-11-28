"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent and received
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to login")
        setLoading(false)
        return
      }
      
      // Verify we got a successful response with user data
      if (data.user) {
        // Cookie is set server-side in response headers
        // Force immediate redirect - this must happen synchronously
        // Stop all React execution and force navigation
        window.location.replace("/")
        // Return immediately to prevent any further code execution
        return
      } else {
        setError("Login failed - no user data received")
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || "Failed to login")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDMuMzE0LTIuNjg2IDYtNiA2cy02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNnoiIGZpbGw9InJnYmEoNTksMTMwLDI0NiwwLjE1KSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="glass rounded-2xl shadow-2xl p-8 border border-white/10 backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-float">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-300 text-center mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-slide-in-up">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-600/50 text-white pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-glow disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

