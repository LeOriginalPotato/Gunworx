import { type NextRequest, NextResponse } from "next/server"

interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
  isSystemAdmin?: boolean
}

// Server-side user storage (in production, this would be a database)
const serverUsers: User[] = [
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
]

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "User management is handled client-side",
    status: "info",
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "User management is handled client-side",
    status: "info",
  })
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({
    message: "User management is handled client-side",
    status: "info",
  })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    message: "User management is handled client-side",
    status: "info",
  })
}
