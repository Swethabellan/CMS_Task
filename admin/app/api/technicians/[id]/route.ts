import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Only extract fields that can be updated (exclude id, created_at, updated_at)
    const data: {
      name?: string
      email?: string
      phone?: string | null
      specialization?: string | null
      availability?: string
    } = {}

    if (body.name !== undefined) data.name = body.name
    if (body.email !== undefined) data.email = body.email
    if (body.availability !== undefined) data.availability = body.availability
    
    // Handle optional fields - convert empty strings to null
    if (body.phone !== undefined) {
      data.phone = body.phone && body.phone.trim() !== "" ? body.phone : null
    }
    if (body.specialization !== undefined) {
      data.specialization = body.specialization && body.specialization.trim() !== "" ? body.specialization : null
    }

    const technician = await prisma.technician.update({
      where: { id },
      data,
    })
    return NextResponse.json(technician)
  } catch (error) {
    console.error("Update technician error:", error)
    return NextResponse.json({ error: "Failed to update technician" }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.technician.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete technician error:", error)
    return NextResponse.json({ error: "Failed to delete technician" }, { status: 400 })
  }
}
