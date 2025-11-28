import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomersTable } from "@/components/customers-table"

export default async function CustomersPage() {
  // Fetch users with role "user" (customers) - admins have role "admin"
  const users = await prisma.user.findMany({
    where: {
      role: "user", // Filter for customers only, not admins
    },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      country: true,
      created_at: true,
      updated_at: true,
      // Exclude password_hash for security
    },
  })

  // Transform User data to match Customer interface (name is required, not nullable)
  const customers = users.map((user) => ({
    id: user.id,
    name: user.name || user.email || "Unknown", // Provide fallback for null name
    email: user.email,
    phone: user.phone,
    city: user.city,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-gray-600 mt-2">Manage all your customers</p>
        </div>

        <CustomersTable initialData={customers || []} />
      </div>
    </DashboardLayout>
  )
}
