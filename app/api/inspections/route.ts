import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateCentralDataStore } from "../data-migration/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const dataStore = getCentralDataStore()
    let inspections = dataStore.inspections || []

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase()
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
        ].some((value) => value && value.toString().toLowerCase().includes(searchLower))

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
          ].some((value) => value && value.toString().toLowerCase().includes(searchLower))

        return basicFieldsMatch || serialNumbersMatch
      })
    }

    console.log(`📡 Returning ${inspections.length} inspections (search: "${search || "none"}")`)

    return NextResponse.json({
      inspections,
      total: inspections.length,
    })
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("🔄 Creating new inspection:", body)

    // Generate a unique ID for the new inspection
    const newId = `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create the complete inspection object with proper structure
    const newInspection = {
      id: newId,
      date: body.date || new Date().toISOString().split("T")[0],
      inspector: body.inspector || "",
      inspectorId: body.inspectorId || "",
      companyName: body.companyName || "",
      dealerCode: body.dealerCode || "",
      firearmType: {
        pistol: body.firearmType?.pistol || false,
        revolver: body.firearmType?.revolver || false,
        rifle: body.firearmType?.rifle || false,
        selfLoadingRifle: body.firearmType?.selfLoadingRifle || false,
        shotgun: body.firearmType?.shotgun || false,
        combination: body.firearmType?.combination || false,
        other: body.firearmType?.other || false,
        otherDetails: body.firearmType?.otherDetails || "",
      },
      caliber: body.caliber || "",
      cartridgeCode: body.cartridgeCode || "",
      serialNumbers: {
        barrel: body.serialNumbers?.barrel || "",
        barrelMake: body.serialNumbers?.barrelMake || "",
        frame: body.serialNumbers?.frame || "",
        frameMake: body.serialNumbers?.frameMake || "",
        receiver: body.serialNumbers?.receiver || "",
        receiverMake: body.serialNumbers?.receiverMake || "",
      },
      actionType: {
        manual: body.actionType?.manual || false,
        semiAuto: body.actionType?.semiAuto || false,
        automatic: body.actionType?.automatic || false,
        bolt: body.actionType?.bolt || false,
        breakneck: body.actionType?.breakneck || false,
        pump: body.actionType?.pump || false,
        cappingBreechLoader: body.actionType?.cappingBreechLoader || false,
        lever: body.actionType?.lever || false,
        cylinder: body.actionType?.cylinder || false,
        fallingBlock: body.actionType?.fallingBlock || false,
        other: body.actionType?.other || false,
        otherDetails: body.actionType?.otherDetails || "",
      },
      make: body.make || "",
      countryOfOrigin: body.countryOfOrigin || "",
      observations: body.observations || "",
      comments: body.comments || "",
      signature: body.signature || "",
      inspectorTitle: body.inspectorTitle || "",
      status: body.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Get current data store and add the new inspection
    const currentDataStore = getCentralDataStore()
    const updatedInspections = [...(currentDataStore.inspections || []), newInspection]

    // Update the central data store
    updateCentralDataStore({
      ...currentDataStore,
      inspections: updatedInspections,
    })

    console.log(`✅ Created inspection with ID: ${newId}`)

    return NextResponse.json({
      message: "Inspection created successfully",
      inspection: newInspection,
    })
  } catch (error) {
    console.error("Error creating inspection:", error)
    return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 })
  }
}
