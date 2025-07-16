import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for users (in production, use a real database)
let usersData: Record<string, { user: any; password: string }> = {
  "Jean-Mari": {
    user: {
      id: "system_admin",
      username: "Jean-Mari",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    password: "Password123",
  },
  JP: {
    user: {
      id: "user_jp_admin_001",
      username: "JP",
      role: "admin",
      createdAt: "2024-01-15T10:30:00.000Z",
    },
    password: "xNgU7ADa",
  },
}

export async function GET() {
  try {
    return NextResponse.json(usersData)
  } catch (error) {
    console.error("Error getting users:", error)
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validate the data structure
    if (!userData || typeof userData !== "object") {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 })
    }

    // Update the in-memory storage
    usersData = userData

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving users:", error)
    return NextResponse.json({ error: "Failed to save users" }, { status: 500 })
  }
}
