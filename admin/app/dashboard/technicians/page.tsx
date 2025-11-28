import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TechniciansTable } from "@/components/technicians-table"

export default async function TechniciansPage() {
  const technicians = await prisma.technician.findMany({
    orderBy: { created_at: "desc" },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Technicians</h1>
          <p className="text-gray-600 mt-2">Manage technicians and assign to complaints</p>
        </div>

        <TechniciansTable initialData={technicians || []} />
      </div>
    </DashboardLayout>
  )
}
