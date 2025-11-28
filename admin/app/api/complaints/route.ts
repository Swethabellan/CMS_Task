import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
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
      customer_id: complaint.user_id, // Add customer_id for frontend compatibility
      customers: complaint.user, // Map user to customers
      technicians: complaint.technician,
      customer: undefined,
      technician: undefined,
      user: undefined, // Remove user to avoid confusion
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Map customer_id (from frontend) to user_id (schema field name)
    // Convert empty string technician_id to null to make it optional
    const data = {
      ...body,
      user_id: body.customer_id || body.user_id, // Map customer_id to user_id
      technician_id: body.technician_id && body.technician_id.trim() !== "" 
        ? body.technician_id 
        : null,
      // Remove customer_id if it exists (we're using user_id now)
      customer_id: undefined,
    }
    // Clean up undefined values
    delete (data as any).customer_id
    
    const complaint = await prisma.complaint.create({
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

    return NextResponse.json(transformed, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 400 })
  }
}
