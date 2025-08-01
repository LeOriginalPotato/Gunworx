import { type NextRequest, NextResponse } from "next/server"

// Mock user data - in a real app, this would be in a database
const users = [
  {
    id: "1",
    username: "Jean-Mari",
    password: "Foktogbokka",
    role: "admin",
    isSystemAdmin: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    username: "Jean",
    password: "xNgU7ADa",
    role: "admin",
    isSystemAdmin: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    username: "Eben",
    password: "UY9FBe8abajU",
    role: "user",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    username: "Francois",
    password: "MnWbCkE4AcFP",
    role: "user",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    username: "Wikus",
    password: "Wikus@888",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    username: "Jean",
    password: "xNgU7ADa",
    role: "admin",
    isSystemAdmin: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export async function GET() {
  try {
    // Return users without passwords for security
    const safeUsers = users.map(({ password, ...user }) => user)
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user } = body

    switch (action) {
      case "create":
        users.push(user)
        return NextResponse.json({ success: true, user: { ...user, password: "***" } })

      case "update":
        const updateIndex = users.findIndex((u) => u.id === user.id)
        if (updateIndex !== -1) {
          users[updateIndex] = { ...users[updateIndex], ...user }
          return NextResponse.json({ success: true, user: { ...users[updateIndex], password: "***" } })
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 })

      case "delete":
        const deleteIndex = users.findIndex((u) => u.id === user.id)
        if (deleteIndex !== -1) {
          // Prevent deletion of system admin
          if (users[deleteIndex].isSystemAdmin) {
            return NextResponse.json({ error: "Cannot delete system admin" }, { status: 403 })
          }
          users.splice(deleteIndex, 1)
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing user request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
