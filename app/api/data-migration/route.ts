import { type NextRequest, NextResponse } from "next/server"

// Centralized data store - in production, this would be a database
let centralDataStore = {
  firearms: [] as any[],
  inspections: [] as any[],
  users: [] as any[],
  lastUpdated: new Date().toISOString(),
}

// Initialize with default data if empty
const initializeCentralData = () => {
  if (centralDataStore.firearms.length === 0) {
    centralDataStore.firearms = [
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

  if (centralDataStore.inspections.length === 0) {
    centralDataStore.inspections = [
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

  if (centralDataStore.users.length === 0) {
    centralDataStore.users = [
      {
        id: "1",
        username: "admin",
        password: "admin123",
        role: "admin",
        isSystemAdmin: true,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        username: "manager",
        password: "manager123",
        role: "manager",
        isSystemAdmin: false,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        username: "inspector",
        password: "inspector123",
        role: "inspector",
        isSystemAdmin: false,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

// Export the central data store for other API routes to use
export const getCentralDataStore = () => {
  initializeCentralData()
  return centralDataStore
}

export const updateCentralDataStore = (newData: Partial<typeof centralDataStore>) => {
  centralDataStore = {
    ...centralDataStore,
    ...newData,
    lastUpdated: new Date().toISOString(),
  }
}

// This endpoint handles data migration and synchronization
export async function POST(request: NextRequest) {
  try {
    initializeCentralData()

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "sync":
        // Merge local data with central data store
        if (data.firearms && Array.isArray(data.firearms)) {
          // Add any new firearms from local storage that don't exist centrally
          data.firearms.forEach((localFirearm: any) => {
            const exists = centralDataStore.firearms.find((f) => f.id === localFirearm.id)
            if (!exists) {
              centralDataStore.firearms.push({
                ...localFirearm,
                syncedAt: new Date().toISOString(),
              })
            }
          })
        }

        if (data.inspections && Array.isArray(data.inspections)) {
          // Add any new inspections from local storage that don't exist centrally
          data.inspections.forEach((localInspection: any) => {
            const exists = centralDataStore.inspections.find((i) => i.id === localInspection.id)
            if (!exists) {
              centralDataStore.inspections.push({
                ...localInspection,
                syncedAt: new Date().toISOString(),
              })
            }
          })
        }

        if (data.users && Array.isArray(data.users)) {
          // Add any new users from local storage that don't exist centrally
          data.users.forEach((localUser: any) => {
            const exists = centralDataStore.users.find((u) => u.id === localUser.id)
            if (!exists) {
              centralDataStore.users.push({
                ...localUser,
                syncedAt: new Date().toISOString(),
              })
            }
          })
        }

        centralDataStore.lastUpdated = new Date().toISOString()

        return NextResponse.json({
          success: true,
          message: "Data synchronized successfully",
          synced: {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          },
          data: centralDataStore,
        })

      case "backup":
        return NextResponse.json({
          backup: centralDataStore,
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        })

      case "restore":
        if (data && typeof data === "object") {
          // Validate the backup data structure
          if (data.firearms && Array.isArray(data.firearms)) {
            centralDataStore.firearms = data.firearms
          }
          if (data.inspections && Array.isArray(data.inspections)) {
            centralDataStore.inspections = data.inspections
          }
          if (data.users && Array.isArray(data.users)) {
            centralDataStore.users = data.users
          }

          centralDataStore.lastUpdated = new Date().toISOString()

          return NextResponse.json({
            success: true,
            message: "Data restored successfully",
            restored: {
              firearms: centralDataStore.firearms.length,
              inspections: centralDataStore.inspections.length,
              users: centralDataStore.users.length,
            },
          })
        } else {
          return NextResponse.json({ error: "Invalid backup data format" }, { status: 400 })
        }

      case "reset":
        // Reset to default data (admin only operation)
        centralDataStore = {
          firearms: [],
          inspections: [],
          users: [],
          lastUpdated: new Date().toISOString(),
        }
        initializeCentralData()

        return NextResponse.json({
          success: true,
          message: "Data reset to defaults",
          data: centralDataStore,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data migration POST:", error)
    return NextResponse.json({ error: "Failed to process data migration" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    initializeCentralData()

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "backup":
        return NextResponse.json({
          backup: centralDataStore,
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        })

      case "status":
        return NextResponse.json({
          status: "healthy",
          lastUpdated: centralDataStore.lastUpdated,
          counts: {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          },
        })

      default:
        return NextResponse.json({
          data: centralDataStore,
          timestamp: new Date().toISOString(),
        })
    }
  } catch (error) {
    console.error("Error in data migration GET:", error)
    return NextResponse.json({ error: "Failed to retrieve data" }, { status: 500 })
  }
}
