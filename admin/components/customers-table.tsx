"use client"

import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, X } from "lucide-react"
import { CustomerForm } from "./customer-form"
import { DeleteConfirm } from "./delete-confirm"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
}

export function CustomersTable({ initialData }: { initialData: Customer[] }) {
  const [customers, setCustomers] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState<string>("all")

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
    const response = await fetch("/api/customers")
    const data = await response.json()
    setCustomers(data)
    handleFormClose()
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" })
      setCustomers(customers.filter((c) => c.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchTerm === "" ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCity = cityFilter === "all" || (customer.city && customer.city === cityFilter)

      return matchesSearch && matchesCity
    })
  }, [customers, searchTerm, cityFilter])

  const hasActiveFilters = searchTerm !== "" || cityFilter !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setCityFilter("all")
  }

  // Get unique cities from customers
  const cities = useMemo(() => {
    return Array.from(new Set(customers.map((c) => c.city).filter(Boolean))).sort()
  }, [customers])

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">All Customers ({filteredCustomers.length})</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* City Filter */}
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city || ""}>
                    {city}
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No customers found matching your filters
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.city || "-"}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(customer.id)}
                      className="p-2 hover:bg-gray-100 rounded text-primary"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(customer.id)}
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

      {showForm && <CustomerForm customerId={editingId} onClose={handleFormClose} onSuccess={handleSuccess} />}

      {deleteId && (
        <DeleteConfirm
          title="Delete Customer"
          message="Are you sure you want to delete this customer? All related complaints and feedback will also be deleted."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  )
}
