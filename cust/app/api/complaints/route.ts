import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List user's complaints
// POST - Create new complaint

export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's complaints
    const data = await prisma.complaint.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[API] Error fetching complaints:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category } = body

    // Validate input
    if (!title || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create complaint for authenticated user
    const data = await prisma.complaint.create({
      data: {
        user_id: user.id,
        title,
        description,
        category,
        status: "Open",
      },
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating complaint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
