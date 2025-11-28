"use client"

import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, Star, X } from "lucide-react"
import { FeedbackForm } from "./feedback-form"
import { DeleteConfirm } from "./delete-confirm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Feedback {
  id: string
  title?: string | null
  message: string
  rating?: number | null
  customer_id: string
  complaint_id?: string | null
  customers: { name: string; email: string }
  created_at: string
}

export function FeedbackTable({ initialData }: { initialData: Feedback[] }) {
  const [feedbacks, setFeedbacks] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [hasComplaintFilter, setHasComplaintFilter] = useState<string>("all")

  const handleAdd = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleSuccess = async () => {
    const response = await fetch("/api/feedback")
    const data = await response.json()
    setFeedbacks(data)
    handleFormClose()
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/feedback/${id}`, { method: "DELETE" })
      setFeedbacks(feedbacks.filter((f) => f.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  // const renderStars = (rating: number) => {
  //   return (
  //     <div className="flex gap-1">
  //       {[1, 2, 3, 4, 5].map((i) => (
  //         <Star key={i} size={16} className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
  //       ))}
  //     </div>
  //   )
  // }

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesSearch =
        searchTerm === "" ||
        feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.customers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.customers.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.title && feedback.title.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesRating = ratingFilter === "all" || (feedback.rating && feedback.rating.toString() === ratingFilter)
      
      const matchesComplaintFilter = 
        hasComplaintFilter === "all" ||
        (hasComplaintFilter === "with" && feedback.complaint_id) ||
        (hasComplaintFilter === "without" && !feedback.complaint_id)

      return matchesSearch  && matchesComplaintFilter
    })
  }, [feedbacks, searchTerm, ratingFilter, hasComplaintFilter])

  const hasActiveFilters = searchTerm !== "" || ratingFilter !== "all" || hasComplaintFilter !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setRatingFilter("all")
    setHasComplaintFilter("all")
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">All Feedback ({filteredFeedbacks.length})</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Feedback
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by message, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

         
            {/* <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select> */}

            {/* Complaint Association Filter */}
            <Select value={hasComplaintFilter} onValueChange={setHasComplaintFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Complaint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="with">With Complaint</SelectItem>
                <SelectItem value="without">Without Complaint</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-white transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {/* <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th> */}
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                {/* <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th> */}
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Message</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No feedback found matching your filters
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((feedback) => (
                <tr key={feedback.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {/* <td className="px-6 py-4 text-sm text-gray-900">{feedback.title}</td> */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{feedback.customers.name}</div>
                    <div className="text-xs text-gray-500">{feedback.customers.email}</div>
                  </td>
                  {/* <td className="px-6 py-4">{renderStars(feedback.rating)}</td> */}
                  <td className="px-6 py-4 text-sm text-gray-600 truncate">{feedback.message}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {/* <button
                      onClick={() => handleEdit(feedback.id)}
                      className="p-2 hover:bg-gray-100 rounded text-primary"
                    >
                      <Edit size={18} />
                    </button> */}
                    <button
                      onClick={() => setDeleteId(feedback.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <FeedbackForm feedbackId={editingId} onClose={handleFormClose} onSuccess={handleSuccess} />}

      {deleteId && (
        <DeleteConfirm
          title="Delete Feedback"
          message="Are you sure you want to delete this feedback?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  )
}
