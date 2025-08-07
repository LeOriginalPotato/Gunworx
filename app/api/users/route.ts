import { NextRequest, NextResponse } from 'next/server'

// This is a placeholder API route for user management
// In a real application, this would connect to a database

export async function GET(request: NextRequest) {
  try {
    // In a real app, fetch users from database
    const users = [
      {
        id: "1",
        username: "Jean-Mari",
        role: "admin",
        isSystemAdmin: true,
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        username: "Jean",
        role: "admin",
        isSystemAdmin: true,
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: "2024-01-14T15:45:00Z"
      },
      {
        id: "3",
        username: "Eben",
        role: "user",
        isSystemAdmin: false,
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: "2024-01-13T09:20:00Z"
      },
      {
        id: "4",
        username: "Francois",
        role: "user",
        isSystemAdmin: false,
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: "2024-01-12T14:10:00Z"
      },
      {
        id: "5",
        username: "Wikus",
        role: "admin",
        isSystemAdmin: false,
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: "2024-01-11T11:55:00Z"
      }
    ]

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, role, isSystemAdmin } = body

    // Validate required fields
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real app, save to database
    const newUser = {
      id: Date.now().toString(),
      username,
      role,
      isSystemAdmin: isSystemAdmin || false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, username, password, role, isSystemAdmin } = body

    // Validate required fields
    if (!id || !username || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real app, update in database
    const updatedUser = {
      id,
      username,
      role,
      isSystemAdmin: isSystemAdmin || false,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // In a real app, delete from database
    // Check if user is system admin before deletion
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
