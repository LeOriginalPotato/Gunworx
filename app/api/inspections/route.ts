import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, addToDataStore, updateInDataStore } from "../data-migration/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    console.log(`📡 API: Fetching inspections${search ? ` with search: "${search}"` : ""}`)

    const dataStore = getCentralDataStore()
    let inspections = dataStore.inspections || []

    // Apply search filter if provided
    if (search) {
      const searchTerm = search.toLowerCase()
      inspections = inspections.filter((inspection: any) => {
        // Search in basic fields
        const basicFieldsMatch = [
          inspection.inspector,
          inspection.inspectorId,
          inspection.companyName,
          inspection.dealerCode,
          inspection.caliber,
          inspection.cartridgeCode,
          inspection.make,
          inspection.countryOfOrigin,
          inspection.observations,
          inspection.comments,
          inspection.inspectorTitle,
          inspection.status,
          inspection.date,
        ].some((value) => value && value.toString().toLowerCase().includes(searchTerm))

        // Search in serial numbers
        const serialNumbersMatch =
          inspection.serialNumbers &&
          [
            inspection.serialNumbers.barrel,
            inspection.serialNumbers.barrelMake,
            inspection.serialNumbers.frame,
            inspection.serialNumbers.frameMake,
            inspection.serialNumbers.receiver,
            inspection.serialNumbers.receiverMake,
          ].some((value) => value && value.toString().toLowerCase().includes(searchTerm))

        return basicFieldsMatch || serialNumbersMatch
      })

      console.log(`🔍 API: Search for "${search}" returned ${inspections.length} results`)
    }

    console.log(`📡 API: Returning ${inspections.length} inspections`)

    return NextResponse.json({
      success: true,
      inspections,
      count: inspections.length,
    })
  } catch (error) {
    console.error("❌ API: Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const inspectionData = await request.json()

    console.log("🚀 API: Creating new inspection:", inspectionData)

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

    const newInspection = addToDataStore("inspections", processedInspection)

    console.log(`✅ API: Successfully created inspection with ID: ${newInspection.id}`)

    return NextResponse.json({
      success: true,
      inspection: newInspection,
      message: "Inspection created successfully",
    })
  } catch (error) {
    console.error("❌ API: Error creating inspection:", error)
    return NextResponse.json(
      { error: `Failed to create inspection: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === "bulk_update_status") {
      const { status, inspectionIds } = data
      let updatedCount = 0

      console.log(
        `🔄 API: Bulk updating inspection status to "${status}" for ${inspectionIds?.length || "all"} inspections`,
      )

      const dataStore = getCentralDataStore()

      if (inspectionIds && inspectionIds.length > 0) {
        // Update specific inspections
        inspectionIds.forEach((id: string) => {
          const updated = updateInDataStore("inspections", id, { status })
          if (updated) updatedCount++
        })
      } else {
        // Update all inspections
        dataStore.inspections.forEach((inspection: any) => {
          updateInDataStore("inspections", inspection.id, { status })
          updatedCount++
        })
      }

      console.log(`✅ API: Successfully updated ${updatedCount} inspections to "${status}"`)

      return NextResponse.json({
        success: true,
        updated: updatedCount,
        message: `Updated ${updatedCount} inspections to status: ${status}`,
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("❌ API: Error in bulk update:", error)
    return NextResponse.json(
      { error: `Failed to bulk update: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
