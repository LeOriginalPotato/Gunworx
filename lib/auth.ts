export interface User {
  id: string
  username: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
}

const STORAGE_KEY = "gunworx_users"
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

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== "undefined") {
      this.initialize()
    }
  }

  private initialize() {
    if (this.initialized) return

    try {
      this.loadUsers()
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

  private loadUsers() {
    if (typeof window === "undefined") return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const userData = JSON.parse(saved)
        if (userData && typeof userData === "object") {
          Object.entries(userData).forEach(([username, data]: [string, any]) => {
            if (data && data.user && data.password) {
              this.users.set(username, data)
            }
          })
        }
      }
    } catch (error) {
      console.warn("Failed to load users from localStorage:", error)
      // Clear corrupted data
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }

  private saveUsers() {
    if (typeof window === "undefined") return

    try {
      const userData: Record<string, { user: User; password: string }> = {}
      this.users.forEach((data, username) => {
        userData[username] = data
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    } catch (error) {
      console.warn("Failed to save users to localStorage:", error)
    }
  }

  login(username: string, password: string): User | null {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
    }

    const userData = this.users.get(username)
    if (userData && userData.password === password) {
      const user = {
        ...userData.user,
        lastLogin: new Date().toISOString(),
      }
      this.users.set(username, { ...userData, user })
      this.saveUsers()
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

  createUser(username: string, password: string, role: "admin" | "user" = "user"): User {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
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
    this.saveUsers()
    return user
  }

  updateUser(userId: string, updates: Partial<User>): User {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
    }

    for (const [username, userData] of this.users.entries()) {
      if (userData.user.id === userId) {
        const updatedUser = { ...userData.user, ...updates }
        this.users.set(username, { ...userData, user: updatedUser })
        this.saveUsers()
        return updatedUser
      }
    }
    throw new Error("User not found")
  }

  updatePassword(userId: string, newPassword: string): void {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
    }

    for (const [username, userData] of this.users.entries()) {
      if (userData.user.id === userId) {
        this.users.set(username, { ...userData, password: newPassword })
        this.saveUsers()
        return
      }
    }
    throw new Error("User not found")
  }

  deleteUser(userId: string): void {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
    }

    // Prevent deletion of system admin
    if (userId === SYSTEM_ADMIN.id) {
      throw new Error("Cannot delete system administrator")
    }

    for (const [username, userData] of this.users.entries()) {
      if (userData.user.id === userId) {
        this.users.delete(username)
        this.saveUsers()
        return
      }
    }
    throw new Error("User not found")
  }

  getAllUsers(): User[] {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
    }

    try {
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

  getUserById(userId: string): User | null {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
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
  getUserCount(): number {
    if (!this.initialized && typeof window !== "undefined") {
      this.initialize()
    }
    return this.users.size - 1 // Subtract 1 for system admin
  }
}

export const authService = new AuthService()
