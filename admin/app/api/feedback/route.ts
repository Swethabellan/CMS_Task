import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({
      include: {
        user: {
          // Schema uses 'user' relation, not 'customer'
          select: {
            name: true,
            email: true,
          },
        },
        complaint: {
          // Include complaint details
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            created_at: true,
            updated_at: true,
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

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Map customer_id (from frontend) to user_id (schema field name)
    const data = {
      ...body,
      user_id: body.customer_id || body.user_id, // Map customer_id to user_id
      customer_id: undefined,
    }
    delete (data as any).customer_id

    const feedback = await prisma.feedback.create({
      data,
      include: {
        user: {
          // Schema uses 'user' relation, not 'customer'
          select: {
            name: true,
            email: true,
          },
        },
        complaint: {
          // Include complaint details when complaint_id is provided
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            status: true,
            priority: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    })

    // Transform to match expected shape (map 'user' to 'customers')
    const transformed = {
      ...feedback,
      customers: feedback.user, // Map user to customers
      customer: undefined,
      user: undefined, // Remove user to avoid confusion
    }

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 400 })
  }
}
