import { type NextRequest, NextResponse } from "next/server"

// Import the storage from the main route (in production, this would be a database)
let inspectionsStorage: any[] = []

// Helper to get storage reference
const getInspectionsStorage = () => {
  return inspectionsStorage
}

const setInspectionsStorage = (data: any[]) => {
  inspectionsStorage = data
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storage = getInspectionsStorage()
    const inspection = storage.find((i) => i.id === params.id)

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    return NextResponse.json({ inspection })
  } catch (error) {
    console.error("Error fetching inspection:", error)
    return NextResponse.json({ error: "Failed to fetch inspection" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storage = getInspectionsStorage()
    const index = storage.findIndex((i) => i.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    const updateData = await request.json()
    const updatedInspection = {
      ...storage[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    storage[index] = updatedInspection
    setInspectionsStorage(storage)

    return NextResponse.json({ inspection: updatedInspection })
  } catch (error) {
    console.error("Error updating inspection:", error)
    return NextResponse.json({ error: "Failed to update inspection" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storage = getInspectionsStorage()
    const index = storage.findIndex((i) => i.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    storage.splice(index, 1)
    setInspectionsStorage(storage)

    return NextResponse.json({ message: "Inspection deleted successfully" })
  } catch (error) {
    console.error("Error deleting inspection:", error)
    return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 })
  }
}
