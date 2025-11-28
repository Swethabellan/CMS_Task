"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ServiceHistoryForm } from "./service-history-form"
import { DeleteConfirm } from "./delete-confirm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

export function ServiceHistoryTable({ initialData }: { initialData: any[] }) {
  const [serviceHistory, setServiceHistory] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [technicianFilter, setTechnicianFilter] = useState<string>("all")

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/service-history/${id}`, { method: "DELETE" })
      if (response.ok) {
        setServiceHistory(serviceHistory.filter((s) => s.id !== id))
        setDeleteId(null)
      }
    } catch (error) {
      console.error("[v0] Delete error:", error)
    }
  }

  const handleEdit = (record: any) => {
    // Close delete modal if open
    setDeleteId(null)
    setEditingId(record.id)
    setEditingData(record)
    setShowForm(true)
  }

  const handleFormClose = (newRecord?: any) => {
    if (newRecord) {
      if (editingId) {
        setServiceHistory(serviceHistory.map((s) => (s.id === editingId ? newRecord : s)))
      } else {
        setServiceHistory([newRecord, ...serviceHistory])
      }
    }
    setShowForm(false)
    setEditingId(null)
    setEditingData(null)
  }

  // Filter service history
  const filteredServiceHistory = useMemo(() => {
    return serviceHistory.filter((record) => {
      const matchesSearch =
        searchTerm === "" ||
        (record.customers?.name && record.customers.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.customers?.email && record.customers.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.technicians?.name && record.technicians.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.complaints?.title && record.complaints.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.description && record.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === "all" || record.status === statusFilter
      const matchesTechnician = technicianFilter === "all" || record.technicians?.name === technicianFilter

      return matchesSearch && matchesStatus && matchesTechnician
    })
  }, [serviceHistory, searchTerm, statusFilter, technicianFilter])

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || technicianFilter !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTechnicianFilter("all")
  }

  // Get unique technicians from service history
  const technicians = useMemo(() => {
    return Array.from(
      new Set(serviceHistory.map((r) => r.technicians?.name).filter(Boolean))
    ).sort()
  }, [serviceHistory])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Service Records ({filteredServiceHistory.length})</h2>
        <Button
          onClick={() => {
            // Close delete modal if open
            setDeleteId(null)
            setEditingId(null)
            setEditingData(null)
            setShowForm(!showForm)
          }}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          {showForm ? "Cancel" : "Add Service Record"}
        </Button>
      </div>

      {showForm && <ServiceHistoryForm onClose={handleFormClose} initialData={editingData} />}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by customer, technician, complaint or description..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          {/* Technician Filter */}
          <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Technician" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicians.map((techName) => (
                <SelectItem key={techName} value={techName || ""}>
                  {techName}
                </SelectItem>
              ))}
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
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Complaint</TableHead>
              <TableHead>Service Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServiceHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No service records found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredServiceHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.customers?.name || "-"}</TableCell>
                  <TableCell>{record.technicians?.name || "-"}</TableCell>
                  <TableCell>{record.complaints?.title || "-"}</TableCell>
                  <TableCell>
                    {record.service_date ? new Date(record.service_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{record.duration_minutes || "-"} min</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        record.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Close form if open
                          setShowForm(false)
                          setEditingId(null)
                          setEditingData(null)
                          setDeleteId(record.id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {deleteId && (
        <DeleteConfirm
          title="Delete Service Record"
          message={`Are you sure you want to delete service record ${deleteId.slice(0, 8)}?`}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
