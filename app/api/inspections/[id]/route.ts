import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateInDataStore, deleteFromDataStore } from "../../data-migration/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataStore = getCentralDataStore()
    const inspection = dataStore.inspections.find((i: any) => i.id === params.id)

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
    const body = await request.json()
    console.log("📝 Updating inspection:", params.id, body)

    // Update the inspection
    const updatedInspection = updateInDataStore("inspections", params.id, {
      ...body,
      updatedAt: new Date().toISOString(),
    })

    if (!updatedInspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    console.log("✅ Inspection updated successfully:", updatedInspection.id)

    return NextResponse.json({
      success: true,
      inspection: updatedInspection,
      message: "Inspection updated successfully",
    })
  } catch (error) {
    console.error("❌ Error updating inspection:", error)
    return NextResponse.json(
      {
        error: "Failed to update inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deletedInspection = deleteFromDataStore("inspections", params.id)

    if (!deletedInspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    console.log("🗑️ Inspection deleted successfully:", params.id)

    return NextResponse.json({
      success: true,
      message: "Inspection deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting inspection:", error)
    return NextResponse.json(
      {
        error: "Failed to delete inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
