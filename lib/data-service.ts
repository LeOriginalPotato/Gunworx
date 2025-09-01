// Data service for managing firearms, inspections, and users
export interface Firearm {
  id: string
  manufacturer: string
  model: string
  serialNumber: string
  caliber: string
  type: string
  status: string
  location: string
  permitNumber?: string
  acquisitionDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Inspection {
  id: string
  inspectorName: string
  date: string
  firearmType: {
    manufacturer: string
    model: string
    caliber: string
    type: string
  }
  serialNumbers: {
    primary: string
    secondary?: string
    frame?: string
    barrel?: string
  }
  actionType: {
    action: string
    trigger: string
    safety: string
  }
  condition: {
    overall: string
    barrel: string
    action: string
    stock: string
    finish: string
  }
  measurements: {
    length: string
    weight: string
    barrelLength: string
  }
  compliance: {
    legal: boolean
    registered: boolean
    permitted: boolean
  }
  notes: string
  status: string
  category: string
  priority: string
  location: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username: string
  password: string
  role: string
  fullName: string
  email: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

class DataService {
  private baseUrl = "/api"

  // Firearms methods
  async getFirearms(): Promise<Firearm[]> {
    try {
      const response = await fetch(`${this.baseUrl}/firearms`)
      if (!response.ok) throw new Error("Failed to fetch firearms")
      const data = await response.json()
      return data.firearms || []
    } catch (error) {
      console.error("Error fetching firearms:", error)
      return []
    }
  }

  async createFirearm(firearm: Omit<Firearm, "id" | "createdAt" | "updatedAt">): Promise<Firearm | null> {
    try {
      const response = await fetch(`${this.baseUrl}/firearms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firearm),
      })
      if (!response.ok) throw new Error("Failed to create firearm")
      const data = await response.json()
      return data.firearm
    } catch (error) {
      console.error("Error creating firearm:", error)
      return null
    }
  }

  async updateFirearm(id: string, firearm: Partial<Firearm>): Promise<Firearm | null> {
    try {
      const response = await fetch(`${this.baseUrl}/firearms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firearm),
      })
      if (!response.ok) throw new Error("Failed to update firearm")
      const data = await response.json()
      return data.firearm
    } catch (error) {
      console.error("Error updating firearm:", error)
      return null
    }
  }

  async deleteFirearm(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/firearms/${id}`, {
        method: "DELETE",
      })
      return response.ok
    } catch (error) {
      console.error("Error deleting firearm:", error)
      return false
    }
  }

  // Inspections methods
  async getInspections(search?: string, category?: string): Promise<Inspection[]> {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (category) params.append("category", category)

      const response = await fetch(`${this.baseUrl}/inspections?${params}`)
      if (!response.ok) throw new Error("Failed to fetch inspections")
      const data = await response.json()
      return data.inspections || []
    } catch (error) {
      console.error("Error fetching inspections:", error)
      return []
    }
  }

  async createInspection(inspection: Omit<Inspection, "id" | "createdAt" | "updatedAt">): Promise<Inspection | null> {
    try {
      console.log("🔄 DataService: Creating inspection via API:", inspection)

      const response = await fetch(`${this.baseUrl}/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspection),
      })

      console.log("📡 API Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ API Error:", errorData)
        throw new Error(errorData.error || "Failed to create inspection")
      }

      const data = await response.json()
      console.log("✅ DataService: Inspection created successfully:", data.inspection?.id)
      return data.inspection
    } catch (error) {
      console.error("❌ DataService: Error creating inspection:", error)
      throw error
    }
  }

  async createInspectionDirect(inspectionData: any): Promise<Inspection | null> {
    try {
      console.log("🔄 DataService: Creating inspection directly:", inspectionData)

      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inspectionData),
      })

      console.log("📡 Direct API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Direct API Error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Direct API Success:", result)

      if (!result.success || !result.inspection) {
        throw new Error("Invalid response format")
      }

      return result.inspection
    } catch (error) {
      console.error("❌ DataService: Direct creation error:", error)
      throw error
    }
  }

  async updateInspection(id: string, inspection: Partial<Inspection>): Promise<Inspection | null> {
    try {
      const response = await fetch(`${this.baseUrl}/inspections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspection),
      })
      if (!response.ok) throw new Error("Failed to update inspection")
      const data = await response.json()
      return data.inspection
    } catch (error) {
      console.error("Error updating inspection:", error)
      return null
    }
  }

  async deleteInspection(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/inspections/${id}`, {
        method: "DELETE",
      })
      return response.ok
    } catch (error) {
      console.error("Error deleting inspection:", error)
      return false
    }
  }

  // Users methods
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users`)
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      return data.users || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  async createUser(user: Omit<User, "id" | "createdAt">): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
      if (!response.ok) throw new Error("Failed to create user")
      const data = await response.json()
      return data.user
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
      if (!response.ok) throw new Error("Failed to update user")
      const data = await response.json()
      return data.user
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`, {
        method: "DELETE",
      })
      return response.ok
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  // Data migration methods
  async syncData(data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/data-migration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync", data }),
      })
      if (!response.ok) throw new Error("Failed to sync data")
      return await response.json()
    } catch (error) {
      console.error("Error syncing data:", error)
      return null
    }
  }

  async getDataStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/data-migration?action=status`)
      if (!response.ok) throw new Error("Failed to get data status")
      return await response.json()
    } catch (error) {
      console.error("Error getting data status:", error)
      return null
    }
  }

  async backupData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/data-migration?action=backup`)
      if (!response.ok) throw new Error("Failed to backup data")
      return await response.json()
    } catch (error) {
      console.error("Error backing up data:", error)
      return null
    }
  }

  async restoreData(backupData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/data-migration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", data: backupData }),
      })
      if (!response.ok) throw new Error("Failed to restore data")
      return await response.json()
    } catch (error) {
      console.error("Error restoring data:", error)
      return null
    }
  }
}

export const dataService = new DataService()
