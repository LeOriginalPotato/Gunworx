// Enhanced data service that uses centralized server APIs for cross-device/account synchronization
export class DataService {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  }

  // Firearms API methods
  async getFirearms(filters: { status?: string; search?: string } = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`${this.baseUrl}/api/firearms?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Ensure fresh data
        },
      })

      if (!response.ok) throw new Error("Failed to fetch firearms")

      const data = await response.json()
      console.log(`📡 Fetched ${data.firearms?.length || 0} firearms from server`)
      return data.firearms || []
    } catch (error) {
      console.error("Error fetching firearms:", error)
      // Fallback to localStorage only if server is completely unavailable
      return this.getFromStorage("gunworx_firearms") || []
    }
  }

  async createFirearm(firearmData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/firearms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firearmData),
      })

      if (!response.ok) throw new Error("Failed to create firearm")

      const data = await response.json()
      console.log(`✅ Created firearm on server:`, data.firearm.stockNo)

      // Also save to localStorage as backup
      this.saveToLocalStorage("firearms", data.firearm)

      return data.firearm
    } catch (error) {
      console.error("Error creating firearm:", error)
      throw error // Don't fallback for create operations - we want consistency
    }
  }

  async updateFirearm(id: string, firearmData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/firearms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firearmData),
      })

      if (!response.ok) throw new Error("Failed to update firearm")

      const data = await response.json()
      console.log(`🔄 Updated firearm on server:`, data.firearm.stockNo)

      // Also update localStorage as backup
      this.updateInLocalStorage("gunworx_firearms", id, data.firearm)

      return data.firearm
    } catch (error) {
      console.error("Error updating firearm:", error)
      throw error
    }
  }

  async deleteFirearm(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/firearms/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete firearm")

      console.log(`🗑️ Deleted firearm from server:`, id)

      // Also delete from localStorage
      this.deleteFromLocalStorage("gunworx_firearms", id)

      return true
    } catch (error) {
      console.error("Error deleting firearm:", error)
      throw error
    }
  }

  // Inspections API methods
  async getInspections(filters: { search?: string } = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`${this.baseUrl}/api/inspections?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Ensure fresh data
        },
      })

      if (!response.ok) throw new Error("Failed to fetch inspections")

      const data = await response.json()
      console.log(`📡 Fetched ${data.inspections?.length || 0} inspections from server`)
      return data.inspections || []
    } catch (error) {
      console.error("Error fetching inspections:", error)
      // Fallback to localStorage only if server is completely unavailable
      return this.getFromStorage("gunworx_inspections") || []
    }
  }

  async createInspection(inspectionData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspectionData),
      })

      if (!response.ok) throw new Error("Failed to create inspection")

      const data = await response.json()
      console.log(`✅ Created inspection on server:`, data.inspection.id)

      // Also save to localStorage as backup
      this.saveToLocalStorage("inspections", data.inspection)

      return data.inspection
    } catch (error) {
      console.error("Error creating inspection:", error)
      throw error // Don't fallback for create operations - we want consistency
    }
  }

  async deleteInspection(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/inspections/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete inspection")

      console.log(`🗑️ Deleted inspection from server:`, id)

      // Also delete from localStorage
      this.deleteFromLocalStorage("gunworx_inspections", id)

      return true
    } catch (error) {
      console.error("Error deleting inspection:", error)
      throw error
    }
  }

  // Users API methods
  async getUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Ensure fresh data
        },
      })

      if (!response.ok) throw new Error("Failed to fetch users")

      const data = await response.json()
      console.log(`📡 Fetched ${data.users?.length || 0} users from server`)
      return data.users || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  async authenticateUser(username: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid credentials")
        }
        throw new Error("Authentication failed")
      }

      const data = await response.json()
      console.log(`🔐 User authenticated:`, data.user.username)
      return data.user
    } catch (error) {
      console.error("Error authenticating user:", error)
      throw error
    }
  }

  // Data synchronization and migration
  async syncData() {
    try {
      // Get all local data
      const localData = {
        firearms: this.getFromStorage("gunworx_firearms") || [],
        inspections: this.getFromStorage("gunworx_inspections") || [],
        users: this.getFromStorage("gunworx_users") || [],
      }

      // Send to server for synchronization
      const response = await fetch(`${this.baseUrl}/api/data-migration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", data: localData }),
      })

      if (!response.ok) throw new Error("Failed to sync data")

      const result = await response.json()
      console.log("🔄 Data synchronized:", result)

      // Update local storage with the merged data
      if (result.data) {
        this.setToStorage("gunworx_firearms", result.data.firearms || [])
        this.setToStorage("gunworx_inspections", result.data.inspections || [])
        this.setToStorage("gunworx_users", result.data.users || [])
      }

      return result
    } catch (error) {
      console.error("Error syncing data:", error)
      throw error
    }
  }

  async backupData() {
    try {
      const response = await fetch(`${this.baseUrl}/api/data-migration?action=backup`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to backup data")

      const backup = await response.json()
      console.log("💾 Data backup created:", backup)

      // Save backup to localStorage
      localStorage.setItem("gunworx_backup", JSON.stringify(backup))

      return backup
    } catch (error) {
      console.error("Error backing up data:", error)
      throw error
    }
  }

  async restoreData(backupData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/data-migration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", data: backupData }),
      })

      if (!response.ok) throw new Error("Failed to restore data")

      const result = await response.json()
      console.log("📥 Data restored:", result)

      return result
    } catch (error) {
      console.error("Error restoring data:", error)
      throw error
    }
  }

  async getServerStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/data-migration?action=status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to get server status")

      const status = await response.json()
      return status
    } catch (error) {
      console.error("Error getting server status:", error)
      return { status: "offline", error: error.message }
    }
  }

  // Real-time data refresh
  async refreshAllData() {
    try {
      console.log("🔄 Refreshing all data from server...")

      const [firearms, inspections, users] = await Promise.all([
        this.getFirearms(),
        this.getInspections(),
        this.getUsers(),
      ])

      // Update local storage with fresh server data
      this.setToStorage("gunworx_firearms", firearms)
      this.setToStorage("gunworx_inspections", inspections)
      this.setToStorage("gunworx_users", users)

      console.log(`✅ Refreshed: ${firearms.length} firearms, ${inspections.length} inspections, ${users.length} users`)

      return { firearms, inspections, users }
    } catch (error) {
      console.error("Error refreshing data:", error)
      throw error
    }
  }

  // localStorage helper methods (for backup/offline functionality)
  private getFromStorage(key: string) {
    try {
      if (typeof window === "undefined") return null
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error)
      return null
    }
  }

  private setToStorage(key: string, data: any) {
    try {
      if (typeof window === "undefined") return false
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error)
      return false
    }
  }

  private saveToLocalStorage(type: string, item: any) {
    const key = `gunworx_${type}`
    const existing = this.getFromStorage(key) || []

    // Check if item already exists
    const existingIndex = existing.findIndex((existingItem: any) => existingItem.id === item.id)

    if (existingIndex >= 0) {
      existing[existingIndex] = item
    } else {
      existing.push(item)
    }

    this.setToStorage(key, existing)
  }

  private updateInLocalStorage(key: string, id: string, itemData: any) {
    const existing = this.getFromStorage(key) || []
    const index = existing.findIndex((item: any) => item.id === id)
    if (index !== -1) {
      existing[index] = { ...existing[index], ...itemData, updatedAt: new Date().toISOString() }
      this.setToStorage(key, existing)
      return existing[index]
    }
    return null
  }

  private deleteFromLocalStorage(key: string, id: string) {
    const existing = this.getFromStorage(key) || []
    const filtered = existing.filter((item: any) => item.id !== id)
    this.setToStorage(key, filtered)
    return true
  }
}

// Create singleton instance
export const dataService = new DataService()
