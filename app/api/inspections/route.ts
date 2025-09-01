import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, addToDataStore } from "../data-migration/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const dataStore = getCentralDataStore()
    let inspections = dataStore.inspections

    // Apply search filter - enhanced to include serial numbers
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

        // Search in firearm type
        const firearmTypeMatch =
          inspection.firearmType &&
          [inspection.firearmType.otherDetails].some(
            (value) => value && value.toString().toLowerCase().includes(searchTerm),
          )

        // Search in action type
        const actionTypeMatch =
          inspection.actionType &&
          [inspection.actionType.otherDetails].some(
            (value) => value && value.toString().toLowerCase().includes(searchTerm),
          )

        // Search in firearm type boolean fields (convert to readable text)
        const firearmTypeTextMatch =
          inspection.firearmType &&
          [
            inspection.firearmType.pistol && "pistol",
            inspection.firearmType.revolver && "revolver",
            inspection.firearmType.rifle && "rifle",
            inspection.firearmType.selfLoadingRifle && "self-loading rifle",
            inspection.firearmType.shotgun && "shotgun",
            inspection.firearmType.combination && "combination",
            inspection.firearmType.other && "other",
          ]
            .filter(Boolean)
            .some((value) => value && value.toLowerCase().includes(searchTerm))

        // Search in action type boolean fields (convert to readable text)
        const actionTypeTextMatch =
          inspection.actionType &&
          [
            inspection.actionType.manual && "manual",
            inspection.actionType.semiAuto && "semi auto",
            inspection.actionType.automatic && "automatic",
            inspection.actionType.bolt && "bolt",
            inspection.actionType.breakneck && "breakneck",
            inspection.actionType.pump && "pump",
            inspection.actionType.cappingBreechLoader && "capping breech loader",
            inspection.actionType.lever && "lever",
            inspection.actionType.cylinder && "cylinder",
            inspection.actionType.fallingBlock && "falling block",
            inspection.actionType.other && "other",
          ]
            .filter(Boolean)
            .some((value) => value && value.toLowerCase().includes(searchTerm))

        return (
          basicFieldsMatch ||
          serialNumbersMatch ||
          firearmTypeMatch ||
          actionTypeMatch ||
          firearmTypeTextMatch ||
          actionTypeTextMatch
        )
      })
    }

    return NextResponse.json({
      inspections: inspections,
      total: dataStore.inspections.length,
      lastUpdated: dataStore.lastUpdated,
    })
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const inspectionData = await request.json()

    console.log("📝 Received inspection data:", inspectionData)

    // Validate required fields - match the frontend structure
    if (!inspectionData.date) {
      console.error("Validation failed: Missing inspection date")
      return NextResponse.json({ error: "Inspection date is required" }, { status: 400 })
    }

    // Create inspection object with the structure expected by the frontend
    const newInspection = {
      id: `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: inspectionData.date,
      inspector: inspectionData.inspector || "Unknown Inspector",
      inspectorId: inspectionData.inspectorId || "",
      companyName: inspectionData.companyName || "",
      dealerCode: inspectionData.dealerCode || "",

      // Ensure firearmType has proper structure
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

      // Ensure serialNumbers has proper structure
      serialNumbers: {
        barrel: inspectionData.serialNumbers?.barrel || "",
        barrelMake: inspectionData.serialNumbers?.barrelMake || "",
        frame: inspectionData.serialNumbers?.frame || "",
        frameMake: inspectionData.serialNumbers?.frameMake || "",
        receiver: inspectionData.serialNumbers?.receiver || "",
        receiverMake: inspectionData.serialNumbers?.receiverMake || "",
      },

      // Ensure actionType has proper structure
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

      // Add timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("📋 Structured inspection data:", newInspection)

    // Add to data store
    const addedInspection = addToDataStore("inspections", newInspection)

    if (!addedInspection) {
      throw new Error("Failed to add inspection to data store")
    }

    console.log("✅ Inspection created successfully:", addedInspection.id)

    return NextResponse.json(
      {
        inspection: addedInspection,
        total: getCentralDataStore().inspections.length,
        message: "Inspection created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating inspection:", error)
    return NextResponse.json(
      {
        error: "Failed to create inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
