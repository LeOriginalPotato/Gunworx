import { type NextRequest, NextResponse } from "next/server"

// In-memory data store (in production, this would be a database)
let centralDataStore = {
  firearms: [],
  inspections: [],
  users: [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      email: "admin@gunworx.com",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "2",
      username: "inspector",
      password: "inspect123",
      role: "inspector",
      fullName: "John Inspector",
      email: "inspector@gunworx.com",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "3",
      username: "user",
      password: "user123",
      role: "user",
      fullName: "Regular User",
      email: "user@gunworx.com",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ],
  lastUpdated: new Date().toISOString(),
}

export function getCentralDataStore() {
  return centralDataStore
}

export function updateCentralDataStore(newData: any) {
  centralDataStore = {
    ...centralDataStore,
    ...newData,
    lastUpdated: new Date().toISOString(),
  }
  return centralDataStore
}

export function addToDataStore(type: string, item: any) {
  const id = item.id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const newItem = {
    ...item,
    id,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (type === "firearms") {
    centralDataStore.firearms.push(newItem)
  } else if (type === "inspections") {
    centralDataStore.inspections.push(newItem)
  } else if (type === "users") {
    centralDataStore.users.push(newItem)
  }

  centralDataStore.lastUpdated = new Date().toISOString()
  return newItem
}

export function updateInDataStore(type: string, id: string, updates: any) {
  let collection
  if (type === "firearms") {
    collection = centralDataStore.firearms
  } else if (type === "inspections") {
    collection = centralDataStore.inspections
  } else if (type === "users") {
    collection = centralDataStore.users
  } else {
    return null
  }

  const index = collection.findIndex((item: any) => item.id === id)
  if (index !== -1) {
    collection[index] = {
      ...collection[index],
      ...updates,
      id, // Preserve the original ID
      updatedAt: new Date().toISOString(),
    }
    centralDataStore.lastUpdated = new Date().toISOString()
    return collection[index]
  }
  return null
}

export function deleteFromDataStore(type: string, id: string) {
  if (type === "firearms") {
    centralDataStore.firearms = centralDataStore.firearms.filter((item: any) => item.id !== id)
  } else if (type === "inspections") {
    centralDataStore.inspections = centralDataStore.inspections.filter((item: any) => item.id !== id)
  } else if (type === "users") {
    centralDataStore.users = centralDataStore.users.filter((item: any) => item.id !== id)
  }

  centralDataStore.lastUpdated = new Date().toISOString()
  return true
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "status":
        return NextResponse.json({
          status: "online",
          lastUpdated: centralDataStore.lastUpdated,
          counts: {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          },
        })

      case "backup":
        return NextResponse.json({
          data: centralDataStore,
          timestamp: new Date().toISOString(),
          version: "1.0",
        })

      default:
        return NextResponse.json(centralDataStore)
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
        // Merge incoming data with existing data
        if (data.firearms) {
          centralDataStore.firearms = [...centralDataStore.firearms, ...data.firearms]
        }
        if (data.inspections) {
          centralDataStore.inspections = [...centralDataStore.inspections, ...data.inspections]
        }
        if (data.users) {
          centralDataStore.users = [...centralDataStore.users, ...data.users]
        }
        centralDataStore.lastUpdated = new Date().toISOString()

        return NextResponse.json({
          success: true,
          data: centralDataStore,
          synced: {
            firearms: data.firearms?.length || 0,
            inspections: data.inspections?.length || 0,
            users: data.users?.length || 0,
          },
        })

      case "restore":
        centralDataStore = {
          ...data,
          lastUpdated: new Date().toISOString(),
        }

        return NextResponse.json({
          success: true,
          restored: {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          },
        })

      case "clear_inspections":
        const clearedCount = centralDataStore.inspections.length
        centralDataStore.inspections = []
        centralDataStore.lastUpdated = new Date().toISOString()

        return NextResponse.json({
          success: true,
          cleared: clearedCount,
        })

      case "bulk_update_inspection_status":
        const { status, inspectionIds } = data
        let updatedCount = 0

        if (inspectionIds && inspectionIds.length > 0) {
          // Update specific inspections
          centralDataStore.inspections = centralDataStore.inspections.map((inspection: any) => {
            if (inspectionIds.includes(inspection.id)) {
              updatedCount++
              return {
                ...inspection,
                status,
                updatedAt: new Date().toISOString(),
              }
            }
            return inspection
          })
        } else {
          // Update all inspections
          updatedCount = centralDataStore.inspections.length
          centralDataStore.inspections = centralDataStore.inspections.map((inspection: any) => ({
            ...inspection,
            status,
            updatedAt: new Date().toISOString(),
          }))
        }

        centralDataStore.lastUpdated = new Date().toISOString()

        return NextResponse.json({
          success: true,
          updated: updatedCount,
          status,
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data migration POST:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
