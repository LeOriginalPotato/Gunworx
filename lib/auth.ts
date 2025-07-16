export interface User {
  id: string
  username: string
  role: "admin" | "employee"
  fullName: string
  email: string
  createdAt: string
  lastLogin?: string
}

class AuthService {
  private readonly STORAGE_KEY = "gunworx_current_user"
  private readonly USERS_KEY = "gunworx_users"

  constructor() {
    this.initializeDefaultUsers()
  }

  private initializeDefaultUsers() {
    const existingUsers = this.getUsers()
    if (existingUsers.length === 0) {
      const defaultUsers: User[] = [
        {
          id: "admin-1",
          username: "jean-mari",
          role: "admin",
          fullName: "Jean-Mari",
          email: "admin@gunworx.com",
          createdAt: new Date().toISOString(),
        },
      ]

      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers))
    }
  }

  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY)
      return users ? JSON.parse(users) : []
    } catch {
      return []
    }
  }

  private saveUsers(users: User[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  login(username: string, password: string): User | null {
    const users = this.getUsers()

    // Simple authentication - in production, this would be properly hashed
    const user = users.find((u) => u.username === username)

    if (user) {
      // Update last login
      const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u))
      this.saveUsers(updatedUsers)

      // Store current user
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
      return user
    }

    return null
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(this.STORAGE_KEY)
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  }

  createUser(userData: Omit<User, "id" | "createdAt">): User {
    const users = this.getUsers()

    // Check if username already exists
    if (users.some((u) => u.username === userData.username)) {
      throw new Error("Username already exists")
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    this.saveUsers(users)

    return newUser
  }

  updateUser(userId: string, updates: Partial<User>): User {
    const users = this.getUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    // Check if username is being changed and if it already exists
    if (updates.username && updates.username !== users[userIndex].username) {
      if (users.some((u) => u.username === updates.username && u.id !== userId)) {
        throw new Error("Username already exists")
      }
    }

    users[userIndex] = { ...users[userIndex], ...updates }
    this.saveUsers(users)

    return users[userIndex]
  }

  deleteUser(userId: string): boolean {
    const users = this.getUsers()
    const filteredUsers = users.filter((u) => u.id !== userId)

    if (filteredUsers.length === users.length) {
      return false // User not found
    }

    this.saveUsers(filteredUsers)
    return true
  }

  getAllUsers(): User[] {
    return this.getUsers().filter((u) => u.username !== "jean-mari") // Hide default admin
  }

  isAdmin(user: User | null): boolean {
    return user?.role === "admin"
  }
}

export const authService = new AuthService()
