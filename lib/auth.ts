export interface User {
  id: string
  firstName: string
  lastName: string
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
      firstName: "Jean-Mari",
      lastName: "",
      username: "Jean-Mari",
      password: "Foktogbokka",
      role: "admin",
      isSystemAdmin: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      firstName: "Jean",
      lastName: "",
      username: "Jean",
      password: "xNgU7ADa",
      role: "admin",
      isSystemAdmin: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      firstName: "Wikus",
      lastName: "",
      username: "Wikus",
      password: "Wikus@888",
      role: "admin",
      isSystemAdmin: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "4",
      firstName: "Eben",
      lastName: "",
      username: "Eben",
      password: "UY9FBe8abajU",
      role: "user",
      isSystemAdmin: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "5",
      firstName: "Francois",
      lastName: "",
      username: "Francois",
      password: "MnWbCkE4AcFP",
      role: "user",
      isSystemAdmin: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ]

  async login(username: string, password: string): Promise<User> {
    const user = this.users.find((u) => u.username === username && u.password === password)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Update last login
    user.lastLogin = new Date().toISOString()

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user))
    }

    return user
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
  }

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser")
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  async getUsers(): Promise<User[]> {
    return this.users
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    this.users.push(newUser)
    return newUser
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      throw new Error("User not found")
    }

    this.users[userIndex] = { ...this.users[userIndex], ...userData }
    return this.users[userIndex]
  }

  async deleteUser(id: string): Promise<void> {
    const userIndex = this.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      throw new Error("User not found")
    }

    if (this.users[userIndex].isSystemAdmin) {
      throw new Error("Cannot delete system administrator")
    }

    this.users.splice(userIndex, 1)
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const user = this.users.find((u) => u.id === id)
    if (!user) {
      throw new Error("User not found")
    }

    user.password = newPassword
  }
}

export const authService = new AuthService()
