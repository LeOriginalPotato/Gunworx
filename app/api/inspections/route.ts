import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for inspections (in production, this would be a database)
let inspectionsStorage: any[] = []

// Initialize with default data if empty
const initializeInspectionsData = () => {
  if (inspectionsStorage.length === 0) {
    inspectionsStorage = [
      {
        id: "1",
        date: "2024-04-04",
        inspector: "Wikus Fourie",
        inspectorId: "910604 5129 083",
        companyName: "Delta",
        dealerCode: "1964",
        firearmType: {
          pistol: false,
          revolver: false,
          rifle: true,
          selfLoadingRifle: false,
          shotgun: false,
          combination: false,
          other: false,
          otherDetails: "",
        },
        caliber: ".308 WIN",
        cartridgeCode: "123",
        serialNumbers: {
          barrel: "690745661",
          barrelMake: "RUGER",
          frame: "690745661",
          frameMake: "RUGER",
          receiver: "690745661",
          receiverMake: "RUGER",
        },
        actionType: {
          manual: false,
          semiAuto: false,
          automatic: false,
          bolt: true,
          breakneck: false,
          pump: false,
          cappingBreechLoader: false,
          lever: false,
          cylinder: false,
          fallingBlock: false,
          other: false,
          otherDetails: "",
        },
        make: "RUGER",
        countryOfOrigin: "USA",
        observations:
          "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
        comments: "",
        signature: "",
        inspectorTitle: "Head Gunsmith",
        status: "passed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    initializeInspectionsData()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let filteredInspections = [...inspectionsStorage]

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredInspections = filteredInspections.filter((i) =>
        Object.values(i).some((value) => value && value.toString().toLowerCase().includes(searchTerm)),
      )
    }

    return NextResponse.json({ inspections: filteredInspections })
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeInspectionsData()

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

    inspectionsStorage.push(newInspection)

    return NextResponse.json({ inspection: newInspection }, { status: 201 })
  } catch (error) {
    console.error("Error creating inspection:", error)
    return NextResponse.json({ error: "Failed to create inspection" }, { status: 500 })
  }
}
