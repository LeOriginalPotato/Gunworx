import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth'

export async function GET() {
  try {
    const users = await authService.getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validate required fields
    if (!userData.username || !userData.password || !userData.role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const userExists = await authService.userExists(userData.username)
    if (userExists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    const newUser = await authService.createUser(userData)
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validate required fields
    if (!userData.id || !userData.username || !userData.password || !userData.role) {
      return NextResponse.json(
        { error: 'ID, username, password, and role are required' },
        { status: 400 }
      )
    }

    const updatedUser = await authService.updateUser(userData)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await authService.deleteUser(userId)
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    if (error instanceof Error) {
      if (error.message === 'Cannot delete system administrator') {
        return NextResponse.json({ error: 'Cannot delete system administrator' }, { status: 403 })
      }
      if (error.message === 'User not found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
