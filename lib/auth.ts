export interface User {
  id: string
  username: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
}

const API_BASE_URL = typeof window !== "undefined" ? window.location.origin : ""
const CURRENT_USER_KEY = "gunworx_current_user"

// Default system admin (hidden from UI)
const SYSTEM_ADMIN: User = {
  id: "system_admin",
  username: "Jean-Mari",
  role: "admin",
  createdAt: new Date().toISOString(),
}

// Default password for system admin
const SYSTEM_ADMIN_PASSWORD = "Password123"

class AuthService {
  private users: Map<string, { user: User; password: string }> = new Map()
  private initialized = false
  private syncCallbacks: (() => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private async initialize() {
    if (this.initialized) return

    try {
      await this.loadUsersFromServer()
      // Always ensure system admin exists
      this.users.set(SYSTEM_ADMIN.username, {
        user: SYSTEM_ADMIN,
        password: SYSTEM_ADMIN_PASSWORD,
      })
      this.initialized = true
    } catch (error) {
      console.error("Failed to initialize auth service:", error)
      // Initialize with just system admin if loading fails
      this.users.clear()
      this.users.set(SYSTEM_ADMIN.username, {
        user: SYSTEM_ADMIN,
        password: SYSTEM_ADMIN_PASSWORD,
      })
      this.initialized = true
    }
  }

  private async loadUsersFromServer() {
    if (typeof window === "undefined") return

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        this.users.clear()
        Object.entries(userData).forEach(([username, data]: [string, any]) => {
          if (data && data.user && data.password) {
            this.users.set(username, data)
          }
        })
      }
    } catch (error) {
      console.warn("Failed to load users from server:", error)
      // Try to load from localStorage as fallback
      this.loadUsersFromLocalStorage()
    }
  }

  private loadUsersFromLocalStorage() {
    if (typeof window === "undefined") return

    try {
      const saved = localStorage.getItem("gunworx_users")
      if (saved) {
        const userData = JSON.parse(saved)
        if (userData && typeof userData === "object") {
          this.users.clear()
          Object.entries(userData).forEach(([username, data]: [string, any]) => {
            if (data && data.user && data.password) {
              this.users.set(username, data)
            }
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load users from localStorage:", error)
    }
  }

  private async saveUsersToServer() {
    if (typeof window === "undefined") return

    try {
      const userData: Record<string, { user: User; password: string }> = {}
      this.users.forEach((data, username) => {
        userData[username] = data
      })

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem("gunworx_users", JSON.stringify(userData))

        // Trigger sync callbacks
        this.syncCallbacks.forEach((callback) => {
          try {
            callback()
          } catch (error) {
            console.warn("Sync callback error:", error)
          }
        })
      } else {
        throw new Error("Failed to save to server")
      }
    } catch (error) {
      console.warn("Failed to save users to server:", error)
      // Fallback to localStorage
      const userData: Record<string, { user: User; password: string }> = {}
      this.users.forEach((data, username) => {
        userData[username] = data
      })
      localStorage.setItem("gunworx_users", JSON.stringify(userData))
    }
  }

  // Register callback for sync events
  onSync(callback: () => void) {
    this.syncCallbacks.push(callback)
    return () => {
      const index = this.syncCallbacks.indexOf(callback)
      if (index > -1) {
        this.syncCallbacks.splice(index, 1)
      }
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }

    const userData = this.users.get(username)
    if (userData && userData.password === password) {
      const user = {
        ...userData.user,
        lastLogin: new Date().toISOString(),
      }
      this.users.set(username, { ...userData, user })
      await this.saveUsersToServer()
      this.setCurrentUser(user)
      return user
    }
    return null
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  setCurrentUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    }
  }

  async createUser(username: string, password: string, role: "admin" | "user" = "user"): Promise<User> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }

    if (this.users.has(username)) {
      throw new Error("Username already exists")
    }

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      role,
      createdAt: new Date().toISOString(),
    }

    this.users.set(username, { user, password })
    await this.saveUsersToServer()
    return user
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }

    for (const [username, userData] of this.users.entries()) {
      if (userData.user.id === userId) {
        const updatedUser = { ...userData.user, ...updates }

        // If username is being updated, we need to update the map key
        if (updates.username && updates.username !== username) {
          this.users.delete(username)
          this.users.set(updates.username, { ...userData, user: updatedUser })
        } else {
          this.users.set(username, { ...userData, user: updatedUser })
        }

        await this.saveUsersToServer()
        return updatedUser
      }
    }
    throw new Error("User not found")
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }

    for (const [username, userData] of this.users.entries()) {
      if (userData.user.id === userId) {
        this.users.set(username, { ...userData, password: newPassword })
        await this.saveUsersToServer()
        return
      }
    }
    throw new Error("User not found")
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }

    // Prevent deletion of system admin
    if (userId === SYSTEM_ADMIN.id) {
      throw new Error("Cannot delete system administrator")
    }

    for (const [username, userData] of this.users.entries()) {
      if (userData.user.id === userId) {
        this.users.delete(username)
        await this.saveUsersToServer()
        return
      }
    }
    throw new Error("User not found")
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }

    try {
      // Always reload from server to get latest data
      await this.loadUsersFromServer()
      this.users.set(SYSTEM_ADMIN.username, {
        user: SYSTEM_ADMIN,
        password: SYSTEM_ADMIN_PASSWORD,
      })

      // Return ALL users including those created by admin, but filter out system admin
      return Array.from(this.users.values())
        .map((data) => data.user)
        .filter((user) => user.id !== SYSTEM_ADMIN.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error("Error getting all users:", error)
      return []
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }

    for (const userData of this.users.values()) {
      if (userData.user.id === userId) {
        return userData.user
      }
    }
    return null
  }

  // Method to check if service is ready
  isReady(): boolean {
    return this.initialized
  }

  // Method to get user count safely
  async getUserCount(): Promise<number> {
    if (!this.initialized && typeof window !== "undefined") {
      await this.initialize()
    }
    return this.users.size - 1 // Subtract 1 for system admin
  }

  // Method to force refresh users from server
  async refreshUsers(): Promise<User[]> {
    if (typeof window !== "undefined") {
      await this.loadUsersFromServer()
      // Always ensure system admin exists after refresh
      this.users.set(SYSTEM_ADMIN.username, {
        user: SYSTEM_ADMIN,
        password: SYSTEM_ADMIN_PASSWORD,
      })
    }
    return this.getAllUsers()
  }

  // Method to force sync across all instances
  async forceSync() {
    if (typeof window !== "undefined") {
      await this.saveUsersToServer()
    }
  }
}

export const authService = new AuthService()
