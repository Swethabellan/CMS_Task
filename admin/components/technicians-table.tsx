"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TechnicianForm } from "./technician-form"
import { DeleteConfirm } from "./delete-confirm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

export function TechniciansTable({ initialData }: { initialData: any[] }) {
  const [technicians, setTechnicians] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [specializationFilter, setSpecializationFilter] = useState<string>("all")

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/technicians/${id}`, { method: "DELETE" })
      if (response.ok) {
        setTechnicians(technicians.filter((t) => t.id !== id))
        setDeleteId(null)
      }
    } catch (error) {
      console.error("[v0] Delete error:", error)
    }
  }

  const handleEdit = (technician: any) => {
    // Close delete modal if open
    setDeleteId(null)
    setEditingId(technician.id)
    setEditingData(technician)
    setShowForm(true)
  }

  const handleFormClose = (newTechnician?: any) => {
    if (newTechnician) {
      if (editingId) {
        setTechnicians(technicians.map((t) => (t.id === editingId ? newTechnician : t)))
      } else {
        setTechnicians([newTechnician, ...technicians])
      }
    }
    setShowForm(false)
    setEditingId(null)
    setEditingData(null)
  }

  // Filter technicians
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((technician) => {
      const matchesSearch =
        searchTerm === "" ||
        technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technician.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (technician.phone && technician.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (technician.specialization && technician.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesAvailability = availabilityFilter === "all" || technician.availability === availabilityFilter
      const matchesSpecialization = specializationFilter === "all" || technician.specialization === specializationFilter

      return matchesSearch && matchesAvailability && matchesSpecialization
    })
  }, [technicians, searchTerm, availabilityFilter, specializationFilter])

  const hasActiveFilters = searchTerm !== "" || availabilityFilter !== "all" || specializationFilter !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setAvailabilityFilter("all")
    setSpecializationFilter("all")
  }

  // Get unique specializations from technicians
  const specializations = useMemo(() => {
    return Array.from(new Set(technicians.map((t) => t.specialization).filter(Boolean))).sort()
  }, [technicians])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">All Technicians ({filteredTechnicians.length})</h2>
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
          {showForm ? "Cancel" : "Add Technician"}
        </Button>
      </div>

      {showForm && <TechnicianForm onClose={handleFormClose} initialData={editingData} />}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by name, email, phone or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Availability Filter */}
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
            </SelectContent>
          </Select>

          {/* Specialization Filter */}
          <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec || ""}>
                  {spec}
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTechnicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No technicians found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredTechnicians.map((technician) => (
                <TableRow key={technician.id}>
                  <TableCell className="font-medium">{technician.name}</TableCell>
                  <TableCell>{technician.email}</TableCell>
                  <TableCell>{technician.phone || "-"}</TableCell>
                  <TableCell>{technician.specialization || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        technician.availability === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {technician.availability}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(technician)}
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
                          setDeleteId(technician.id)
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
          title="Delete Technician"
          message={`Are you sure you want to delete ${technicians.find(t => t.id === deleteId)?.name || 'this technician'}?`}
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
