// Enhanced data service with automatic synchronization and centralized storage
export class DataService {
  private baseUrl: string
  private syncInterval: NodeJS.Timeout | null = null
  private isOnline = true
  private pendingOperations: Array<{ type: string; data: any; timestamp: number }> = []

  constructor() {
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    this.initializeAutoSync()
    this.setupOnlineStatusMonitoring()
  }

  // Initialize automatic synchronization
  private initializeAutoSync() {
    if (typeof window === "undefined") return

    // Auto-sync every 30 seconds
    this.syncInterval = setInterval(async () => {
      await this.performAutoSync()
    }, 30000)

    // Sync on page load
    setTimeout(() => {
      this.performAutoSync()
    }, 1000)

    // Sync before page unload
    window.addEventListener("beforeunload", () => {
      this.performAutoSync()
    })

    // Sync when coming back online
    window.addEventListener("online", () => {
      this.isOnline = true
      this.performAutoSync()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      console.log("📴 Gone offline - operations will be queued")
    })
  }

  // Setup online status monitoring
  private setupOnlineStatusMonitoring() {
    if (typeof window === "undefined") return

    this.isOnline = navigator.onLine

    window.addEventListener("online", () => {
      this.isOnline = true
      console.log("🌐 Back online - syncing data...")
      this.performAutoSync()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      console.log("📴 Gone offline - operations will be queued")
    })
  }

  // Perform automatic synchronization
  private async performAutoSync() {
    if (!this.isOnline) return

    try {
      // Process any pending operations first
      await this.processPendingOperations()

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

      // Update local storage with the merged data
      if (result.data) {
        this.setToStorage("gunworx_firearms", result.data.firearms || [])
        this.setToStorage("gunworx_inspections", result.data.inspections || [])
        this.setToStorage("gunworx_users", result.data.users || [])
      }

      console.log("🔄 Auto-sync completed:", {
        firearms: result.data?.firearms?.length || 0,
        inspections: result.data?.inspections?.length || 0,
        users: result.data?.users?.length || 0,
      })

      return result
    } catch (error) {
      console.error("Auto-sync failed:", error)
      // Don't throw error to avoid disrupting the app
    }
  }

  // Process pending operations when back online
  private async processPendingOperations() {
    if (this.pendingOperations.length === 0) return

    console.log(`📤 Processing ${this.pendingOperations.length} pending operations...`)

    for (const operation of this.pendingOperations) {
      try {
        switch (operation.type) {
          case "createFirearm":
            await this.createFirearmDirect(operation.data)
            break
          case "updateFirearm":
            await this.updateFirearmDirect(operation.data.id, operation.data)
            break
          case "deleteFirearm":
            await this.deleteFirearmDirect(operation.data.id)
            break
          case "createInspection":
            await this.createInspectionDirect(operation.data)
            break
          case "deleteInspection":
            await this.deleteInspectionDirect(operation.data.id)
            break
        }
      } catch (error) {
        console.error(`Failed to process pending operation:`, operation, error)
      }
    }

    // Clear processed operations
    this.pendingOperations = []
  }

  // Queue operation for later processing if offline
  private queueOperation(type: string, data: any) {
    this.pendingOperations.push({
      type,
      data,
      timestamp: Date.now(),
    })
    console.log(`📋 Queued operation: ${type}`)
  }

  // Firearms API methods with automatic sync
  async getFirearms(filters: { status?: string; search?: string } = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`${this.baseUrl}/api/firearms?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch firearms")

      const data = await response.json()

      // Update local storage with fresh server data
      this.setToStorage("gunworx_firearms", data.firearms || [])

      console.log(`📡 Fetched ${data.firearms?.length || 0} firearms from server`)
      return data.firearms || []
    } catch (error) {
      console.error("Error fetching firearms:", error)
      // Return cached data if server unavailable
      return this.getFromStorage("gunworx_firearms") || []
    }
  }

  async createFirearm(firearmData: any) {
    if (!this.isOnline) {
      // Save locally and queue for sync
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const firearmWithTempId = {
        ...firearmData,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pendingSync: true,
      }

      this.saveToLocalStorage("firearms", firearmWithTempId)
      this.queueOperation("createFirearm", firearmData)

      return firearmWithTempId
    }

    return this.createFirearmDirect(firearmData)
  }

  private async createFirearmDirect(firearmData: any) {
    const response = await fetch(`${this.baseUrl}/api/firearms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firearmData),
    })

    if (!response.ok) throw new Error("Failed to create firearm")

    const data = await response.json()
    console.log(`✅ Created firearm on server:`, data.firearm.stockNo)

    // Update local storage immediately
    this.saveToLocalStorage("firearms", data.firearm)

    return data.firearm
  }

  async updateFirearm(id: string, firearmData: any) {
    if (!this.isOnline) {
      // Update locally and queue for sync
      this.updateInLocalStorage("gunworx_firearms", id, { ...firearmData, _pendingSync: true })
      this.queueOperation("updateFirearm", { id, ...firearmData })

      return { ...firearmData, id, updatedAt: new Date().toISOString() }
    }

    return this.updateFirearmDirect(id, firearmData)
  }

  private async updateFirearmDirect(id: string, firearmData: any) {
    const response = await fetch(`${this.baseUrl}/api/firearms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firearmData),
    })

    if (!response.ok) throw new Error("Failed to update firearm")

    const data = await response.json()
    console.log(`🔄 Updated firearm on server:`, data.firearm.stockNo)

    // Update local storage immediately
    this.updateInLocalStorage("gunworx_firearms", id, data.firearm)

    return data.firearm
  }

  async deleteFirearm(id: string) {
    if (!this.isOnline) {
      // Mark as deleted locally and queue for sync
      this.markAsDeletedInLocalStorage("gunworx_firearms", id)
      this.queueOperation("deleteFirearm", { id })

      return true
    }

    return this.deleteFirearmDirect(id)
  }

  private async deleteFirearmDirect(id: string) {
    const response = await fetch(`${this.baseUrl}/api/firearms/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete firearm")

    console.log(`🗑️ Deleted firearm from server:`, id)

    // Remove from local storage immediately
    this.deleteFromLocalStorage("gunworx_firearms", id)

    return true
  }

  // Inspections API methods with enhanced search including serial numbers
  async getInspections(filters: { search?: string } = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`${this.baseUrl}/api/inspections?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch inspections")

      const data = await response.json()

      // Update local storage with fresh server data
      this.setToStorage("gunworx_inspections", data.inspections || [])

      console.log(`📡 Fetched ${data.inspections?.length || 0} inspections from server`)

      // If search term provided, log what fields were searched
      if (filters.search) {
        console.log(`🔍 Searched inspections for: "${filters.search}" - found ${data.inspections?.length || 0} results`)
        console.log(
          "🔍 Search includes: inspector, company, make, serial numbers (barrel, frame, receiver), caliber, and all other fields",
        )
      }

      return data.inspections || []
    } catch (error) {
      console.error("Error fetching inspections:", error)
      // Return cached data if server unavailable
      const cachedInspections = this.getFromStorage("gunworx_inspections") || []

      // If we have a search term and cached data, perform client-side search
      if (filters.search && cachedInspections.length > 0) {
        const searchTerm = filters.search.toLowerCase()
        const filteredInspections = cachedInspections.filter((inspection: any) => {
          // Search in basic fields
          const basicFieldsMatch = [
            inspection.inspector,
            inspection.inspectorId,
            inspection.companyName,
            inspection.dealerCode,
            inspection.caliber,
            inspection.cartridgeCode,
            inspection.make,
            inspection.countryOfOrigin,
            inspection.observations,
            inspection.comments,
            inspection.inspectorTitle,
            inspection.status,
            inspection.date,
          ].some((value) => value && value.toString().toLowerCase().includes(searchTerm))

          // Search in serial numbers
          const serialNumbersMatch =
            inspection.serialNumbers &&
            [
              inspection.serialNumbers.barrel,
              inspection.serialNumbers.barrelMake,
              inspection.serialNumbers.frame,
              inspection.serialNumbers.frameMake,
              inspection.serialNumbers.receiver,
              inspection.serialNumbers.receiverMake,
            ].some((value) => value && value.toString().toLowerCase().includes(searchTerm))

          return basicFieldsMatch || serialNumbersMatch
        })

        console.log(`🔍 Client-side search for "${filters.search}" found ${filteredInspections.length} results`)
        return filteredInspections
      }

      return cachedInspections
    }
  }

  async createInspection(inspectionData: any) {
    if (!this.isOnline) {
      // Save locally and queue for sync
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const inspectionWithTempId = {
        ...inspectionData,
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pendingSync: true,
      }

      this.saveToLocalStorage("inspections", inspectionWithTempId)
      this.queueOperation("createInspection", inspectionData)

      return inspectionWithTempId
    }

    return this.createInspectionDirect(inspectionData)
  }

  private async createInspectionDirect(inspectionData: any) {
    console.log("🚀 Creating inspection via API:", inspectionData)

    const response = await fetch(`${this.baseUrl}/api/inspections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inspectionData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("❌ API Error:", errorData)
      throw new Error(errorData.error || "Failed to create inspection")
    }

    const data = await response.json()
    console.log(`✅ Created inspection on server:`, data.inspection.id)

    // Update local storage immediately
    this.saveToLocalStorage("inspections", data.inspection)

    return data.inspection
  }

  async deleteInspection(id: string) {
    if (!this.isOnline) {
      // Mark as deleted locally and queue for sync
      this.markAsDeletedInLocalStorage("gunworx_inspections", id)
      this.queueOperation("deleteInspection", { id })

      return true
    }

    return this.deleteInspectionDirect(id)
  }

  private async deleteInspectionDirect(id: string) {
    const response = await fetch(`${this.baseUrl}/api/inspections/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete inspection")

    console.log(`🗑️ Deleted inspection from server:`, id)

    // Remove from local storage immediately
    this.deleteFromLocalStorage("gunworx_inspections", id)

    return true
  }

  // Users API methods
  async getUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) throw new Error("Failed to fetch users")

      const data = await response.json()

      // Update local storage with fresh server data
      this.setToStorage("gunworx_users", data.users || [])

      console.log(`📡 Fetched ${data.users?.length || 0} users from server`)
      return data.users || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return this.getFromStorage("gunworx_users") || []
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

  // Manual sync methods (for backward compatibility)
  async syncData() {
    return this.performAutoSync()
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

      console.log(`✅ Refreshed: ${firearms.length} firearms, ${inspections.length} inspections, ${users.length} users`)

      return { firearms, inspections, users }
    } catch (error) {
      console.error("Error refreshing data:", error)

      // Return cached data if server unavailable
      return {
        firearms: this.getFromStorage("gunworx_firearms") || [],
        inspections: this.getFromStorage("gunworx_inspections") || [],
        users: this.getFromStorage("gunworx_users") || [],
      }
    }
  }

  // Cleanup method
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }

  // localStorage helper methods
  getFromStorage(key: string) {
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

  private markAsDeletedInLocalStorage(key: string, id: string) {
    const existing = this.getFromStorage(key) || []
    const index = existing.findIndex((item: any) => item.id === id)
    if (index !== -1) {
      existing[index]._deleted = true
      existing[index]._pendingSync = true
      this.setToStorage(key, existing)
    }
  }
}

// Create singleton instance
export const dataService = new DataService()
