import { type NextRequest, NextResponse } from "next/server"

// Import the storage from the main route (in production, this would be a database)
// For now, we'll use a simple approach to access the same storage
let firearmsStorage: any[] = []

// Helper to get storage reference
const getFirearmsStorage = () => {
  // In a real app, this would query the database
  return firearmsStorage
}

const setFirearmsStorage = (data: any[]) => {
  firearmsStorage = data
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storage = getFirearmsStorage()
    const firearm = storage.find((f) => f.id === params.id)

    if (!firearm) {
      return NextResponse.json({ error: "Firearm not found" }, { status: 404 })
    }

    return NextResponse.json({ firearm })
  } catch (error) {
    console.error("Error fetching firearm:", error)
    return NextResponse.json({ error: "Failed to fetch firearm" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storage = getFirearmsStorage()
    const index = storage.findIndex((f) => f.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Firearm not found" }, { status: 404 })
    }

    const updateData = await request.json()
    const updatedFirearm = {
      ...storage[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    storage[index] = updatedFirearm
    setFirearmsStorage(storage)

    return NextResponse.json({ firearm: updatedFirearm })
  } catch (error) {
    console.error("Error updating firearm:", error)
    return NextResponse.json({ error: "Failed to update firearm" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storage = getFirearmsStorage()
    const index = storage.findIndex((f) => f.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Firearm not found" }, { status: 404 })
    }

    storage.splice(index, 1)
    setFirearmsStorage(storage)

    return NextResponse.json({ message: "Firearm deleted successfully" })
  } catch (error) {
    console.error("Error deleting firearm:", error)
    return NextResponse.json({ error: "Failed to delete firearm" }, { status: 500 })
  }
}
