import { type NextRequest, NextResponse } from "next/server"

// Mock user data
const users = [
  {
    id: "1",
    username: "Jean-Mari",
    firstName: "Jean-Mari",
    lastName: "",
    email: "",
    role: "admin",
    department: "Management",
    position: "System Administrator",
    hireDate: "2020-01-01",
    isSystemAdmin: true,
  },
  {
    id: "2",
    username: "Jean",
    firstName: "Jean",
    lastName: "",
    email: "",
    role: "admin",
    department: "Operations",
    position: "Operations Manager",
    hireDate: "2021-03-15",
    isSystemAdmin: false,
  },
  {
    id: "3",
    username: "Wikus",
    firstName: "Wikus",
    lastName: "",
    email: "",
    role: "admin",
    department: "Sales",
    position: "Sales Manager",
    hireDate: "2022-06-10",
    isSystemAdmin: false,
  },
  {
    id: "4",
    username: "Eben",
    firstName: "Eben",
    lastName: "",
    email: "",
    role: "user",
    department: "Workshop",
    position: "Gunsmith",
    hireDate: "2022-08-22",
    isSystemAdmin: false,
  },
  {
    id: "5",
    username: "Francois",
    firstName: "Francois",
    lastName: "",
    email: "",
    role: "user",
    department: "Inventory",
    position: "Inventory Clerk",
    hireDate: "2023-01-18",
    isSystemAdmin: false,
  },
]

export async function GET() {
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.username || !userData.firstName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if username already exists
    if (users.some((u) => u.username === userData.username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      isSystemAdmin: false,
    }

    users.push(newUser)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  }
}
