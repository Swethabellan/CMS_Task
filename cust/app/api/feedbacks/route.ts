import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List feedbacks for a complaint (user must own the complaint)
// POST - Create new feedback

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const complaintId = searchParams.get("complaint_id")

    if (!complaintId) {
      return NextResponse.json({ error: "Missing complaint_id parameter" }, { status: 400 })
    }

    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns the complaint
    const complaint = await prisma.complaint.findFirst({
      where: {
        id: complaintId,
        user_id: user.id,
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    // Fetch feedbacks with complaint details and user information
    const data = await prisma.feedback.findMany({
      where: {
        complaint_id: complaintId,
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
      orderBy: {
        created_at: "asc",
      },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] Error fetching feedbacks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[API] User from session:", { id: user.id, email: user.email })

    const body = await request.json()
    const { complaint_id, message } = body

    if (!complaint_id || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[API] Creating feedback with:", { complaint_id, user_id: user.id, message })

    // Verify user owns the complaint
    const complaint = await prisma.complaint.findFirst({
      where: {
        id: complaint_id,
        user_id: user.id,
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
    }

    // Create feedback with complaint details and user information
    const data = await prisma.feedback.create({
      data: {
        complaint_id,
        user_id: user.id, // Pass user_id from session
        message,
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

    console.log("[API] Feedback created successfully:", { 
      id: data.id, 
      user_id: data.user_id, 
      complaint_id: data.complaint_id,
      user: data.user 
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Error creating feedback:", error)
    console.error("[API] Error stack:", error?.stack)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error?.message || String(error),
        code: error?.code,
        meta: error?.meta
      }, 
      { status: 500 }
    )
  }
}
