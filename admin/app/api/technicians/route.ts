import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const availability = searchParams.get("availability")
    
    const where = availability ? { availability } : {}
    
    const technicians = await prisma.technician.findMany({
      where,
      orderBy: { name: "asc" },
    })
    return NextResponse.json(technicians)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch technicians" }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const technician = await prisma.technician.create({
      data: body,
    })
    return NextResponse.json(technician)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create technician" }, { status: 400 })
  }
}
