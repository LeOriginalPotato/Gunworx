// Enhanced data service that uses server APIs and handles data persistence
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

      const response = await fetch(`${this.baseUrl}/api/firearms?${params}`)
      if (!response.ok) throw new Error("Failed to fetch firearms")

      const data = await response.json()
      return data.firearms || []
    } catch (error) {
      console.error("Error fetching firearms:", error)
      // Fallback to localStorage if server fails
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

      // Also save to localStorage as backup
      this.saveToLocalStorage("firearms", data.firearm)

      return data.firearm
    } catch (error) {
      console.error("Error creating firearm:", error)
      // Fallback to localStorage
      return this.createInLocalStorage("gunworx_firearms", firearmData)
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

      // Also update localStorage as backup
      this.updateInLocalStorage("gunworx_firearms", id, data.firearm)

      return data.firearm
    } catch (error) {
      console.error("Error updating firearm:", error)
      // Fallback to localStorage
      return this.updateInLocalStorage("gunworx_firearms", id, firearmData)
    }
  }

  async deleteFirearm(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/firearms/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete firearm")

      // Also delete from localStorage
      this.deleteFromLocalStorage("gunworx_firearms", id)

      return true
    } catch (error) {
      console.error("Error deleting firearm:", error)
      // Fallback to localStorage
      return this.deleteFromLocalStorage("gunworx_firearms", id)
    }
  }

  // Inspections API methods
  async getInspections(filters: { search?: string } = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`${this.baseUrl}/api/inspections?${params}`)
      if (!response.ok) throw new Error("Failed to fetch inspections")

      const data = await response.json()
      return data.inspections || []
    } catch (error) {
      console.error("Error fetching inspections:", error)
      // Fallback to localStorage if server fails
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

      // Also save to localStorage as backup
      this.saveToLocalStorage("inspections", data.inspection)

      return data.inspection
    } catch (error) {
      console.error("Error creating inspection:", error)
      // Fallback to localStorage
      return this.createInLocalStorage("gunworx_inspections", inspectionData)
    }
  }

  async deleteInspection(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/inspections/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete inspection")

      // Also delete from localStorage
      this.deleteFromLocalStorage("gunworx_inspections", id)

      return true
    } catch (error) {
      console.error("Error deleting inspection:", error)
      // Fallback to localStorage
      return this.deleteFromLocalStorage("gunworx_inspections", id)
    }
  }

  // Data migration and synchronization
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
      console.log("Data synchronized:", result)

      return result
    } catch (error) {
      console.error("Error syncing data:", error)
      throw error
    }
  }

  async backupData() {
    try {
      const response = await fetch(`${this.baseUrl}/api/data-migration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backup" }),
      })

      if (!response.ok) throw new Error("Failed to backup data")

      const backup = await response.json()

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
      console.log("Data restored:", result)

      return result
    } catch (error) {
      console.error("Error restoring data:", error)
      throw error
    }
  }

  // localStorage helper methods
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
    existing.push(item)
    this.setToStorage(key, existing)
  }

  private createInLocalStorage(key: string, itemData: any) {
    const existing = this.getFromStorage(key) || []
    const newItem = {
      ...itemData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    existing.push(newItem)
    this.setToStorage(key, existing)
    return newItem
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
