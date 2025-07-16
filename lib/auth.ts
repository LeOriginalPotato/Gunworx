export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
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
    if (typeof window === "undefined") return

    const existingUsers = localStorage.getItem(this.USERS_KEY)
    if (!existingUsers) {
      const defaultUsers: User[] = [
        {
          id: "1",
          username: "admin",
          password: "admin123",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          username: "JP",
          password: "JP123",
          role: "user",
          createdAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers))
    }
  }

  login(username: string, password: string): User | null {
    if (typeof window === "undefined") return null

    const users = this.getUsers()
    const user = users.find((u) => u.username === username && u.password === password)

    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() }
      this.updateUser(updatedUser)
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

  getUsers(): User[] {
    if (typeof window === "undefined") return []

    const usersStr = localStorage.getItem(this.USERS_KEY)
    return usersStr ? JSON.parse(usersStr) : []
  }

  createUser(userData: Omit<User, "id" | "createdAt">): User {
    if (typeof window === "undefined") throw new Error("Cannot create user on server side")

    const users = this.getUsers()
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    return newUser
  }

  updateUser(userData: User): void {
    if (typeof window === "undefined") return

    const users = this.getUsers()
    const index = users.findIndex((u) => u.id === userData.id)

    if (index !== -1) {
      users[index] = userData
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    }
  }

  deleteUser(userId: string): void {
    if (typeof window === "undefined") return

    const users = this.getUsers()
    const filteredUsers = users.filter((u) => u.id !== userId)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers))
  }

  userExists(username: string): boolean {
    if (typeof window === "undefined") return false

    const users = this.getUsers()
    return users.some((u) => u.username === username)
  }
}

export const authService = new AuthService()
