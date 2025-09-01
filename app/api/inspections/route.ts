import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateCentralDataStore } from "../data-migration/route"

export async function GET(request: NextRequest) {
  try {
    const centralData = getCentralDataStore()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let filteredInspections = [...centralData.inspections]

    // Apply search filter - enhanced to include serial numbers
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredInspections = filteredInspections.filter((inspection) => {
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
      inspections: filteredInspections,
      total: centralData.inspections.length,
      lastUpdated: centralData.lastUpdated,
    })
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const centralData = getCentralDataStore()
    const inspectionData = await request.json()

    // Validate required fields
    if (!inspectionData.date) {
      return NextResponse.json({ error: "Inspection date is required" }, { status: 400 })
    }

    const newInspection = {
      ...inspectionData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      // Ensure all required fields have defaults
      inspector: inspectionData.inspector || "Unknown Inspector",
      inspectorId: inspectionData.inspectorId || "",
      companyName: inspectionData.companyName || "",
      dealerCode: inspectionData.dealerCode || "",
      caliber: inspectionData.caliber || "",
      cartridgeCode: inspectionData.cartridgeCode || "",
      make: inspectionData.make || "",
      countryOfOrigin: inspectionData.countryOfOrigin || "",
      observations: inspectionData.observations || "",
      comments: inspectionData.comments || "",
      signature: inspectionData.signature || "",
      inspectorTitle: inspectionData.inspectorTitle || "",
      status: inspectionData.status || "pending",
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    centralData.inspections.push(newInspection)
    updateCentralDataStore(centralData)

    return NextResponse.json(
      {
        inspection: newInspection,
        total: centralData.inspections.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating inspection:", error)
    return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 })
  }
}
