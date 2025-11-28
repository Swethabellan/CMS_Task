import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const complaint = await prisma.complaint.findUnique({
      where: { id },
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
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    // Transform to match expected shape (map 'user' to 'customers')
    const transformed = {
      ...complaint,
      customer_id: complaint.user_id, // Add customer_id for frontend compatibility
      customers: complaint.user, // Map user to customers
      technicians: complaint.technician,
      customer: undefined,
      technician: undefined,
      user: undefined, // Remove user to avoid confusion
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get current complaint to check previous status
    const currentComplaint = await prisma.complaint.findUnique({
      where: { id },
      select: {
        status: true,
        user_id: true, // Schema uses user_id, not customer_id
        technician_id: true,
        title: true,
        description: true,
      },
    })

    if (!currentComplaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }
    
    // Only extract fields that can be updated (exclude id, created_at, updated_at, and relation fields)
    // Map customer_id from frontend to user_id (schema field name)
    const data: {
      user_id?: string // Schema uses user_id, not customer_id
      technician_id?: string | null
      title?: string
      description?: string
      status?: string
      priority?: string
    } = {}

    // Map customer_id (from frontend) to user_id (schema field)
    if (body.customer_id !== undefined) data.user_id = body.customer_id
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.status !== undefined) data.status = body.status
    if (body.priority !== undefined) data.priority = body.priority
    
    // Handle technician_id - convert empty string to null
    if (body.technician_id !== undefined) {
      data.technician_id = body.technician_id && body.technician_id.trim() !== "" 
        ? body.technician_id 
        : null
    }

    const complaint = await prisma.complaint.update({
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
        technician: {
          select: {
            name: true,
          },
        },
      },
    })

    // Check if status changed to "resolved" and create service history entry
    const statusChangedToResolved = 
      currentComplaint.status !== "resolved" && 
      data.status === "resolved"

    if (statusChangedToResolved) {
      // Check if service history already exists for this complaint
      const existingServiceHistory = await prisma.serviceHistory.findFirst({
        where: { complaint_id: id },
      })

      // Only create if it doesn't already exist
      if (!existingServiceHistory) {
        await prisma.serviceHistory.create({
          data: {
            user_id: complaint.user_id, // Schema uses user_id, not customer_id
            technician_id: complaint.technician_id,
            complaint_id: id,
            service_date: new Date(),
            description: `Complaint resolved: ${complaint.title}`,
            status: "completed",
            notes: complaint.description || "Complaint marked as resolved",
          },
        })
      }
    }

    // Transform to match expected shape (map 'user' to 'customers')
    const transformed = {
      ...complaint,
      customer_id: complaint.user_id, // Add customer_id for frontend compatibility
      customers: complaint.user, // Map user to customers
      technicians: complaint.technician,
      customer: undefined,
      technician: undefined,
      user: undefined, // Remove user to avoid confusion
    }

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Update complaint error:", error)
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.complaint.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete complaint" }, { status: 400 })
  }
}
