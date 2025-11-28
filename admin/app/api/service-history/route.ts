import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const serviceHistory = await prisma.serviceHistory.findMany()
    return NextResponse.json(serviceHistory)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch service history" }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Transform the data to match Prisma schema requirements
    // Map customer_id (from frontend) to user_id (schema field name)
    const data: any = {
      ...body,
      user_id: body.customer_id || body.user_id, // Map customer_id to user_id
      // Convert service_date string to Date object if provided
      service_date: body.service_date && String(body.service_date).trim() !== "" 
        ? new Date(body.service_date) 
        : null,
      // Convert duration_minutes empty string to null, or parse if it's a string number
      duration_minutes: body.duration_minutes !== undefined && body.duration_minutes !== null && String(body.duration_minutes).trim() !== ""
        ? typeof body.duration_minutes === "number" 
          ? body.duration_minutes 
          : parseInt(String(body.duration_minutes), 10) || null
        : null,
    }
    // Remove customer_id if it exists
    delete data.customer_id
    
    const serviceHistory = await prisma.serviceHistory.create({
      data,
    })
    return NextResponse.json(serviceHistory)
  } catch (error) {
    console.error("Failed to create service history:", error)
    return NextResponse.json({ error: "Failed to create service history" }, { status: 400 })
  }
}
