import type React from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { AuthProvider } from "./auth-context"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthProvider>
  )
}
