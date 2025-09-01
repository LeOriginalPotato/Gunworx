import { type NextRequest, NextResponse } from "next/server"

// In-memory data store (in production, this would be a database)
let centralDataStore = {
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
      fullName: "Wikus Fourie",
      email: "wikus@gunworx.com",
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
}

export function getCentralDataStore() {
  return centralDataStore
}

export function updateCentralDataStore(newData: any) {
  if (newData.firearms) centralDataStore.firearms = newData.firearms
  if (newData.inspections) centralDataStore.inspections = newData.inspections
  if (newData.users) centralDataStore.users = newData.users
  return centralDataStore
}

export function addToDataStore(type: string, item: any) {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const newItem = {
    ...item,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  switch (type) {
    case "firearms":
      centralDataStore.firearms.push(newItem)
      break
    case "inspections":
      centralDataStore.inspections.push(newItem)
      break
    case "users":
      centralDataStore.users.push(newItem)
      break
  }

  return newItem
}

export function updateInDataStore(type: string, id: string, updates: any) {
  let collection: any[] = []

  switch (type) {
    case "firearms":
      collection = centralDataStore.firearms
      break
    case "inspections":
      collection = centralDataStore.inspections
      break
    case "users":
      collection = centralDataStore.users
      break
    default:
      return null
  }

  const index = collection.findIndex((item) => item.id === id)
  if (index !== -1) {
    collection[index] = {
      ...collection[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return collection[index]
  }
  return null
}

export function deleteFromDataStore(type: string, id: string) {
  switch (type) {
    case "firearms":
      centralDataStore.firearms = centralDataStore.firearms.filter((item) => item.id !== id)
      break
    case "inspections":
      centralDataStore.inspections = centralDataStore.inspections.filter((item) => item.id !== id)
      break
    case "users":
      centralDataStore.users = centralDataStore.users.filter((item) => item.id !== id)
      break
  }
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
        return NextResponse.json(centralDataStore)
    }
  } catch (error) {
    console.error("Error in data-migration GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
          data.firearms.forEach((firearm: any) => {
            const existingIndex = centralDataStore.firearms.findIndex((f) => f.id === firearm.id)
            if (existingIndex >= 0) {
              centralDataStore.firearms[existingIndex] = firearm
            } else {
              centralDataStore.firearms.push(firearm)
            }
          })
        }

        if (data.inspections) {
          data.inspections.forEach((inspection: any) => {
            const existingIndex = centralDataStore.inspections.findIndex((i) => i.id === inspection.id)
            if (existingIndex >= 0) {
              centralDataStore.inspections[existingIndex] = inspection
            } else {
              centralDataStore.inspections.push(inspection)
            }
          })
        }

        if (data.users) {
          data.users.forEach((user: any) => {
            const existingIndex = centralDataStore.users.findIndex((u) => u.id === user.id)
            if (existingIndex >= 0) {
              centralDataStore.users[existingIndex] = user
            } else {
              centralDataStore.users.push(user)
            }
          })
        }

        return NextResponse.json({
          success: true,
          synced: {
            firearms: data.firearms?.length || 0,
            inspections: data.inspections?.length || 0,
            users: data.users?.length || 0,
          },
          data: centralDataStore,
        })

      case "restore":
        centralDataStore = data
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
        return NextResponse.json({
          success: true,
          cleared: clearedCount,
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data-migration POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
