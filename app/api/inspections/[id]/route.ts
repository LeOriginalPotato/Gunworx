import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateInDataStore, deleteFromDataStore } from "../../data-migration/route"

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
    const inspectionData = await request.json()

    // Ensure the inspection has proper structure
    const updatedInspection = {
      ...inspectionData,
      id: params.id,
      updatedAt: new Date().toISOString(),
      // Ensure nested objects have proper structure
      firearmType: {
        pistol: false,
        revolver: false,
        rifle: false,
        selfLoadingRifle: false,
        shotgun: false,
        combination: false,
        other: false,
        otherDetails: "",
        ...inspectionData.firearmType,
      },
      serialNumbers: {
        barrel: "",
        barrelMake: "",
        frame: "",
        frameMake: "",
        receiver: "",
        receiverMake: "",
        ...inspectionData.serialNumbers,
      },
      actionType: {
        manual: false,
        semiAuto: false,
        automatic: false,
        bolt: false,
        breakneck: false,
        pump: false,
        cappingBreechLoader: false,
        lever: false,
        cylinder: false,
        fallingBlock: false,
        other: false,
        otherDetails: "",
        ...inspectionData.actionType,
      },
    }

    const result = updateInDataStore("inspections", params.id, updatedInspection)

    if (!result) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    console.log(`🔄 Updated inspection: ${params.id}`)

    return NextResponse.json({ inspection: result })
  } catch (error) {
    console.error("Error updating inspection:", error)
    return NextResponse.json({ error: "Failed to update inspection" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = deleteFromDataStore("inspections", params.id)

    if (!result) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    console.log(`🗑️ Deleted inspection: ${params.id}`)

    return NextResponse.json({ message: "Inspection deleted successfully" })
  } catch (error) {
    console.error("Error deleting inspection:", error)
    return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 })
  }
}
