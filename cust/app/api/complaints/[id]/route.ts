import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Fetch single complaint (user must own it)
// PUT - Update complaint status (user must own it)
// DELETE - Delete complaint (user must own it)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch complaint and ensure user owns it
    const data = await prisma.complaint.findFirst({
      where: {
        id,
        user_id: user.id,
      },
    })

    if (!data) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] Error fetching complaint:", error)
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
    const { status, title, description, category } = body

    // Verify user owns the complaint
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        user_id: user.id,
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    // Update complaint
    const updateData: any = {}
    if (status) updateData.status = status
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (category) updateData.category = category

    const data = await prisma.complaint.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] Error updating complaint:", error)
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

    // Verify user owns the complaint before deleting
    const complaint = await prisma.complaint.findFirst({
      where: {
        id,
        user_id: user.id,
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    // Delete associated feedbacks first (cascade should handle this, but being explicit)
    await prisma.feedback.deleteMany({
      where: { complaint_id: id },
    })

    // Delete complaint
    await prisma.complaint.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Complaint deleted successfully" })
  } catch (error) {
    console.error("[API] Error deleting complaint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
