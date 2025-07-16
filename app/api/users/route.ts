import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for users (in production, use a proper database)
let usersData: Record<string, any> = {}

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
    usersData = userData

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving users:", error)
    return NextResponse.json({ error: "Failed to save users" }, { status: 500 })
  }
}
