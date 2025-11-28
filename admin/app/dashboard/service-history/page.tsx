import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ServiceHistoryTable } from "@/components/service-history-table"

export default async function ServiceHistoryPage() {
  let serviceHistory = []
  
  try {
    serviceHistory = await prisma.serviceHistory.findMany({
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
            specialization: true,
          },
        },
        complaint: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 1000, // Limit results to prevent large queries
    })
  } catch (error) {
    console.error("Failed to fetch service history:", error)
    // Return empty array on error to prevent page crash
    serviceHistory = []
  }

  // Transform to match expected shape (map 'user' to 'customers')
  const transformed = serviceHistory.map((record) => ({
    ...record,
    customers: record.user, // Map user to customers
    technicians: record.technician,
    complaints: record.complaint,
    customer: undefined,
    technician: undefined,
    complaint: undefined,
    user: undefined, // Remove user to avoid confusion
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service History</h1>
          <p className="text-gray-600 mt-2">View all service records and assignments</p>
        </div>

        <ServiceHistoryTable initialData={transformed || []} />
      </div>
    </DashboardLayout>
  )
}
