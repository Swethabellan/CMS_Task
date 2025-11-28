"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useNotificationStore } from "@/lib/store"

interface Complaint {
  id?: string
  title: string
  description: string
  status: string
  priority: string
  customer_id: string
  technician_id?: string
}

interface Customer {
  id: string
  name: string
}

interface Technician {
  id: string
  name: string
  availability?: string
}

interface ComplaintFormProps {
  complaintId: string | null
  onClose: () => void
  onSuccess: () => void
}

export function ComplaintForm({ complaintId, onClose, onSuccess }: ComplaintFormProps) {
  const [form, setForm] = useState<Complaint>({
    title: "",
    description: "",
    status: "open",
    priority: "medium",
    customer_id: "",
    technician_id: "",
  })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const addNotification = useNotificationStore((state) => state.addNotification)

  useEffect(() => {
    fetchCustomers()
    if (complaintId) {
      // When editing, fetch complaint first, then fetch technicians with the assigned tech ID
      fetchComplaint().then((technicianId) => {
        fetchTechnicians(technicianId)
      })
    } else {
      // When creating new, just fetch available technicians
      fetchTechnicians()
    }
  }, [complaintId])

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers")
      if (!res.ok) {
        throw new Error(`Failed to fetch customers: ${res.status}`)
      }
      const data = await res.json()
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setCustomers(data)
      } else {
        console.error("Customers API returned non-array data:", data)
        setCustomers([])
        setError("Failed to load customers: Invalid response format")
      }
    } catch (err) {
      console.error("Error fetching customers:", err)
      setCustomers([]) // Ensure customers is always an array
      setError(err instanceof Error ? err.message : "Failed to load customers")
    }
  }

  const fetchTechnicians = async (assignedTechnicianId?: string) => {
    try {
      // Fetch only available technicians
      const res = await fetch("/api/technicians?availability=available")
      const availableTechnicians = await res.json()
      
      // If there's an assigned technician, also fetch that one
      // to ensure it's shown in the dropdown even if not available
      const technicianId = assignedTechnicianId || form.technician_id
      if (technicianId && technicianId.trim() !== "") {
        const allRes = await fetch("/api/technicians")
        const allTechnicians = await allRes.json()
        const assignedTech = allTechnicians.find((t: Technician) => t.id === technicianId)
        
        // Combine available technicians with the assigned one (if different)
        if (assignedTech && !availableTechnicians.find((t: Technician) => t.id === assignedTech.id)) {
          setTechnicians([...availableTechnicians, assignedTech])
        } else {
          setTechnicians(availableTechnicians)
        }
      } else {
        setTechnicians(availableTechnicians)
      }
    } catch (err) {
      console.error("[v0] Failed to load technicians:", err)
    }
  }

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch complaint: ${res.status}`)
      }
      const data = await res.json()
      // Only extract the fields needed for the form
      // API now includes customer_id for compatibility
      const technicianId = data.technician_id || ""
      setForm({
        title: data.title || "",
        description: data.description || "",
        status: data.status || "open",
        priority: data.priority || "medium",
        customer_id: data.customer_id || data.user_id || "", // API includes customer_id, fallback to user_id
        technician_id: technicianId,
      })
      // Return technician_id so fetchTechnicians can use it
      return technicianId
    } catch (err) {
      console.error("Error fetching complaint:", err)
      setError(err instanceof Error ? err.message : "Failed to load complaint")
      return ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const method = complaintId ? "PUT" : "POST"
      const url = complaintId ? `/api/complaints/${complaintId}` : "/api/complaints"

      // Prepare data - only send the fields that can be updated
      const formData: {
        customer_id: string
        technician_id?: string | null
        title: string
        description: string
        status: string
        priority: string
      } = {
        customer_id: form.customer_id,
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        technician_id: form.technician_id && form.technician_id.trim() !== "" 
          ? form.technician_id 
          : null,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to save complaint")

      if (!complaintId) {
        addNotification(`New complaint "${form.title}" has been raised!`, "complaint")
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not the modal content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">{complaintId ? "Edit Complaint" : "Add Complaint"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          <select
            value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <select
            value={form.technician_id || ""}
            onChange={(e) => setForm({ ...form, technician_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Assign Technician (Optional)</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
