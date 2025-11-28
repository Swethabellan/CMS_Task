import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch single feedback
// PUT - Update feedback
// DELETE - Delete feedback

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch feedback and verify user owns it
    const data = await prisma.feedback.findFirst({
      where: {
        id,
        user_id: user.id,
      },
      include: {
        user: {
          // Include user details who sent the feedback
          select: {
            id: true,
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
            status: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    })

    if (!data) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] Error fetching feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 })
    }

    // Verify user owns the feedback
    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        user_id: user.id,
      },
    })

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Update feedback with complaint details and user information
    const data = await prisma.feedback.update({
      where: { id },
      data: { message },
      include: {
        user: {
          // Include user details who sent the feedback
          select: {
            id: true,
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
            status: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] Error updating feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns the feedback
    const feedback = await prisma.feedback.findFirst({
      where: {
        id,
        user_id: user.id,
      },
    })

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Delete feedback
    await prisma.feedback.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Feedback deleted successfully" })
  } catch (error) {
    console.error("[API] Error deleting feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
