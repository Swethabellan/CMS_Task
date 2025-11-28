"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Calendar, ArrowRight, Inbox } from "lucide-react"

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch("/api/complaints")
        if (response.status === 401) {
          router.push("/login")
          return
        }

        const { data, error } = await response.json()
        if (error) {
          console.error("Error fetching complaints:", error)
        } else {
          setComplaints(data || [])
        }
      } catch (err) {
        console.error("Error fetching complaints:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [router])

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Open: "bg-yellow-50 text-yellow-700 border-yellow-200",
      "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
      Resolved: "bg-green-50 text-green-700 border-green-200",
      Closed: "bg-gray-50 text-gray-700 border-gray-200",
    }
    return colors[status] || colors["Open"]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Complaints</h1>
          <p className="text-gray-600">Manage and track all your complaints</p>
        </div>
        <Link href="/raise-complaint">
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <Plus className="h-4 w-4 mr-2" />
            Raise New Complaint
          </Button>
        </Link>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Inbox className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No complaints yet</h3>
          <p className="text-gray-600 mb-6">Get started by raising your first complaint</p>
          <Link href="/raise-complaint">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Raise Your First Complaint
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint: any) => (
            <Link key={complaint.id} href={`/complaint/${complaint.id}`} className="group">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1 p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {complaint.title}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap ${getStatusBadge(complaint.status)}`}
                    >
                      {complaint.status}
                    </span>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
