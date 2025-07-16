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

// Storage keys
const USERS_STORAGE_KEY = "gunworx_users"
const CURRENT_USER_STORAGE_KEY = "gunworx_current_user"

// Initial admin user (hidden from UI)
const initialUsers: User[] = [
  {
    id: "1",
    username: "Jean-Mari",
    password: "Password123",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
]

// Load users from localStorage or use initial users
const loadUsers = (): User[] => {
  if (typeof window === "undefined") return initialUsers

  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (stored) {
      const users = JSON.parse(stored)
      // Ensure we always have the initial admin user
      const hasInitialAdmin = users.some((u: User) => u.username === "Jean-Mari")
      if (!hasInitialAdmin) {
        users.unshift(initialUsers[0])
      }
      return users
    }
  } catch (error) {
    console.warn("Could not load users from localStorage:", error)
  }

  return initialUsers
}

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.warn("Could not save users to localStorage:", error)
  }
}

// Initialize users
let users: User[] = loadUsers()

export const authService = {
  // Login function
  login: (username: string, password: string): User | null => {
    // Reload users from storage to get latest data
    users = loadUsers()

    const user = users.find((u) => u.username === username && u.password === password)
    if (user) {
      // Store in localStorage for persistence
      try {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
      } catch (error) {
        console.warn("Could not save current user:", error)
      }
      return user
    }
    return null
  },

  // Logout function
  logout: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn("Could not load current user:", error)
      return null
    }
  },

  // Set current user (for login)
  setCurrentUser: (user: User): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.warn("Could not save current user:", error)
    }
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

  // Get all users (admin only) - excludes system admin from display
  getAllUsers: (): User[] => {
    users = loadUsers() // Reload to get latest data
    // Filter out the initial system admin from the display list
    return users.filter((u) => u.id !== "1")
  },

  // Get all users including system admin (for internal operations)
  getAllUsersInternal: (): User[] => {
    users = loadUsers()
    return users
  },

  // Create new user (admin only)
  createUser: (username: string, password: string, role: "admin" | "user", createdBy: string): User | null => {
    // Reload users to get latest data
    users = loadUsers()

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
    saveUsers(users)
    return newUser
  },

  // Delete user (admin only) - cannot delete system admin
  deleteUser: (userId: string): boolean => {
    // Prevent deletion of system admin
    if (userId === "1") {
      return false
    }

    users = loadUsers()
    const initialLength = users.length
    users = users.filter((u) => u.id !== userId)

    if (users.length < initialLength) {
      saveUsers(users)
      return true
    }
    return false
  },

  // Update user password (admin only)
  updateUserPassword: (userId: string, newPassword: string): boolean => {
    users = loadUsers()
    const user = users.find((u) => u.id === userId)
    if (user) {
      user.password = newPassword
      saveUsers(users)

      // Update current user session if it's the same user
      const currentUser = authService.getCurrentUser()
      if (currentUser && currentUser.id === userId) {
        currentUser.password = newPassword
        try {
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser))
        } catch (error) {
          console.warn("Could not update current user session:", error)
        }
      }

      return true
    }
    return false
  },

  // Update user role (admin only) - cannot change system admin role
  updateUserRole: (userId: string, newRole: "admin" | "user"): boolean => {
    // Prevent role change for system admin
    if (userId === "1") {
      return false
    }

    users = loadUsers()
    const user = users.find((u) => u.id === userId)
    if (user) {
      user.role = newRole
      saveUsers(users)

      // Update current user session if it's the same user
      const currentUser = authService.getCurrentUser()
      if (currentUser && currentUser.id === userId) {
        currentUser.role = newRole
        try {
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser))
        } catch (error) {
          console.warn("Could not update current user session:", error)
        }
      }

      return true
    }
    return false
  },

  // Update username (admin only) - cannot change system admin username
  updateUsername: (userId: string, newUsername: string): boolean => {
    // Prevent username change for system admin
    if (userId === "1") {
      return false
    }

    users = loadUsers()
    const user = users.find((u) => u.id === userId)
    if (user) {
      user.username = newUsername
      saveUsers(users)

      // Update current user session if it's the same user
      const currentUser = authService.getCurrentUser()
      if (currentUser && currentUser.id === userId) {
        currentUser.username = newUsername
        try {
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser))
        } catch (error) {
          console.warn("Could not update current user session:", error)
        }
      }

      return true
    }
    return false
  },
}

// Auto-save users periodically
if (typeof window !== "undefined") {
  setInterval(() => {
    saveUsers(users)
  }, 30000) // Save every 30 seconds
}
