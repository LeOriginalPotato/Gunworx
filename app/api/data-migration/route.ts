import { type NextRequest, NextResponse } from "next/server"

// Central data store - this will be our in-memory database
let centralDataStore = {
  firearms: [] as any[],
  inspections: [] as any[],
  users: [] as any[],
  lastUpdated: new Date().toISOString(),
}

// Helper function to generate unique IDs
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get the central data store
export function getCentralDataStore() {
  return centralDataStore
}

// Update the entire central data store
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

// Add item to data store
export function addToDataStore(type: string, item: any) {
  const id = item.id || generateId()
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
  console.log(`✅ Added ${type} item with ID: ${id}`)
  return newItem
}

// Update item in data store
export function updateInDataStore(type: string, id: string, updates: any) {
  let collection: any[] = []

  if (type === "firearms") {
    collection = centralDataStore.firearms
  } else if (type === "inspections") {
    collection = centralDataStore.inspections
  } else if (type === "users") {
    collection = centralDataStore.users
  }

  const index = collection.findIndex((item) => item.id === id)
  if (index === -1) {
    console.error(`❌ Item not found for update: ${type} with ID ${id}`)
    return null
  }

  collection[index] = {
    ...collection[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  centralDataStore.lastUpdated = new Date().toISOString()
  console.log(`🔄 Updated ${type} item with ID: ${id}`)
  return collection[index]
}

// Delete item from data store
export function deleteFromDataStore(type: string, id: string) {
  let collection: any[] = []

  if (type === "firearms") {
    collection = centralDataStore.firearms
  } else if (type === "inspections") {
    collection = centralDataStore.inspections
  } else if (type === "users") {
    collection = centralDataStore.users
  }

  const initialLength = collection.length
  const index = collection.findIndex((item) => item.id === id)

  if (index === -1) {
    console.error(`❌ Item not found for deletion: ${type} with ID ${id}`)
    return false
  }

  // Remove the item from the collection
  collection.splice(index, 1)

  // Update the central data store
  if (type === "firearms") {
    centralDataStore.firearms = collection
  } else if (type === "inspections") {
    centralDataStore.inspections = collection
  } else if (type === "users") {
    centralDataStore.users = collection
  }

  centralDataStore.lastUpdated = new Date().toISOString()

  console.log(`🗑️ Deleted ${type} item with ID: ${id}. Collection size: ${initialLength} -> ${collection.length}`)
  return true
}

// Merge data from client with server data
function mergeData(serverData: any[], clientData: any[], type: string) {
  const merged = [...serverData]

  clientData.forEach((clientItem) => {
    const existingIndex = merged.findIndex((serverItem) => serverItem.id === clientItem.id)

    if (existingIndex >= 0) {
      // Update existing item if client version is newer
      const serverItem = merged[existingIndex]
      const clientUpdated = new Date(clientItem.updatedAt || clientItem.createdAt)
      const serverUpdated = new Date(serverItem.updatedAt || serverItem.createdAt)

      if (clientUpdated > serverUpdated) {
        merged[existingIndex] = clientItem
        console.log(`🔄 Updated ${type} from client:`, clientItem.id)
      }
    } else {
      // Add new item from client
      merged.push(clientItem)
      console.log(`➕ Added new ${type} from client:`, clientItem.id)
    }
  })

  return merged
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "status") {
      return NextResponse.json({
        status: "online",
        lastUpdated: centralDataStore.lastUpdated,
        counts: {
          firearms: centralDataStore.firearms.length,
          inspections: centralDataStore.inspections.length,
          users: centralDataStore.users.length,
        },
      })
    }

    if (action === "backup") {
      return NextResponse.json({
        success: true,
        data: centralDataStore,
        timestamp: new Date().toISOString(),
      })
    }

    // Default: return all data
    return NextResponse.json({
      success: true,
      data: centralDataStore,
    })
  } catch (error) {
    console.error("Error in data migration GET:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    console.log(`📥 Data migration POST request - Action: ${action}`)

    if (action === "sync") {
      // Merge client data with server data
      const mergedFirearms = mergeData(centralDataStore.firearms, data.firearms || [], "firearms")
      const mergedInspections = mergeData(centralDataStore.inspections, data.inspections || [], "inspections")
      const mergedUsers = mergeData(centralDataStore.users, data.users || [], "users")

      // Update central data store
      updateCentralDataStore({
        firearms: mergedFirearms,
        inspections: mergedInspections,
        users: mergedUsers,
      })

      return NextResponse.json({
        success: true,
        message: "Data synchronized successfully",
        data: centralDataStore,
      })
    }

    if (action === "restore") {
      // Restore from backup
      updateCentralDataStore(data)

      return NextResponse.json({
        success: true,
        message: "Data restored successfully",
        data: centralDataStore,
      })
    }

    if (action === "bulk_update_status") {
      const { status, inspectionIds } = data
      let updatedCount = 0

      if (inspectionIds && inspectionIds.length > 0) {
        // Update specific inspections
        inspectionIds.forEach((id: string) => {
          const updated = updateInDataStore("inspections", id, { status })
          if (updated) updatedCount++
        })
      } else {
        // Update all inspections
        centralDataStore.inspections.forEach((inspection) => {
          updateInDataStore("inspections", inspection.id, { status })
          updatedCount++
        })
      }

      return NextResponse.json({
        success: true,
        updated: updatedCount,
        message: `Updated ${updatedCount} inspections to status: ${status}`,
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Error in data migration POST:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
