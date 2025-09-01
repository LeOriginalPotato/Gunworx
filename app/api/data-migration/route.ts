import { type NextRequest, NextResponse } from "next/server"

// Central data store that persists across requests
let centralDataStore = {
  firearms: [] as any[],
  inspections: [] as any[],
  users: [
    {
      id: "admin_001",
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      email: "admin@gunworx.com",
      createdAt: new Date().toISOString(),
    },
    {
      id: "manager_001",
      username: "manager",
      password: "manager123",
      role: "manager",
      fullName: "Operations Manager",
      email: "manager@gunworx.com",
      createdAt: new Date().toISOString(),
    },
    {
      id: "inspector_001",
      username: "inspector",
      password: "inspector123",
      role: "inspector",
      fullName: "Lead Inspector",
      email: "inspector@gunworx.com",
      createdAt: new Date().toISOString(),
    },
    {
      id: "dymian_001",
      username: "dymian",
      password: "dymian123",
      role: "admin",
      fullName: "Dymian Administrator",
      email: "dymian@gunworx.com",
      createdAt: new Date().toISOString(),
    },
  ],
}

// Export function to get central data store
export function getCentralDataStore() {
  return centralDataStore
}

// Export function to update data in central store
export function updateInDataStore(type: string, id: string, data: any) {
  const collection = centralDataStore[type as keyof typeof centralDataStore] as any[]
  const index = collection.findIndex((item) => item.id === id)

  if (index !== -1) {
    // Merge the existing data with new data, ensuring we keep the ID
    collection[index] = {
      ...collection[index],
      ...data,
      id: id, // Ensure ID is preserved
      updatedAt: new Date().toISOString(),
    }
    console.log(`✅ Updated ${type} item with ID: ${id}`)
    return collection[index]
  }

  console.log(`❌ Item not found in ${type} with ID: ${id}`)
  return null
}

// Export function to delete data from central store
export function deleteFromDataStore(type: string, id: string) {
  const collection = centralDataStore[type as keyof typeof centralDataStore] as any[]
  const index = collection.findIndex((item) => item.id === id)

  if (index !== -1) {
    const deletedItem = collection.splice(index, 1)[0]
    console.log(`🗑️ Deleted ${type} item with ID: ${id}`)
    return deletedItem
  }

  console.log(`❌ Item not found in ${type} with ID: ${id}`)
  return null
}

// Export function to add data to central store
export function addToDataStore(type: string, data: any) {
  const collection = centralDataStore[type as keyof typeof centralDataStore] as any[]
  const newItem = {
    ...data,
    id: data.id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  collection.push(newItem)
  console.log(`✅ Added new ${type} item with ID: ${newItem.id}`)
  return newItem
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const type = searchParams.get("type")

  try {
    if (action === "backup") {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        data: centralDataStore,
      })
    }

    if (action === "status") {
      return NextResponse.json({
        status: "online",
        timestamp: new Date().toISOString(),
        counts: {
          firearms: centralDataStore.firearms.length,
          inspections: centralDataStore.inspections.length,
          users: centralDataStore.users.length,
        },
      })
    }

    if (type) {
      const data = centralDataStore[type as keyof typeof centralDataStore] || []
      return NextResponse.json({ [type]: data })
    }

    return NextResponse.json({ data: centralDataStore })
  } catch (error) {
    console.error("Error in GET /api/data-migration:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data, type } = body

    if (action === "sync") {
      // Merge incoming data with existing data
      if (data.firearms) {
        // Merge firearms - prioritize server data but keep any new local items
        const existingIds = new Set(centralDataStore.firearms.map((f) => f.id))
        const newFirearms = data.firearms.filter((f: any) => !existingIds.has(f.id))
        centralDataStore.firearms.push(...newFirearms)
      }

      if (data.inspections) {
        // Merge inspections - prioritize server data but keep any new local items
        const existingIds = new Set(centralDataStore.inspections.map((i) => i.id))
        const newInspections = data.inspections.filter((i: any) => !existingIds.has(i.id))
        centralDataStore.inspections.push(...newInspections)
      }

      if (data.users) {
        // Merge users - prioritize server data but keep any new local items
        const existingIds = new Set(centralDataStore.users.map((u) => u.id))
        const newUsers = data.users.filter((u: any) => !existingIds.has(u.id))
        centralDataStore.users.push(...newUsers)
      }

      return NextResponse.json({
        success: true,
        data: centralDataStore,
        synced: {
          firearms: centralDataStore.firearms.length,
          inspections: centralDataStore.inspections.length,
          users: centralDataStore.users.length,
        },
      })
    }

    if (action === "restore") {
      // Restore from backup - completely replace current data
      if (data && data.data) {
        centralDataStore = {
          firearms: data.data.firearms || [],
          inspections: data.data.inspections || [],
          users: data.data.users || centralDataStore.users, // Keep existing users if not in backup
        }
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

    if (action === "clear_inspections") {
      const clearedCount = centralDataStore.inspections.length
      centralDataStore.inspections = []

      return NextResponse.json({
        success: true,
        cleared: clearedCount,
        message: "All inspections cleared successfully",
      })
    }

    if (type && data) {
      // Add new item to specified collection
      const newItem = addToDataStore(type, data)
      return NextResponse.json({ success: true, [type.slice(0, -1)]: newItem })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Error in POST /api/data-migration:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, data } = body

    if (!type || !id || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedItem = updateInDataStore(type, id, data)

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      [type.slice(0, -1)]: updatedItem,
    })
  } catch (error) {
    console.error("Error in PUT /api/data-migration:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")
  const action = searchParams.get("action")

  try {
    if (action === "clear" && type === "inspections") {
      const clearedCount = centralDataStore.inspections.length
      centralDataStore.inspections = []

      return NextResponse.json({
        success: true,
        cleared: clearedCount,
      })
    }

    if (!type || !id) {
      return NextResponse.json({ error: "Missing type or id parameter" }, { status: 400 })
    }

    const deletedItem = deleteFromDataStore(type, id)

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `${type.slice(0, -1)} deleted successfully`,
    })
  } catch (error) {
    console.error("Error in DELETE /api/data-migration:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
