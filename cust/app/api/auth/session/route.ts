import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("[API] Error getting session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

