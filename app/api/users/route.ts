import { NextRequest, NextResponse } from 'next/server'

// Mock user data
const users = [
  {
    id: '1',
    username: 'Jean-Mari',
    firstName: 'Jean-Mari',
    lastName: 'Administrator',
    email: 'jean-mari@gunworx.com',
    role: 'admin',
    department: 'Management',
    position: 'System Administrator',
    hireDate: '2020-01-01',
    isSystemAdmin: true
  },
  {
    id: '2',
    username: 'Jean',
    firstName: 'Jean',
    lastName: 'Admin',
    email: 'jean@gunworx.com',
    role: 'admin',
    department: 'Operations',
    position: 'Operations Manager',
    hireDate: '2021-03-15',
    isSystemAdmin: true
  }
]

export async function GET() {
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Validate required fields
    if (!userData.username || !userData.firstName || !userData.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if username already exists
    if (users.some(u => u.username === userData.username)) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      isSystemAdmin: false
    }

    users.push(newUser)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
