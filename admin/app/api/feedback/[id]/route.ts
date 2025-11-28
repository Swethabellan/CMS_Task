import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
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
    })

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Transform to match expected shape (map 'user' to 'customers')
    const transformed = {
      ...feedback,
      customers: feedback.user,
      customer: undefined,
      user: undefined,
    }

    return NextResponse.json(transformed)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Map customer_id (from frontend) to user_id (schema field name)
    const data: any = {
      ...body,
      user_id: body.customer_id !== undefined ? body.customer_id : body.user_id,
      customer_id: undefined,
    }
    delete data.customer_id

    const feedback = await prisma.feedback.update({
      where: { id },
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
    })

    // Transform to match expected shape (map 'user' to 'customers')
    const transformed = {
      ...feedback,
      customers: feedback.user, // Map user to customers
      customer: undefined,
      user: undefined, // Remove user to avoid confusion
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error updating feedback:", error)
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.feedback.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 400 })
  }
}
