import { type NextRequest, NextResponse } from "next/server"
import { users, validateCredentials } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const user = validateCredentials(username, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date().toISOString()

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isSystemAdmin: user.isSystemAdmin,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ users: users.map(({ ...user }) => user) })
}
