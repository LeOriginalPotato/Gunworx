import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateInDataStore, deleteFromDataStore } from "../../data-migration/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataStore = getCentralDataStore()
    const inspection = dataStore.inspections.find((i: any) => i.id === params.id)

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      inspection,
    })
  } catch (error) {
    console.error("Error fetching inspection:", error)
    return NextResponse.json({ error: "Failed to fetch inspection" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inspectionData = await request.json()

    console.log(`🔄 API: Updating inspection ${params.id}:`, inspectionData)

    // Ensure all nested objects have proper structure
    const processedInspection = {
      date: inspectionData.date,
      inspector: inspectionData.inspector || "Unknown Inspector",
      inspectorId: inspectionData.inspectorId || "",
      companyName: inspectionData.companyName || "",
      dealerCode: inspectionData.dealerCode || "",
      firearmType: {
        pistol: Boolean(inspectionData.firearmType?.pistol),
        revolver: Boolean(inspectionData.firearmType?.revolver),
        rifle: Boolean(inspectionData.firearmType?.rifle),
        selfLoadingRifle: Boolean(inspectionData.firearmType?.selfLoadingRifle),
        shotgun: Boolean(inspectionData.firearmType?.shotgun),
        combination: Boolean(inspectionData.firearmType?.combination),
        other: Boolean(inspectionData.firearmType?.other),
        otherDetails: inspectionData.firearmType?.otherDetails || "",
      },
      caliber: inspectionData.caliber || "",
      cartridgeCode: inspectionData.cartridgeCode || "",
      serialNumbers: {
        barrel: inspectionData.serialNumbers?.barrel || "",
        barrelMake: inspectionData.serialNumbers?.barrelMake || "",
        frame: inspectionData.serialNumbers?.frame || "",
        frameMake: inspectionData.serialNumbers?.frameMake || "",
        receiver: inspectionData.serialNumbers?.receiver || "",
        receiverMake: inspectionData.serialNumbers?.receiverMake || "",
      },
      actionType: {
        manual: Boolean(inspectionData.actionType?.manual),
        semiAuto: Boolean(inspectionData.actionType?.semiAuto),
        automatic: Boolean(inspectionData.actionType?.automatic),
        bolt: Boolean(inspectionData.actionType?.bolt),
        breakneck: Boolean(inspectionData.actionType?.breakneck),
        pump: Boolean(inspectionData.actionType?.pump),
        cappingBreechLoader: Boolean(inspectionData.actionType?.cappingBreechLoader),
        lever: Boolean(inspectionData.actionType?.lever),
        cylinder: Boolean(inspectionData.actionType?.cylinder),
        fallingBlock: Boolean(inspectionData.actionType?.fallingBlock),
        other: Boolean(inspectionData.actionType?.other),
        otherDetails: inspectionData.actionType?.otherDetails || "",
      },
      make: inspectionData.make || "",
      countryOfOrigin: inspectionData.countryOfOrigin || "",
      observations: inspectionData.observations || "",
      comments: inspectionData.comments || "",
      signature: inspectionData.signature || "",
      inspectorTitle: inspectionData.inspectorTitle || "",
      status: inspectionData.status || "pending",
    }

    const updatedInspection = updateInDataStore("inspections", params.id, processedInspection)

    if (!updatedInspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    console.log(`✅ API: Successfully updated inspection ${params.id}`)

    return NextResponse.json({
      success: true,
      inspection: updatedInspection,
      message: "Inspection updated successfully",
    })
  } catch (error) {
    console.error(`❌ API: Error updating inspection ${params.id}:`, error)
    return NextResponse.json(
      { error: `Failed to update inspection: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`🗑️ API: Attempting to delete inspection ${params.id}`)

    const success = deleteFromDataStore("inspections", params.id)

    if (!success) {
      console.log(`❌ API: Inspection ${params.id} not found for deletion`)
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    console.log(`✅ API: Successfully deleted inspection ${params.id}`)

    return NextResponse.json({
      success: true,
      message: "Inspection deleted successfully",
    })
  } catch (error) {
    console.error(`❌ API: Error deleting inspection ${params.id}:`, error)
    return NextResponse.json(
      { error: `Failed to delete inspection: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
