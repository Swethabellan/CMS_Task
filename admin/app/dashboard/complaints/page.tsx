import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ComplaintsTable } from "@/components/complaints-table"

export default async function ComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    include: {
      user: {
        // Schema uses 'user' relation, not 'customer'
        select: {
          name: true,
          email: true,
        },
      },
      technician: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  // Transform to match expected shape (map 'user' to 'customers')
  const transformed = complaints.map((complaint) => ({
    ...complaint,
    customers: complaint.user, // Map user to customers
    technicians: complaint.technician,
    customer: undefined,
    technician: undefined,
    user: undefined, // Remove user to avoid confusion
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Complaints</h1>
          <p className="text-gray-600 mt-2">Track and manage customer complaints</p>
        </div>

        <ComplaintsTable initialData={transformed || []} />
      </div>
    </DashboardLayout>
  )
}
