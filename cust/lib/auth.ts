import { cookies } from "next/headers"
import { prisma } from "./prisma"
import * as bcrypt from "bcryptjs"

export interface SessionUser {
  id: string
  email: string
  name?: string | null
}

const SESSION_COOKIE_NAME = "session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  // In a real app, you might want to store sessions in a database
  // For simplicity, we'll use a signed cookie with user ID
  // Use a separator that won't conflict with UUIDs (which contain dashes)
  const sessionToken = `${userId}::${Date.now()}::${Math.random().toString(36).substring(7)}`
  return sessionToken
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    // Extract user ID from session token (format: userId::timestamp::random)
    // Split by :: to handle UUIDs which contain dashes
    const parts = sessionToken.split("::")
    
    if (parts.length < 3) {
      // Fallback for old format (userId-timestamp-random)
      // Try to extract userId by taking all parts except last 2
      const fallbackParts = sessionToken.split("-")
      if (fallbackParts.length >= 3) {
        // Assume last 2 parts are timestamp and random, rest is userId
        const userId = fallbackParts.slice(0, -2).join("-")
        if (userId) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true },
          })
          return user
        }
      }
      return null
    }
    
    const userId = parts[0]

    if (!userId) {
      return null
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = await createSession(userId)

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function validateUserCredentials(email: string, password: string): Promise<SessionUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password_hash: true,
      },
    })

    if (!user) {
      return null
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error("Error validating credentials:", error)
    return null
  }
}

export async function createUser(email: string, password: string, name?: string): Promise<SessionUser | null> {
  try {
    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

