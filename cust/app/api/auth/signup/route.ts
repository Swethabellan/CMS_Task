import { NextRequest, NextResponse } from "next/server"
import { createUser, setSessionCookie } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const user = await createUser(email, password, name)

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    await setSessionCookie(user.id)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[API] Error signing up:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

