export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  isSystemAdmin?: boolean
  createdAt: string
  lastLogin?: string
}

class AuthService {
  private users: User[] = [
    {
      id: "1",
      username: "Jean-Mari",
      password: "Foktogbokka",
      role: "admin",
      isSystemAdmin: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      username: "Jean",
      password: "xNgU7ADa",
      role: "admin",
      isSystemAdmin: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      username: "Eben",
      password: "UY9FBe8abajU",
      role: "user",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "4",
      username: "Francois",
      password: "MnWbCkE4AcFP",
      role: "user",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "5",
      username: "Wikus",
      password: "Wikus@888",
      role: "admin",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ]

  private currentUser: User | null = null
  private isClient = typeof window !== "undefined"

  constructor() {
    if (this.isClient) {
      this.initializeFromStorage()
    }
  }

  private initializeFromStorage() {
    if (!this.isClient) return

    // Load users from localStorage if available
    const savedUsers = localStorage.getItem("gunworx_users")
    if (savedUsers) {
      try {
        this.users = JSON.parse(savedUsers)
      } catch (error) {
        console.error("Failed to load users from localStorage:", error)
      }
    }

    // Check for existing session
    const savedUser = localStorage.getItem("gunworx_current_user")
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser)
      } catch (error) {
        console.error("Failed to load current user from localStorage:", error)
      }
    }
  }

  private saveUsers() {
    if (!this.isClient) return
    localStorage.setItem("gunworx_users", JSON.stringify(this.users))
  }

  private saveCurrentUser() {
    if (!this.isClient) return

    if (this.currentUser) {
      localStorage.setItem("gunworx_current_user", JSON.stringify(this.currentUser))
    } else {
      localStorage.removeItem("gunworx_current_user")
    }
  }

  login(username: string, password: string): User | null {
    const user = this.users.find((u) => u.username === username && u.password === password)
    if (user) {
      this.currentUser = { ...user, lastLogin: new Date().toISOString() }
      this.saveCurrentUser()
      // Update user's last login in the users array
      const userIndex = this.users.findIndex((u) => u.id === user.id)
      if (userIndex !== -1) {
        this.users[userIndex].lastLogin = this.currentUser.lastLogin
        this.saveUsers()
      }
      return this.currentUser
    }
    return null
  }

  logout() {
    this.currentUser = null
    this.saveCurrentUser()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getAllUsers(): User[] {
    return this.users.map((user) => ({ ...user, password: "***" })) // Don't expose passwords
  }

  createUser(userData: Omit<User, "id" | "createdAt">): User {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.users.push(newUser)
    this.saveUsers()
    return { ...newUser, password: "***" }
  }

  updateUser(userId: string, updates: Partial<Omit<User, "id" | "createdAt">>): User | null {
    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) return null

    this.users[userIndex] = { ...this.users[userIndex], ...updates }
    this.saveUsers()

    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = { ...this.currentUser, ...updates }
      this.saveCurrentUser()
    }

    return { ...this.users[userIndex], password: "***" }
  }

  deleteUser(userId: string): boolean {
    // Prevent deletion of system admin
    const user = this.users.find((u) => u.id === userId)
    if (user?.isSystemAdmin) return false

    const initialLength = this.users.length
    this.users = this.users.filter((u) => u.id !== userId)

    if (this.users.length < initialLength) {
      this.saveUsers()
      return true
    }
    return false
  }

  changePassword(userId: string, newPassword: string): boolean {
    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) return false

    this.users[userIndex].password = newPassword
    this.saveUsers()
    return true
  }

  // Method used by user management component
  async getUsers(): Promise<User[]> {
    // Return users with actual passwords for admin management
    return Promise.resolve([...this.users])
  }

  // Method used by user management component
  async userExists(username: string): Promise<boolean> {
    return Promise.resolve(this.users.some((u) => u.username === username))
  }

  // Method used by user management component - updated signature
  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.users.push(newUser)
    this.saveUsers()
    return Promise.resolve(newUser)
  }

  // Method used by user management component - updated signature
  async updateUser(updatedUser: User): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === updatedUser.id)
    if (userIndex === -1) {
      throw new Error("User not found")
    }

    this.users[userIndex] = { ...updatedUser }
    this.saveUsers()

    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === updatedUser.id) {
      this.currentUser = { ...updatedUser }
      this.saveCurrentUser()
    }

    return Promise.resolve(this.users[userIndex])
  }

  // Method used by user management component - updated signature
  async deleteUser(userId: string): Promise<void> {
    // Prevent deletion of system administrator
    const user = this.users.find((u) => u.id === userId)
    if (user?.isSystemAdmin) {
      throw new Error("Cannot delete system administrator")
    }

    const initialLength = this.users.length
    this.users = this.users.filter((u) => u.id !== userId)

    if (this.users.length < initialLength) {
      this.saveUsers()
      return Promise.resolve()
    }
    throw new Error("User not found")
  }
}

export const authService = new AuthService()
