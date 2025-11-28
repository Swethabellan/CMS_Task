"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Calendar, Tag, MessageSquare, Send, User, Loader2, AlertCircle } from "lucide-react"

interface Complaint {
  id: string
  title: string
  description: string
  category?: string
  status: string
  created_at: string
  updated_at: string
}

interface Feedback {
  id: string
  message: string
  feedback_text?: string
  created_at: string
  user?: {
    id: string
    name?: string | null
    email: string
  }
}

export default function ComplaintDetailPage() {
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [feedbackText, setFeedbackText] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch complaint details
        const complaintResponse = await fetch(`/api/complaints/${params.id}`, {
          credentials: "include", // Include cookies for session
        })
        if (complaintResponse.status === 401) {
          router.push("/login")
          return
        }

        const complaintData = await complaintResponse.json()
        if (complaintData.data) {
          setComplaint(complaintData.data)
        }

        // Fetch feedbacks for this complaint
        const feedbackResponse = await fetch(`/api/feedbacks?complaint_id=${params.id}`, {
          credentials: "include", // Include cookies for session
        })
        const feedbackData = await feedbackResponse.json()
        setFeedbacks(feedbackData.data || [])

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, router])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session
        body: JSON.stringify({
          complaint_id: params.id,
          message: feedbackText,
        }),
      })

      const { data, error: apiError } = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (apiError || !response.ok) {
        setError(apiError || "Failed to submit feedback")
        return
      }

      // Refresh feedbacks
      const refreshResponse = await fetch(`/api/feedbacks?complaint_id=${params.id}`, {
        credentials: "include", // Include cookies for session
      })
      const refreshData = await refreshResponse.json()
      setFeedbacks(refreshData.data || [])
      setFeedbackText("")
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
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

  if (!complaint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white border border-gray-200 rounded-lg p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint not found</h2>
          <p className="text-gray-600">The complaint you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Open: "bg-yellow-50 text-yellow-700 border-yellow-200",
      "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
      Resolved: "bg-green-50 text-green-700 border-green-200",
      Closed: "bg-gray-50 text-gray-700 border-gray-200",
    }
    return colors[status] || colors["Open"]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {complaint.title}
              </h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(complaint.status)}`}>
                {complaint.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <Tag className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Category</p>
                  <p className="text-gray-900 font-medium">{complaint.category || "General"}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Submitted on</p>
                  <p className="text-gray-900 font-medium">{new Date(complaint.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">
                Feedback
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {feedbacks.length}
              </span>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {feedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No feedback yet</p>
                </div>
              ) : (
                feedbacks.map((feedback: any) => (
                  <div 
                    key={feedback.id} 
                    className="bg-gray-50 border border-gray-200 rounded-lg p-5"
                  >
                    <p className="text-gray-900 mb-3 leading-relaxed">{feedback.message || feedback.feedback_text}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{feedback.user?.name || feedback.user?.email || "Anonymous"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(feedback.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {complaint.status !== "Closed" && (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Add Feedback</label>
                  <Textarea
                    placeholder="Share your feedback or updates..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 min-h-24 focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="bg-primary hover:bg-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Details
            </h3>
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
                <p
                  className={`text-lg font-bold ${
                    complaint.status === "Resolved"
                      ? "text-green-600"
                      : complaint.status === "In Progress"
                        ? "text-blue-600"
                        : complaint.status === "Closed"
                          ? "text-gray-600"
                          : "text-yellow-600"
                  }`}
                >
                  {complaint.status}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Complaint ID</p>
                <p className="text-gray-900 text-xs break-all font-mono bg-white p-2 rounded border border-gray-200">
                  {complaint.id}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2">Total Feedbacks</p>
                <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
