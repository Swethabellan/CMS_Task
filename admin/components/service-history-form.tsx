"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ServiceHistoryFormProps {
  onClose: (newRecord?: any) => void
  initialData?: any
}

export function ServiceHistoryForm({ onClose, initialData }: ServiceHistoryFormProps) {
  // Helper function to safely convert service_date to YYYY-MM-DD format
  const formatServiceDate = (date: any): string => {
    if (!date) return ""
    if (date instanceof Date) {
      return date.toISOString().split("T")[0]
    }
    if (typeof date === "string") {
      return date.split("T")[0]
    }
    return ""
  }

  const [formData, setFormData] = useState({
    customer_id: initialData?.customer_id || initialData?.user_id || "", // Support both customer_id (frontend) and user_id (backend)
    technician_id: initialData?.technician_id || "",
    complaint_id: initialData?.complaint_id || "",
    service_date: formatServiceDate(initialData?.service_date),
    description: initialData?.description || "",
    duration_minutes: initialData?.duration_minutes || "",
    status: initialData?.status || "completed",
    notes: initialData?.notes || "",
  })

  const [customers, setCustomers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, techniciansRes, complaintsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/technicians"),
          fetch("/api/complaints"),
        ])

        if (customersRes.ok) setCustomers(await customersRes.json())
        if (techniciansRes.ok) setTechnicians(await techniciansRes.json())
        if (complaintsRes.ok) setComplaints(await complaintsRes.json())
      } catch (error) {
        console.error("[v0] Fetch error:", error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData ? `/api/service-history/${initialData.id}` : "/api/service-history"
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newRecord = await response.json()
        onClose(newRecord)
      }
    } catch (error) {
      console.error("[v0] Form error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Select
            value={formData.customer_id}
            onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.technician_id}
            onValueChange={(value) => setFormData({ ...formData, technician_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Technician" />
            </SelectTrigger>
            <SelectContent>
              {technicians.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.complaint_id}
            onValueChange={(value) => setFormData({ ...formData, complaint_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Complaint" />
            </SelectTrigger>
            <SelectContent>
              {complaints.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            type="date"
            value={formData.service_date}
            onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Duration (minutes)"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
          />
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <Textarea
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="resize-none"
          rows={3}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-dark text-white">
            {loading ? "Saving..." : "Save Service Record"}
          </Button>
          <Button type="button" variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
