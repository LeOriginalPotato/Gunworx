export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'employee';
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@gunworx.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

  async login(username: string, password: string): Promise<{ success: boolean; user?: User; sessionId?: string; error?: string }> {
    // Simple authentication - in production, use proper password hashing
    if (username === 'admin' && password === 'admin123') {
      const user = this.users.find(u => u.username === username);
      if (user) {
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        this.sessions.set(sessionId, { userId: user.id, expiresAt });
        
        return { success: true, user, sessionId };
      }
    }
    
    return { success: false, error: 'Invalid credentials' };
  }

  async logout(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async validateSession(sessionId: string): Promise<User | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        this.sessions.delete(sessionId);
      }
      return null;
    }

    const user = this.users.find(u => u.id === session.userId);
    return user || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    // In a real application, you would hash the password and store it
    // For this demo, we'll just return true if the user exists
    const user = this.users.find(u => u.id === userId);
    return !!user;
  }
}

// Singleton instance
export const authService = new AuthService();
