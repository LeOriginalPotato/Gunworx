import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateCentralDataStore } from "../data-migration/route"

// In-memory storage for firearms (in production, this would be a database)
let firearmsStorage: any[] = []

// Initialize with default data if empty
const initializeFirearmsData = () => {
  if (firearmsStorage.length === 0) {
    firearmsStorage = [
      {
        id: "1",
        stockNo: "CO3",
        dateReceived: "2023-11-15",
        make: "Walther",
        type: "Pistol",
        caliber: "7.65",
        serialNo: "223083",
        fullName: "GM",
        surname: "Smuts",
        registrationId: "1/23/1985",
        physicalAddress: "",
        licenceNo: "31/21",
        licenceDate: "",
        remarks: "Mac EPR Dealer Stock",
        status: "dealer-stock",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        stockNo: "A01",
        dateReceived: "2025-05-07",
        make: "Glock",
        type: "Pistol",
        caliber: "9mm",
        serialNo: "SSN655",
        fullName: "I",
        surname: "Dunn",
        registrationId: "9103035027088",
        physicalAddress: "54 Lazaar Ave",
        licenceNo: "",
        licenceDate: "",
        remarks: "Safekeeping",
        status: "safe-keeping",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const centralData = getCentralDataStore()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let filteredFirearms = [...centralData.firearms]

    // Apply status filter
    if (status && status !== "all") {
      filteredFirearms = filteredFirearms.filter((f) => f.status === status)
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredFirearms = filteredFirearms.filter((f) =>
        Object.values(f).some((value) => value && value.toString().toLowerCase().includes(searchTerm)),
      )
    }

    return NextResponse.json({
      firearms: filteredFirearms,
      total: centralData.firearms.length,
      lastUpdated: centralData.lastUpdated,
    })
  } catch (error) {
    console.error("Error fetching firearms:", error)
    return NextResponse.json({ error: "Failed to fetch firearms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const centralData = getCentralDataStore()
    const firearmData = await request.json()

    // Validate required fields
    if (!firearmData.stockNo || !firearmData.make || !firearmData.serialNo) {
      return NextResponse.json({ error: "Missing required fields: stockNo, make, serialNo" }, { status: 400 })
    }

    const newFirearm = {
      ...firearmData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to central data store
    centralData.firearms.push(newFirearm)
    updateCentralDataStore(centralData)

    return NextResponse.json(
      {
        firearm: newFirearm,
        total: centralData.firearms.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating firearm:", error)
    return NextResponse.json({ error: "Failed to create firearm" }, { status: 500 })
  }
}
