import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateCentralDataStore } from "../../data-migration/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const centralData = getCentralDataStore()
    const firearm = centralData.firearms.find((f) => f.id === params.id)

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
    const centralData = getCentralDataStore()
    const index = centralData.firearms.findIndex((f) => f.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Firearm not found" }, { status: 404 })
    }

    const updateData = await request.json()
    const updatedFirearm = {
      ...centralData.firearms[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    centralData.firearms[index] = updatedFirearm
    updateCentralDataStore(centralData)

    return NextResponse.json({ firearm: updatedFirearm })
  } catch (error) {
    console.error("Error updating firearm:", error)
    return NextResponse.json({ error: "Failed to update firearm" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const centralData = getCentralDataStore()
    const index = centralData.firearms.findIndex((f) => f.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Firearm not found" }, { status: 404 })
    }

    centralData.firearms.splice(index, 1)
    updateCentralDataStore(centralData)

    return NextResponse.json({
      message: "Firearm deleted successfully",
      total: centralData.firearms.length,
    })
  } catch (error) {
    console.error("Error deleting firearm:", error)
    return NextResponse.json({ error: "Failed to delete firearm" }, { status: 500 })
  }
}
