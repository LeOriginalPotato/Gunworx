import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateCentralDataStore } from "../data-migration/route"

export async function POST(request: NextRequest) {
  try {
    const centralData = getCentralDataStore()
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const user = centralData.users.find((u) => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    updateCentralDataStore(centralData)

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
  try {
    const centralData = getCentralDataStore()

    return NextResponse.json({
      users: centralData.users.map(({ password, ...user }) => user),
      total: centralData.users.length,
      lastUpdated: centralData.lastUpdated,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const centralData = getCentralDataStore()
    const userData = await request.json()

    if (!userData.id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const index = centralData.users.findIndex((u) => u.id === userData.id)

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updatedUser = {
      ...centralData.users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    centralData.users[index] = updatedUser
    updateCentralDataStore(centralData)

    return NextResponse.json({
      user: { ...updatedUser, password: undefined },
      total: centralData.users.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
