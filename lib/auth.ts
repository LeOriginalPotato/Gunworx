export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'user'
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

class AuthService {
  private users: User[] = [
    {
      id: '1',
      username: 'Jean-Mari',
      firstName: 'Jean-Mari',
      lastName: '',
      email: '',
      role: 'admin',
      isActive: true,
      createdAt: '2020-01-01T00:00:00Z'
    },
    {
      id: '2',
      username: 'Jean',
      firstName: 'Jean',
      lastName: '',
      email: '',
      role: 'admin',
      isActive: true,
      createdAt: '2021-03-15T00:00:00Z'
    },
    {
      id: '3',
      username: 'Wikus',
      firstName: 'Wikus',
      lastName: '',
      email: '',
      role: 'admin',
      isActive: true,
      createdAt: '2022-06-10T00:00:00Z'
    },
    {
      id: '4',
      username: 'Eben',
      firstName: 'Eben',
      lastName: '',
      email: '',
      role: 'user',
      isActive: true,
      createdAt: '2022-08-22T00:00:00Z'
    },
    {
      id: '5',
      username: 'Francois',
      firstName: 'Francois',
      lastName: '',
      email: '',
      role: 'user',
      isActive: true,
      createdAt: '2023-01-18T00:00:00Z'
    }
  ]

  private passwords: Record<string, string> = {
    'Jean-Mari': 'Foktogbokka',
    'Jean': 'xNgU7ADa',
    'Wikus': 'Wikus@888',
    'Eben': 'UY9FBe8abajU',
    'Francois': 'MnWbCkE4AcFP'
  }

  async login(username: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const user = this.users.find(u => u.username === username && u.isActive)
    const storedPassword = this.passwords[username]

    if (!user || storedPassword !== password) {
      throw new Error('Invalid username or password')
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    return user
  }

  async logout(): Promise<void> {
    localStorage.removeItem('currentUser')
  }

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem('currentUser')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  async getUsers(): Promise<User[]> {
    return this.users.filter(u => u.isActive)
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    this.users.push(newUser)
    this.passwords[userData.username] = userData.password
    
    return newUser
  }

  async updateUser(id: string, userData: Partial<User> & { password?: string }): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const { password, ...userUpdate } = userData
    this.users[userIndex] = { ...this.users[userIndex], ...userUpdate }
    
    if (password && this.users[userIndex].username) {
      this.passwords[this.users[userIndex].username] = password
    }

    return this.users[userIndex]
  }

  async deleteUser(id: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const username = this.users[userIndex].username
    this.users.splice(userIndex, 1)
    delete this.passwords[username]
  }

  getPassword(username: string): string {
    return this.passwords[username] || 'Not found'
  }
}

export const authService = new AuthService()
