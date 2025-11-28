import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch users with role "user" (customers) - admins have role "admin"
    const users = await prisma.user.findMany({
      where: {
        role: "user", // Filter for customers only, not admins
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        created_at: true,
        updated_at: true,
        // Exclude password_hash and other sensitive fields
      },
    })

    // Transform to match Customer interface expected by frontend
    const customers = users.map((user) => ({
      id: user.id,
      name: user.name || user.email || "Unknown",
      email: user.email,
      phone: user.phone,
      city: user.city,
    }))

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create a user with role "user" (customer)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password_hash: body.password_hash || "", // Should be hashed in production
        name: body.name,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        role: "user", // Ensure it's a customer, not admin
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        created_at: true,
        updated_at: true,
      },
    })

    // Transform to match Customer interface
    const customer = {
      id: user.id,
      name: user.name || user.email || "Unknown",
      email: user.email,
      phone: user.phone,
      city: user.city,
    }

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Failed to create customer" }, { status: 400 })
  }
}
