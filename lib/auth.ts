export interface User {
  id: string
  username: string
  password: string
  role: "admin" | "user"
  createdAt: string
  createdBy?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
}

// Initial admin user
const initialUsers: User[] = [
  {
    id: "1",
    username: "Jean-Mari",
    password: "Password123",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
]

// Simple in-memory storage (in production, this would be a database)
let users: User[] = [...initialUsers]

export const authService = {
  // Login function
  login: (username: string, password: string): User | null => {
    const user = users.find((u) => u.username === username && u.password === password)
    if (user) {
      // Store in localStorage for persistence
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }
    return null
  },

  // Logout function
  logout: (): void => {
    localStorage.removeItem("currentUser")
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem("currentUser")
    return stored ? JSON.parse(stored) : null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null
  },

  // Check if current user is admin
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser()
    return user?.role === "admin"
  },

  // Get all users (admin only)
  getAllUsers: (): User[] => {
    return users
  },

  // Create new user (admin only)
  createUser: (username: string, password: string, role: "admin" | "user", createdBy: string): User | null => {
    // Check if username already exists
    if (users.find((u) => u.username === username)) {
      return null
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role,
      createdAt: new Date().toISOString(),
      createdBy,
    }

    users.push(newUser)
    return newUser
  },

  // Delete user (admin only)
  deleteUser: (userId: string): boolean => {
    const initialLength = users.length
    users = users.filter((u) => u.id !== userId)
    return users.length < initialLength
  },

  // Update user password (admin only)
  updateUserPassword: (userId: string, newPassword: string): boolean => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      user.password = newPassword
      return true
    }
    return false
  },

  // Update user role (admin only)
  updateUserRole: (userId: string, newRole: "admin" | "user"): boolean => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      user.role = newRole
      return true
    }
    return false
  },
}
