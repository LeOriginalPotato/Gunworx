import { type NextRequest, NextResponse } from "next/server"

// Complete inspection data - ONLY SMITH & WESSON records with 2025-06-03 date
const completeInspectionData = [
  {
    id: "inspection_1",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27496",
      barrelMake: "",
      frame: "UB27496",
      frameMake: "",
      receiver: "UB27496",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_2",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27497",
      barrelMake: "",
      frame: "UB27497",
      frameMake: "",
      receiver: "UB27497",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_3",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "N/A",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27498",
      barrelMake: "",
      frame: "UB27498",
      frameMake: "",
      receiver: "UB27498",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_4",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27499",
      barrelMake: "",
      frame: "UB27499",
      frameMake: "",
      receiver: "UB27499",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_5",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27500",
      barrelMake: "",
      frame: "UB27500",
      frameMake: "",
      receiver: "UB27500",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_6",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27501",
      barrelMake: "",
      frame: "UB27501",
      frameMake: "",
      receiver: "UB27501",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_7",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27502",
      barrelMake: "",
      frame: "UB27502",
      frameMake: "",
      receiver: "UB27502",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_8",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "UB27503",
      barrelMake: "",
      frame: "UB27503",
      frameMake: "",
      receiver: "UB27503",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: true,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_9",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "KN87634",
      barrelMake: "",
      frame: "KN87634",
      frameMake: "",
      receiver: "KN87634",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_10",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "KN87637",
      barrelMake: "",
      frame: "KN87637",
      frameMake: "",
      receiver: "KN87637",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_11",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "KN91382",
      barrelMake: "",
      frame: "KN91382",
      frameMake: "",
      receiver: "KN91382",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_12",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "KN91387",
      barrelMake: "",
      frame: "KN91387",
      frameMake: "",
      receiver: "KN91387",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_13",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "KN91390",
      barrelMake: "",
      frame: "KN91390",
      frameMake: "",
      receiver: "KN91390",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
  {
    id: "inspection_14",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    inspectorId: null,
    companyName: "Delta",
    dealerCode: null,
    make: "SMITH & WESSON",
    caliber: ".350 LEGEND",
    cartridgeCode: null,
    status: "PENDING",
    serialNumbers: {
      barrel: "EEJ6562",
      barrelMake: "",
      frame: "EEJ6562",
      frameMake: "",
      receiver: "EEJ6562",
      receiverMake: "",
    },
    observations: "No observations recorded",
    comments: "",
    signature: "",
    inspectorTitle: "",
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
    },
    countryOfOrigin: "",
    createdAt: "2025-06-03T10:00:00Z",
    updatedAt: "2025-06-03T10:00:00Z",
  },
]

// Central data store that persists across requests
let centralDataStore = {
  firearms: [
    {
      id: "firearm_1",
      stockNo: "GW001",
      dateReceived: "2024-01-15",
      make: "Walther",
      type: "Pistol",
      caliber: "9mm",
      serialNo: "WA123456",
      fullName: "John Smith",
      surname: "Smith",
      registrationId: "8501015800083",
      physicalAddress: "123 Main Street, Cape Town, 8001",
      licenceNo: "L001234",
      licenceDate: "2024-01-01",
      remarks: "Standard service pistol",
      status: "in-stock",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "firearm_2",
      stockNo: "GW002",
      dateReceived: "2024-02-20",
      make: "Glock",
      type: "Pistol",
      caliber: "9mm",
      serialNo: "GL789012",
      fullName: "Jane Doe",
      surname: "Doe",
      registrationId: "9203125900084",
      physicalAddress: "456 Oak Avenue, Johannesburg, 2000",
      licenceNo: "L005678",
      licenceDate: "2024-02-01",
      remarks: "Compact model",
      status: "safe-keeping",
      createdAt: "2024-02-20T14:30:00Z",
      updatedAt: "2024-02-20T14:30:00Z",
    },
  ],
  inspections: completeInspectionData,
  users: [
    {
      id: "user_1",
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      email: "admin@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_2",
      username: "manager",
      password: "manager123",
      role: "manager",
      fullName: "Operations Manager",
      email: "manager@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_3",
      username: "inspector",
      password: "inspector123",
      role: "inspector",
      fullName: "Firearm Inspector",
      email: "inspector@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_4",
      username: "wikus",
      password: "wikus123",
      role: "inspector",
      fullName: "Wikus Fourie",
      email: "wikus@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_5",
      username: "Dymian",
      password: "Dymian@888",
      role: "admin",
      fullName: "Dymian Administrator",
      email: "dymian@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
}

// Helper functions to access and update the central data store - REQUIRED EXPORTS
export function getCentralDataStore() {
  return centralDataStore
}

export function updateCentralDataStore(newData: any) {
  centralDataStore = { ...centralDataStore, ...newData }
}

// Main API handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "status":
        return NextResponse.json({
          status: "online",
          timestamp: new Date().toISOString(),
          counts: {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          },
        })

      case "backup":
        return NextResponse.json({
          timestamp: new Date().toISOString(),
          data: centralDataStore,
        })

      default:
        return NextResponse.json({
          message: "Data migration API is running",
          timestamp: new Date().toISOString(),
          data: centralDataStore,
        })
    }
  } catch (error) {
    console.error("Error in data migration GET:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "sync":
        if (data.firearms) {
          const existingFirearmIds = new Set(centralDataStore.firearms.map((f) => f.id))
          const newFirearms = data.firearms.filter((f: any) => !existingFirearmIds.has(f.id))
          centralDataStore.firearms = [...centralDataStore.firearms, ...newFirearms]
        }

        if (data.inspections) {
          const existingInspectionIds = new Set(centralDataStore.inspections.map((i) => i.id))
          const newInspections = data.inspections.filter((i: any) => !existingInspectionIds.has(i.id))
          centralDataStore.inspections = [...centralDataStore.inspections, ...newInspections]
        }

        if (data.users) {
          const existingUserIds = new Set(centralDataStore.users.map((u) => u.id))
          const newUsers = data.users.filter((u: any) => !existingUserIds.has(u.id))
          centralDataStore.users = [...centralDataStore.users, ...newUsers]
        }

        return NextResponse.json({
          message: "Data synchronized successfully",
          synced: {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          },
          data: centralDataStore,
        })

      case "restore":
        if (data) {
          centralDataStore = {
            firearms: data.firearms || [],
            inspections: data.inspections || [],
            users: data.users || [],
          }
        }

        return NextResponse.json({
          message: "Data restored successfully",
          restored: {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          },
          data: centralDataStore,
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data migration POST:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body

    switch (type) {
      case "firearm":
        const firearmIndex = centralDataStore.firearms.findIndex((f) => f.id === id)
        if (firearmIndex !== -1) {
          centralDataStore.firearms[firearmIndex] = {
            ...centralDataStore.firearms[firearmIndex],
            ...data,
            updatedAt: new Date().toISOString(),
          }
          return NextResponse.json({
            message: "Firearm updated successfully",
            firearm: centralDataStore.firearms[firearmIndex],
          })
        }
        return NextResponse.json({ error: "Firearm not found" }, { status: 404 })

      case "inspection":
        const inspectionIndex = centralDataStore.inspections.findIndex((i) => i.id === id)
        if (inspectionIndex !== -1) {
          centralDataStore.inspections[inspectionIndex] = {
            ...centralDataStore.inspections[inspectionIndex],
            ...data,
            updatedAt: new Date().toISOString(),
          }
          return NextResponse.json({
            message: "Inspection updated successfully",
            inspection: centralDataStore.inspections[inspectionIndex],
          })
        }
        return NextResponse.json({ error: "Inspection not found" }, { status: 404 })

      case "user":
        const userIndex = centralDataStore.users.findIndex((u) => u.id === id)
        if (userIndex !== -1) {
          centralDataStore.users[userIndex] = {
            ...centralDataStore.users[userIndex],
            ...data,
            updatedAt: new Date().toISOString(),
          }
          return NextResponse.json({
            message: "User updated successfully",
            user: centralDataStore.users[userIndex],
          })
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 })

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data migration PUT:", error)
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    if (!type || !id) {
      return NextResponse.json({ error: "Type and ID are required" }, { status: 400 })
    }

    switch (type) {
      case "firearm":
        const firearmIndex = centralDataStore.firearms.findIndex((f) => f.id === id)
        if (firearmIndex !== -1) {
          centralDataStore.firearms.splice(firearmIndex, 1)
          return NextResponse.json({
            message: "Firearm deleted successfully",
            total: centralDataStore.firearms.length,
          })
        }
        return NextResponse.json({ error: "Firearm not found" }, { status: 404 })

      case "inspection":
        const inspectionIndex = centralDataStore.inspections.findIndex((i) => i.id === id)
        if (inspectionIndex !== -1) {
          centralDataStore.inspections.splice(inspectionIndex, 1)
          return NextResponse.json({
            message: "Inspection deleted successfully",
            total: centralDataStore.inspections.length,
          })
        }
        return NextResponse.json({ error: "Inspection not found" }, { status: 404 })

      case "user":
        const userIndex = centralDataStore.users.findIndex((u) => u.id === id)
        if (userIndex !== -1) {
          centralDataStore.users.splice(userIndex, 1)
          return NextResponse.json({
            message: "User deleted successfully",
            total: centralDataStore.users.length,
          })
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 })

      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data migration DELETE:", error)
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 })
  }
}
