import { type NextRequest, NextResponse } from "next/server"

// In-memory data store (in production, this would be a database)
let centralDataStore = {
  firearms: [] as any[],
  inspections: [] as any[],
  users: [] as any[],
  lastUpdated: new Date().toISOString(),
}

// Initialize with some default data if empty
if (centralDataStore.firearms.length === 0) {
  centralDataStore.firearms = []
}

if (centralDataStore.inspections.length === 0) {
  centralDataStore.inspections = []
}

if (centralDataStore.users.length === 0) {
  centralDataStore.users = [
    {
      id: "user_1",
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      email: "admin@gunworx.com",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "user_2",
      username: "inspector",
      password: "inspector123",
      role: "inspector",
      fullName: "John Inspector",
      email: "inspector@gunworx.com",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "user_3",
      username: "dymian",
      password: "dymian123",
      role: "user",
      fullName: "Dymian User",
      email: "dymian@gunworx.com",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ]
}

export function getCentralDataStore() {
  return centralDataStore
}

export function updateCentralDataStore(newData: any) {
  centralDataStore = {
    ...newData,
    lastUpdated: new Date().toISOString(),
  }
  console.log("📊 Central data store updated:", {
    firearms: centralDataStore.firearms.length,
    inspections: centralDataStore.inspections.length,
    users: centralDataStore.users.length,
  })
}

export function addToDataStore(type: "firearms" | "inspections" | "users", item: any) {
  try {
    const newItem = {
      ...item,
      id: item.id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    centralDataStore[type].push(newItem)
    centralDataStore.lastUpdated = new Date().toISOString()

    console.log(`✅ Added ${type} item:`, newItem.id)
    return newItem
  } catch (error) {
    console.error(`❌ Error adding ${type} item:`, error)
    return null
  }
}

export function updateInDataStore(type: "firearms" | "inspections" | "users", id: string, updates: any) {
  try {
    const items = centralDataStore[type]
    const index = items.findIndex((item: any) => item.id === id)

    if (index === -1) {
      console.error(`❌ Item not found for update: ${type}/${id}`)
      return null
    }

    const updatedItem = {
      ...items[index],
      ...updates,
      id: items[index].id, // Preserve original ID
      createdAt: items[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    }

    items[index] = updatedItem
    centralDataStore.lastUpdated = new Date().toISOString()

    console.log(`🔄 Updated ${type} item:`, updatedItem.id)
    return updatedItem
  } catch (error) {
    console.error(`❌ Error updating ${type} item:`, error)
    return null
  }
}

export function deleteFromDataStore(type: "firearms" | "inspections" | "users", id: string) {
  try {
    const items = centralDataStore[type]
    const index = items.findIndex((item: any) => item.id === id)

    if (index === -1) {
      console.error(`❌ Item not found for deletion: ${type}/${id}`)
      return false
    }

    items.splice(index, 1)
    centralDataStore.lastUpdated = new Date().toISOString()

    console.log(`🗑️ Deleted ${type} item:`, id)
    return true
  } catch (error) {
    console.error(`❌ Error deleting ${type} item:`, error)
    return false
  }
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
          backup: centralDataStore,
          timestamp: new Date().toISOString(),
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

    console.log("📥 Data migration POST request:", action)

    switch (action) {
      case "sync":
        // Merge incoming data with existing data
        if (data.firearms) {
          data.firearms.forEach((firearm: any) => {
            const existingIndex = centralDataStore.firearms.findIndex((f: any) => f.id === firearm.id)
            if (existingIndex >= 0) {
              centralDataStore.firearms[existingIndex] = firearm
            } else {
              centralDataStore.firearms.push(firearm)
            }
          })
        }

        if (data.inspections) {
          data.inspections.forEach((inspection: any) => {
            const existingIndex = centralDataStore.inspections.findIndex((i: any) => i.id === inspection.id)
            if (existingIndex >= 0) {
              centralDataStore.inspections[existingIndex] = inspection
            } else {
              centralDataStore.inspections.push(inspection)
            }
          })
        }

        if (data.users) {
          data.users.forEach((user: any) => {
            const existingIndex = centralDataStore.users.findIndex((u: any) => u.id === user.id)
            if (existingIndex >= 0) {
              centralDataStore.users[existingIndex] = user
            } else {
              centralDataStore.users.push(user)
            }
          })
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
        if (data && typeof data === "object") {
          centralDataStore = {
            firearms: data.firearms || [],
            inspections: data.inspections || [],
            users: data.users || centralDataStore.users, // Keep existing users if not provided
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
        }
        throw new Error("Invalid restore data")

      case "clear_inspections":
        const clearedCount = centralDataStore.inspections.length
        centralDataStore.inspections = []
        centralDataStore.lastUpdated = new Date().toISOString()

        return NextResponse.json({
          success: true,
          cleared: clearedCount,
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data migration POST:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
