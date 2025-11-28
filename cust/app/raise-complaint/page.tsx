"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function RaiseComplaintPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("General")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!title || !description) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
        }),
      })

      const { data, error: apiError } = await response.json()

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (apiError || !response.ok) {
        setError(apiError || "Failed to raise complaint")
        return
      }

      setSuccess("Complaint raised successfully!")
      setTitle("")
      setDescription("")
      setCategory("General")

      setTimeout(() => {
        router.push("/complaints")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to raise complaint")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Raise a Complaint</h1>
              <p className="text-gray-600">Fill out the form below to submit your complaint</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                <option>General</option>
                <option>Product Quality</option>
                <option>Service</option>
                <option>Billing</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Complaint Title</label>
              <Input
                type="text"
                placeholder="Brief title of your complaint"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <Textarea
                placeholder="Describe your complaint in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 min-h-32 focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary hover:bg-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Complaint
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
