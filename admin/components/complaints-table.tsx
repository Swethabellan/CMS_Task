"use client"

import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, Filter, X } from "lucide-react"
import { ComplaintForm } from "./complaint-form"
import { DeleteConfirm } from "./delete-confirm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Complaint {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category?: string
  customer_id: string
  technician_id?: string
  customers: { name: string; email: string }
  technicians?: { name: string }
  created_at: string
}

export function ComplaintsTable({ initialData }: { initialData: Complaint[] }) {
  const [complaints, setComplaints] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const handleAdd = () => {
    // Close delete modal if open
    setDeleteId(null)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (id: string) => {
    // Close delete modal if open
    setDeleteId(null)
    setEditingId(id)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleSuccess = async () => {
    const response = await fetch("/api/complaints")
    const data = await response.json()
    setComplaints(data)
    handleFormClose()
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/complaints/${id}`, { method: "DELETE" })
      setComplaints(complaints.filter((c) => c.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error("[v0] Delete failed:", error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: "bg-red-100 text-red-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch =
        searchTerm === "" ||
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.customers.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.customers.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || complaint.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter
      const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [complaints, searchTerm, statusFilter, priorityFilter, categoryFilter])

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setCategoryFilter("all")
  }

  // Get unique categories from complaints
  const categories = useMemo(() => {
    return Array.from(new Set(complaints.map((c) => c.category).filter(Boolean))).filter((c): c is string => !!c)
  }, [complaints])

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">All Complaints ({filteredComplaints.length})</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Complaint
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by title, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            {/* <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Technician</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No complaints found matching your filters
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{complaint.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{complaint.customers.name}</div>
                    <div className="text-xs text-gray-500">{complaint.customers.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {complaint.technicians?.name || <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}
                    >
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}
                    >
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(complaint.id)}
                      className="p-2 hover:bg-gray-100 rounded text-primary"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        // Close form if open
                        setShowForm(false)
                        setEditingId(null)
                        setDeleteId(complaint.id)
                      }}
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

      {showForm && <ComplaintForm complaintId={editingId} onClose={handleFormClose} onSuccess={handleSuccess} />}

      {deleteId && (
        <DeleteConfirm
          title="Delete Complaint"
          message="Are you sure you want to delete this complaint?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  )
}
