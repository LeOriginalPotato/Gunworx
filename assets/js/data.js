// Data management and API simulation
(function() {
  'use strict';

  // Simulated API delay
  const API_DELAY = 300;

  // Local storage keys
  const STORAGE_KEYS = {
    FIREARMS: 'gunworx_firearms',
    INSPECTIONS: 'gunworx_inspections',
    USERS: 'gunworx_users',
    CURRENT_USER: 'gunworx_current_user',
    SETTINGS: 'gunworx_settings'
  };

  // Data service class
  class DataService {
    constructor() {
      this.initializeData();
    }

    // Initialize default data if not exists
    initializeData() {
      if (!this.getFromStorage(STORAGE_KEYS.FIREARMS)) {
        this.setToStorage(STORAGE_KEYS.FIREARMS, this.getDefaultFirearms());
      }
      
      if (!this.getFromStorage(STORAGE_KEYS.INSPECTIONS)) {
        this.setToStorage(STORAGE_KEYS.INSPECTIONS, this.getDefaultInspections());
      }
      
      if (!this.getFromStorage(STORAGE_KEYS.USERS)) {
        this.setToStorage(STORAGE_KEYS.USERS, this.getDefaultUsers());
      }
      
      if (!this.getFromStorage(STORAGE_KEYS.SETTINGS)) {
        this.setToStorage(STORAGE_KEYS.SETTINGS, this.getDefaultSettings());
      }
    }

    // Storage helpers
    getFromStorage(key) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error(`Error reading from storage (${key}):`, error);
        return null;
      }
    }

    setToStorage(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error(`Error writing to storage (${key}):`, error);
        return false;
      }
    }

    removeFromStorage(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error(`Error removing from storage (${key}):`, error);
        return false;
      }
    }

    // Simulate API delay
    async delay(ms = API_DELAY) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate unique ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Default data generators
    getDefaultFirearms() {
      return [
        {
          id: "1",
          stockNo: "CO3",
          dateReceived: "2023-11-15",
          make: "Walther",
          type: "Pistol",
          caliber: "7.65",
          serialNo: "223083",
          fullName: "GM",
          surname: "Smuts",
          registrationId: "1/23/1985",
          physicalAddress: "",
          licenceNo: "31/21",
          licenceDate: "",
          remarks: "Mac EPR Dealer Stock",
          status: "dealer-stock",
        },
        {
          id: "2",
          stockNo: "A01",
          dateReceived: "2025-05-07",
          make: "Glock",
          type: "Pistol",
          caliber: "9mm",
          serialNo: "SSN655",
          fullName: "I",
          surname: "Dunn",
          registrationId: "9103035027088",
          physicalAddress: "54 Lazaar Ave",
          licenceNo: "",
          licenceDate: "",
          remarks: "Safekeeping",
          status: "safe-keeping",
        }
      ];
    }

    getDefaultInspections() {
      return [
        {
          id: "1",
          date: "2025-05-30",
          inspector: "PN Sikhakhane",
          type: "Permanent Import Permit Inspection",
          findings: "Inspection of Nicholas Yale (PTY) LTD import permit PI10184610. All firearms properly documented and accounted for.",
          status: "passed",
          recommendations: "Continue compliance with Firearms Control Act requirements.",
        }
      ];
    }

    getDefaultUsers() {
      return [
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
        }
      ];
    }

    getDefaultSettings() {
      return {
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/dd/yyyy',
        timezone: 'UTC',
        notifications: {
          email: true,
          browser: true,
          sms: false
        },
        security: {
          sessionTimeout: 30,
          requirePasswordChange: false,
          twoFactorAuth: false
        },
        display: {
          itemsPerPage: 25,
          showAdvancedFilters: true,
          compactView: false
        }
      };
    }

    // Firearms API
    async getFirearms(filters = {}) {
      await this.delay();
      let firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || [];
      
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        firearms = firearms.filter(f => f.status === filters.status);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        firearms = firearms.filter(f => 
          Object.values(f).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm)
          )
        );
      }
      
      return firearms;
    }

    async getFirearm(id) {
      await this.delay();
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || [];
      return firearms.find(f => f.id === id) || null;
    }

    async createFirearm(firearmData) {
      await this.delay();
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || [];
      const newFirearm = {
        ...firearmData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      firearms.push(newFirearm);
      this.setToStorage(STORAGE_KEYS.FIREARMS, firearms);
      return newFirearm;
    }

    async updateFirearm(id, firearmData) {
      await this.delay();
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || [];
      const index = firearms.findIndex(f => f.id === id);
      
      if (index === -1) {
        throw new Error('Firearm not found');
      }
      
      firearms[index] = {
        ...firearms[index],
        ...firearmData,
        updatedAt: new Date().toISOString()
      };
      
      this.setToStorage(STORAGE_KEYS.FIREARMS, firearms);
      return firearms[index];
    }

    async deleteFirearm(id) {
      await this.delay();
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || [];
      const filteredFirearms = firearms.filter(f => f.id !== id);
      
      if (filteredFirearms.length === firearms.length) {
        throw new Error('Firearm not found');
      }
      
      this.setToStorage(STORAGE_KEYS.FIREARMS, filteredFirearms);
      return true;
    }

    // Inspections API
    async getInspections(filters = {}) {
      await this.delay();
      let inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || [];
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        inspections = inspections.filter(i => 
          Object.values(i).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm)
          )
        );
      }
      
      return inspections;
    }

    async getInspection(id) {
      await this.delay();
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || [];
      return inspections.find(i => i.id === id) || null;
    }

    async createInspection(inspectionData) {
      await this.delay();
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || [];
      const newInspection = {
        ...inspectionData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      inspections.push(newInspection);
      this.setToStorage(STORAGE_KEYS.INSPECTIONS, inspections);
      return newInspection;
    }

    async updateInspection(id, inspectionData) {
      await this.delay();
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || [];
      const index = inspections.findIndex(i => i.id === id);
      
      if (index === -1) {
        throw new Error('Inspection not found');
      }
      
      inspections[index] = {
        ...inspections[index],
        ...inspectionData,
        updatedAt: new Date().toISOString()
      };
      
      this.setToStorage(STORAGE_KEYS.INSPECTIONS, inspections);
      return inspections[index];
    }

    async deleteInspection(id) {
      await this.delay();
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || [];
      const filteredInspections = inspections.filter(i => i.id !== id);
      
      if (filteredInspections.length === inspections.length) {
        throw new Error('Inspection not found');
      }
      
      this.setToStorage(STORAGE_KEYS.INSPECTIONS, filteredInspections);
      return true;
    }

    // Users API
    async getUsers() {
      await this.delay();
      return this.getFromStorage(STORAGE_KEYS.USERS) || [];
    }

    async getUser(id) {
      await this.delay();
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
      return users.find(u => u.id === id) || null;
    }

    async createUser(userData) {
      await this.delay();
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
      
      // Check if username already exists
      if (users.some(u => u.username === userData.username)) {
        throw new Error('Username already exists');
      }
      
      const newUser = {
        ...userData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newUser);
      this.setToStorage(STORAGE_KEYS.USERS, users);
      return newUser;
    }

    async updateUser(id, userData) {
      await this.delay();
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) {
        throw new Error('User not found');
      }
      
      // Check if username already exists (excluding current user)
      if (userData.username && users.some(u => u.id !== id && u.username === userData.username)) {
        throw new Error('Username already exists');
      }
      
      users[index] = {
        ...users[index],
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      this.setToStorage(STORAGE_KEYS.USERS, users);
      return users[index];
    }

    async deleteUser(id) {
      await this.delay();
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
      const user = users.find(u => u.id === id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.isSystemAdmin) {
        throw new Error('Cannot delete system administrator');
      }
      
      const filteredUsers = users.filter(u => u.id !== id);
      this.setToStorage(STORAGE_KEYS.USERS, filteredUsers);
      return true;
    }

    // Authentication API
    async login(username, password) {
      await this.delay();
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
      const user = users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      // Update last login
      user.lastLogin = new Date().toISOString();
      this.updateUser(user.id, { lastLogin: user.lastLogin });
      
      // Store current user
      this.setToStorage(STORAGE_KEYS.CURRENT_USER, user);
      
      return user;
    }

    async logout() {
      await this.delay();
      this.removeFromStorage(STORAGE_KEYS.CURRENT_USER);
      return true;
    }

    getCurrentUser() {
      return this.getFromStorage(STORAGE_KEYS.CURRENT_USER);
    }

    // Settings API
    async getSettings() {
      await this.delay();
      return this.getFromStorage(STORAGE_KEYS.SETTINGS) || this.getDefaultSettings();
    }

    async updateSettings(settings) {
      await this.delay();
      const currentSettings = this.getFromStorage(STORAGE_KEYS.SETTINGS) || this.getDefaultSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      this.setToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
      return updatedSettings;
    }

    // Export/Import API
    async exportData(type = 'all') {
      await this.delay();
      const data = {};
      
      if (type === 'all' || type === 'firearms') {
        data.firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || [];
      }
      
      if (type === 'all' || type === 'inspections') {
        data.inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || [];
      }
      
      if (type === 'all' || type === 'users') {
        data.users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
      }
      
      return data;
    }

    async importData(data) {
      await this.delay();
      
      if (data.firearms) {
        this.setToStorage(STORAGE_KEYS.FIREARMS, data.firearms);
      }
      
      if (data.inspections) {
        this.setToStorage(STORAGE_KEYS.INSPECTIONS, data.inspections);
      }
      
      if (data.users) {
        this.setToStorage(STORAGE_KEYS.USERS, data.users);
      }
      
      return true;
    }

    // Statistics API
    async getStatistics() {
      await this.delay();
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || [];
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || [];
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || [];
      
      return {
        firearms: {
          total: firearms.length,
          inStock: firearms.filter(f => f.status === 'in-stock').length,
          dealerStock: firearms.filter(f => f.status === 'dealer-stock').length,
          safeKeeping: firearms.filter(f => f.status === 'safe-keeping').length,
          collected: firearms.filter(f => f.status === 'collected').length,
        },
        inspections: {
          total: inspections.length,
          passed: inspections.filter(i => i.status === 'passed').length,
          failed: inspections.filter(i => i.status === 'failed').length,
          pending: inspections.filter(i => i.status === 'pending').length,
        },
        users: {
          total: users.length,
          admins: users.filter(u => u.role === 'admin').length,
          systemAdmins: users.filter(u => u.isSystemAdmin).length,
          regularUsers: users.filter(u => u.role === 'user').length,
        }
      };
    }
  }

  // Create global instance
  window.DataService = new DataService();

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
  }

})();
