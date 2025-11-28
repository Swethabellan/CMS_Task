import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    })

    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Transform to match Customer interface
    const customer = {
      id: user.id,
      name: user.name || user.email || "Unknown",
      email: user.email,
      phone: user.phone,
      city: user.city,
      address: user.address,
      country: user.country,
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // First check if user exists and is a customer
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (!existingUser || existingUser.role !== "user") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Update user (customer) - only allow updating certain fields
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        // Don't allow changing role or password_hash via this endpoint
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

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Failed to update customer" }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // First check if user exists and is a customer
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (!existingUser || existingUser.role !== "user") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Delete user (customer) - this will cascade delete related complaints, feedback, etc.
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 400 })
  }
}
