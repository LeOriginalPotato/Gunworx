export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
  isSystemAdmin?: boolean
}

class AuthService {
  private readonly STORAGE_KEY = "gunworx_current_user"
  private readonly USERS_KEY = "gunworx_users"
  private readonly API_ENDPOINT = "/api/users"

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeUsers()
    }
  }

  private async initializeUsers() {
    if (typeof window === "undefined") return

    try {
      // First try to get users from server
      const response = await fetch(this.API_ENDPOINT)
      if (response.ok) {
        const serverUsers = await response.json()
        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          localStorage.setItem(this.USERS_KEY, JSON.stringify(serverUsers))
          return
        }
      }
    } catch (error) {
      console.warn("Failed to fetch users from server, using localStorage fallback:", error)
    }

    // Fallback to localStorage or create default users
    const existingUsers = localStorage.getItem(this.USERS_KEY)
    if (!existingUsers) {
      const defaultUsers: User[] = [
        {
          id: "system_admin_001",
          username: "Jean-Mari",
          password: "Password123",
          role: "admin",
          createdAt: "2024-01-01T00:00:00.000Z",
          isSystemAdmin: true,
        },
        {
          id: "user_jp_admin_001",
          username: "JP",
          password: "xNgU7ADa",
          role: "admin",
          createdAt: "2024-01-15T10:30:00.000Z",
        },
        {
          id: "user_eben_001",
          username: "Eben",
          password: "UY9FBe8abajU",
          role: "user",
          createdAt: "2024-01-20T08:00:00.000Z",
        },
        {
          id: "user_francois_001",
          username: "Francois",
          password: "MnWbCkE4AcFP",
          role: "user",
          createdAt: "2024-01-20T08:15:00.000Z",
        },
        {
          id: "user_wikus_001",
          username: "Wikus",
          password: "Wikus@888",
          role: "admin",
          createdAt: "2024-01-20T08:30:00.000Z",
        },
      ]
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers))
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    if (typeof window === "undefined") return null

    const users = await this.getUsers()
    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() }
      await this.updateUser(updatedUser)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser))
      return updatedUser
    }

    return null
  }

  logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.STORAGE_KEY)
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const userStr = localStorage.getItem(this.STORAGE_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  async getUsers(): Promise<User[]> {
    if (typeof window === "undefined") return []

    try {
      // Try to get fresh data from server first
      const response = await fetch(this.API_ENDPOINT)
      if (response.ok) {
        const serverUsers = await response.json()
        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          // Update localStorage with server data
          localStorage.setItem(this.USERS_KEY, JSON.stringify(serverUsers))
          return serverUsers
        }
      }
    } catch (error) {
      console.warn("Failed to fetch users from server:", error)
    }

    // Fallback to localStorage
    try {
      const usersStr = localStorage.getItem(this.USERS_KEY)
      if (!usersStr) {
        await this.initializeUsers()
        const newUsersStr = localStorage.getItem(this.USERS_KEY)
        return newUsersStr ? JSON.parse(newUsersStr) : []
      }
      return JSON.parse(usersStr)
    } catch (error) {
      console.error("Error parsing users from localStorage:", error)
      await this.initializeUsers()
      const usersStr = localStorage.getItem(this.USERS_KEY)
      return usersStr ? JSON.parse(usersStr) : []
    }
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    if (typeof window === "undefined") throw new Error("Cannot create user on server side")

    const users = await this.getUsers()
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, newUser]

    // Save to server
    try {
      await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", user: newUser }),
      })
    } catch (error) {
      console.warn("Failed to save user to server:", error)
    }

    // Always save to localStorage as backup
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers))
    return newUser
  }

  async updateUser(userData: User): Promise<void> {
    if (typeof window === "undefined") return

    const users = await this.getUsers()
    const index = users.findIndex((u) => u.id === userData.id)

    if (index !== -1) {
      users[index] = userData

      // Save to server
      try {
        await fetch(this.API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", user: userData }),
        })
      } catch (error) {
        console.warn("Failed to update user on server:", error)
      }

      // Always save to localStorage as backup
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (typeof window === "undefined") return

    const users = await this.getUsers()
    const userToDelete = users.find((u) => u.id === userId)

    if (!userToDelete) return

    const filteredUsers = users.filter((u) => u.id !== userId)

    // Delete from server
    try {
      await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", user: { id: userId } }),
      })
    } catch (error) {
      console.warn("Failed to delete user from server:", error)
    }

    // Always save to localStorage as backup
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers))
  }

  async userExists(username: string): Promise<boolean> {
    if (typeof window === "undefined") return false

    const users = await this.getUsers()
    return users.some((u) => u.username === username)
  }
}

export const authService = new AuthService()
