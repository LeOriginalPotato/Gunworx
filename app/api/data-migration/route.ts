import { type NextRequest, NextResponse } from "next/server"

// Central data store
let centralData = {
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
  inspections: [
    // Only SMITH & WESSON inspections from the PDF - exactly 14 records
    {
      id: "inspection_1",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27496",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_2",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27497",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_3",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27498",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_4",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27499",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_5",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27500",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_6",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27501",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_7",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27502",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_8",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27503",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_9",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN87634",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_10",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN87637",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_11",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN91382",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_12",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN91387",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_13",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN91390",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_14",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".350 LEGEND",
      serialNumber: "EEJ6562",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
  ],
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

export async function GET() {
  return NextResponse.json({
    success: true,
    data: centralData,
    counts: {
      firearms: centralData.firearms.length,
      inspections: centralData.inspections.length,
      users: centralData.users.length,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "restore":
        if (data) {
          centralData = { ...centralData, ...data }
          return NextResponse.json({
            success: true,
            message: "Data restored successfully",
            restored: {
              firearms: data.firearms?.length || 0,
              inspections: data.inspections?.length || 0,
              users: data.users?.length || 0,
            },
          })
        }
        break

      case "backup":
        return NextResponse.json({
          success: true,
          backup: centralData,
          timestamp: new Date().toISOString(),
        })

      case "reset":
        centralData = {
          firearms: [],
          inspections: [],
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
        return NextResponse.json({
          success: true,
          message: "Data reset successfully",
        })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Data migration error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// Helper functions to access and update the central data store - REQUIRED EXPORTS
export function getCentralDataStore() {
  return centralData
}

export function updateCentralDataStore(newData: any) {
  centralData = { ...centralData, ...newData }
}

// Export the central data for other modules to use
export { centralData }
