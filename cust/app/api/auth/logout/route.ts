import { NextRequest, NextResponse } from "next/server"
import { clearSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await clearSession()
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    console.error("[API] Error logging out:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

