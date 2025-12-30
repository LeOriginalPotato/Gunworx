import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM users
      WHERE username = ${username} AND password = ${password}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = result[0]

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT id, username, role, full_name, email, created_at, is_active
      FROM users
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      users: result,
      total: result.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE users
      SET
        username = COALESCE(${userData.username}, username),
        role = COALESCE(${userData.role}, role),
        full_name = COALESCE(${userData.fullName}, full_name),
        email = COALESCE(${userData.email}, email),
        is_active = COALESCE(${userData.isActive}, is_active)
      WHERE id = ${userData.id}
      RETURNING id, username, role, full_name, email, created_at, is_active
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: result[0],
      total: 1,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
