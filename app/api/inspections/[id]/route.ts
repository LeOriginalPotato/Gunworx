import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateCentralDataStore } from "../../data-migration/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const centralData = getCentralDataStore()
    const inspection = centralData.inspections.find((i) => i.id === params.id)

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
    const centralData = getCentralDataStore()
    const index = centralData.inspections.findIndex((i) => i.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    const updateData = await request.json()
    const updatedInspection = {
      ...centralData.inspections[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    centralData.inspections[index] = updatedInspection
    updateCentralDataStore(centralData)

    return NextResponse.json({ inspection: updatedInspection })
  } catch (error) {
    console.error("Error updating inspection:", error)
    return NextResponse.json({ error: "Failed to update inspection" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const centralData = getCentralDataStore()
    const index = centralData.inspections.findIndex((i) => i.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    centralData.inspections.splice(index, 1)
    updateCentralDataStore(centralData)

    return NextResponse.json({
      message: "Inspection deleted successfully",
      total: centralData.inspections.length,
    })
  } catch (error) {
    console.error("Error deleting inspection:", error)
    return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 })
  }
}
