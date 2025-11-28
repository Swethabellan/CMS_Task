import { prisma } from "@/lib/prisma"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FeedbackTable } from "@/components/feedback-table"

export default async function FeedbackPage() {
  const feedback = await prisma.feedback.findMany({
    include: {
      user: {
        // Schema uses 'user' relation, not 'customer'
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  // Transform to match expected shape (map 'user' to 'customers')
  const transformed = feedback.map((item) => ({
    ...item,
    customers: item.user, // Map user to customers
    customer: undefined,
    user: undefined, // Remove user to avoid confusion
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feedback</h1>
          <p className="text-gray-600 mt-2">Manage customer feedback and ratings</p>
        </div>

        <FeedbackTable initialData={transformed || []} />
      </div>
    </DashboardLayout>
  )
}
