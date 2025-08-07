import { type NextRequest, NextResponse } from "next/server"

interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
  isSystemAdmin?: boolean
}

// Server-side user storage with all previously created users
let serverUsers: User[] = [
  {
    id: "system_admin_001",
    username: "Jean-Mari",
    password: "Password123",
    role: "admin",
    createdAt: "2024-01-01T00:00:00.000Z",
    isSystemAdmin: true,
  },
  {
    id: "user_jp_admin_001",
    username: "JP",
    password: "xNgU7ADa",
    role: "admin",
    createdAt: "2024-01-15T10:30:00.000Z",
  },
  {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "admin",
    createdAt: "2024-01-01T12:00:00.000Z",
  },
]

export async function GET() {
  try {
    return NextResponse.json(serverUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user, users } = body

    switch (action) {
      case "create":
        if (!user) {
          return NextResponse.json({ error: "User data required" }, { status: 400 })
        }

        // Check if username already exists
        if (serverUsers.find((u) => u.username === user.username)) {
          return NextResponse.json({ error: "Username already exists" }, { status: 409 })
        }

        serverUsers.push(user)
        return NextResponse.json(user)

      case "update":
        if (!user || !user.id) {
          return NextResponse.json({ error: "User ID required" }, { status: 400 })
        }

        const userIndex = serverUsers.findIndex((u) => u.id === user.id)
        if (userIndex === -1) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        serverUsers[userIndex] = { ...serverUsers[userIndex], ...user }
        return NextResponse.json(serverUsers[userIndex])

      case "delete":
        if (!user || !user.id) {
          return NextResponse.json({ error: "User ID required" }, { status: 400 })
        }

        const userToDelete = serverUsers.find((u) => u.id === user.id)
        if (!userToDelete) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        serverUsers = serverUsers.filter((u) => u.id !== user.id)
        return NextResponse.json({ success: true })

      case "sync":
        if (!users || !Array.isArray(users)) {
          return NextResponse.json({ error: "Users array required" }, { status: 400 })
        }

        serverUsers = users
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing user request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
