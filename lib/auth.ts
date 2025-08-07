interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'employee'
  firstName: string
  lastName: string
  department: string
  position: string
  hireDate: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface CreateUserData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  department: string
  position: string
  role?: 'admin' | 'employee'
}

interface UpdateUserData {
  email?: string
  firstName?: string
  lastName?: string
  department?: string
  position?: string
  role?: 'admin' | 'employee'
  isActive?: boolean
}

interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
}

class AuthService {
  private users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@gunworx.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      department: 'Management',
      position: 'Administrator',
      hireDate: '2023-01-01',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      username: 'employee1',
      email: 'employee1@gunworx.com',
      role: 'employee',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Production',
      position: 'Machinist',
      hireDate: '2023-02-15',
      isActive: true,
      createdAt: '2023-02-15T00:00:00Z',
      updatedAt: '2023-02-15T00:00:00Z'
    }
  ]

  private passwords: Record<string, string> = {
    'admin': 'admin123',
    'employee1': 'password123'
  }

  private currentUser: User | null = null

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = this.users.find(u => u.username === credentials.username && u.isActive)
    
    if (!user) {
      return { success: false, error: 'Invalid username or password' }
    }

    const storedPassword = this.passwords[credentials.username]
    if (storedPassword !== credentials.password) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    user.updatedAt = new Date().toISOString()
    
    this.currentUser = user
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }

    return { success: true, user }
  }

  async logout(): Promise<void> {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          return this.currentUser
        } catch {
          localStorage.removeItem('currentUser')
        }
      }
    }

    return null
  }

  async createUser(userData: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    // Check if username already exists
    if (this.users.some(u => u.username === userData.username)) {
      return { success: false, error: 'Username already exists' }
    }

    // Check if email already exists
    if (this.users.some(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' }
    }

    const newUser: User = {
      id: (this.users.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      role: userData.role || 'employee',
      firstName: userData.firstName,
      lastName: userData.lastName,
      department: userData.department,
      position: userData.position,
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.users.push(newUser)
    this.passwords[userData.username] = userData.password

    return { success: true, user: newUser }
  }

  async updateUser(userId: string, updateData: UpdateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    const userIndex = this.users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' }
    }

    // Check if email is being changed and already exists
    if (updateData.email && this.users.some(u => u.email === updateData.email && u.id !== userId)) {
      return { success: false, error: 'Email already exists' }
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    this.users[userIndex] = updatedUser

    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      }
    }

    return { success: true, user: updatedUser }
  }

  async updatePassword(userId: string, passwordData: UpdatePasswordData): Promise<{ success: boolean; error?: string }> {
    const user = this.users.find(u => u.id === userId)
    
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const currentPassword = this.passwords[user.username]
    if (currentPassword !== passwordData.currentPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }

    this.passwords[user.username] = passwordData.newPassword
    
    // Update user's updatedAt timestamp
    user.updatedAt = new Date().toISOString()

    return { success: true }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const userIndex = this.users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' }
    }

    const user = this.users[userIndex]
    
    // Don't allow deleting the last admin
    if (user.role === 'admin' && this.users.filter(u => u.role === 'admin' && u.isActive).length === 1) {
      return { success: false, error: 'Cannot delete the last admin user' }
    }

    // Remove user and password
    this.users.splice(userIndex, 1)
    delete this.passwords[user.username]

    return { success: true }
  }

  getAllUsers(): User[] {
    return [...this.users]
  }

  getUserById(userId: string): User | undefined {
    return this.users.find(u => u.id === userId)
  }

  isAdmin(user: User | null = null): boolean {
    const checkUser = user || this.getCurrentUser()
    return checkUser?.role === 'admin' || false
  }
}

export const authService = new AuthService()
export type { User, LoginCredentials, CreateUserData, UpdateUserData, UpdatePasswordData }
