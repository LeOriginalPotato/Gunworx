import { type NextRequest, NextResponse } from "next/server"

// File-based persistence for serverless environments
const DATA_FILE_KEY = "gunworx_persistent_data"

// Central data store with default users
const defaultDataStore = {
  firearms: [] as any[],
  inspections: [] as any[],
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

// In-memory cache
let centralDataStore = { ...defaultDataStore }

// Helper function to generate unique IDs
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Persistent storage functions using Vercel KV or fallback to memory
async function loadDataFromStorage() {
  try {
    // Try to load from Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const response = await fetch(`${process.env.KV_REST_API_URL}/get/${DATA_FILE_KEY}`, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.result) {
          const parsedData = JSON.parse(data.result)
          centralDataStore = { ...defaultDataStore, ...parsedData }
          console.log("📥 Data loaded from Vercel KV:", {
            firearms: centralDataStore.firearms.length,
            inspections: centralDataStore.inspections.length,
            users: centralDataStore.users.length,
          })
          return
        }
      }
    }

    // Fallback: try to load from environment variable or use default
    if (process.env.GUNWORX_DATA) {
      const parsedData = JSON.parse(process.env.GUNWORX_DATA)
      centralDataStore = { ...defaultDataStore, ...parsedData }
      console.log("📥 Data loaded from environment variable")
    } else {
      console.log("📥 Using default data store")
    }
  } catch (error) {
    console.error("❌ Error loading data from storage:", error)
    console.log("📥 Using default data store as fallback")
    centralDataStore = { ...defaultDataStore }
  }
}

async function saveDataToStorage() {
  try {
    const dataToSave = JSON.stringify(centralDataStore)

    // Try to save to Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const response = await fetch(`${process.env.KV_REST_API_URL}/set/${DATA_FILE_KEY}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: dataToSave }),
      })

      if (response.ok) {
        console.log("💾 Data saved to Vercel KV successfully")
        return
      } else {
        console.warn("⚠️ Failed to save to Vercel KV, status:", response.status)
      }
    }

    // Fallback: log data for manual persistence (in production, you might want to use a database)
    console.log("💾 Data persistence fallback - store this data:", {
      timestamp: new Date().toISOString(),
      counts: {
        firearms: centralDataStore.firearms.length,
        inspections: centralDataStore.inspections.length,
        users: centralDataStore.users.length,
      },
      // In a real production environment, you would save this to a database
      // For now, we'll keep it in memory and log for debugging
    })
  } catch (error) {
    console.error("❌ Error saving data to storage:", error)
  }
}

// Initialize data on module load
loadDataFromStorage()

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

  // Persist changes immediately
  saveDataToStorage()

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

  // Persist changes immediately
  saveDataToStorage()

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

  // Persist changes immediately
  saveDataToStorage()

  console.log(`🔄 Updated ${type} item with ID: ${id}`)
  return collection[index]
}

// Delete item from data store
export function deleteFromDataStore(type: string, id: string) {
  console.log(`🗑️ Server: Attempting to delete ${type} with ID: ${id}`)

  let collection: any[] = []
  let collectionName = ""

  if (type === "firearms") {
    collection = centralDataStore.firearms
    collectionName = "firearms"
  } else if (type === "inspections") {
    collection = centralDataStore.inspections
    collectionName = "inspections"
  } else if (type === "users") {
    collection = centralDataStore.users
    collectionName = "users"
  } else {
    console.error(`❌ Invalid data type: ${type}`)
    return false
  }

  const initialLength = collection.length
  const index = collection.findIndex((item) => item.id === id)

  if (index === -1) {
    console.error(`❌ Item not found for deletion: ${type} with ID ${id}`)
    return false
  }

  // Remove the item from the collection
  collection.splice(index, 1)

  // Update the central data store reference
  if (type === "firearms") {
    centralDataStore.firearms = collection
  } else if (type === "inspections") {
    centralDataStore.inspections = collection
  } else if (type === "users") {
    centralDataStore.users = collection
  }

  centralDataStore.lastUpdated = new Date().toISOString()

  // Persist changes immediately to ensure deletion is permanent
  saveDataToStorage()

  console.log(
    `✅ Server: Successfully deleted ${type} with ID: ${id}. Collection size: ${initialLength} -> ${collection.length}`,
  )
  console.log(`📊 Current ${collectionName} count: ${collection.length}`)

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
    // Ensure data is loaded from persistent storage
    await loadDataFromStorage()

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
    // Ensure data is loaded from persistent storage
    await loadDataFromStorage()

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

    if (action === "clear_inspections") {
      const clearedCount = centralDataStore.inspections.length
      centralDataStore.inspections = []
      centralDataStore.lastUpdated = new Date().toISOString()

      // Persist the clearing immediately
      await saveDataToStorage()

      console.log(`🧹 Cleared ${clearedCount} inspections from the system`)

      return NextResponse.json({
        success: true,
        cleared: clearedCount,
        message: `Cleared ${clearedCount} inspections permanently`,
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

      // Persist changes
      await saveDataToStorage()

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
