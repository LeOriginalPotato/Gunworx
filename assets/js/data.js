// Data management and API simulation
;(() => {
  // Simulated API delay
  const API_DELAY = 300

  // Local storage keys
  const STORAGE_KEYS = {
    FIREARMS: "gunworx_firearms",
    INSPECTIONS: "gunworx_inspections",
    USERS: "gunworx_users",
    CURRENT_USER: "gunworx_current_user",
    SETTINGS: "gunworx_settings",
  }

  // Data service class
  class DataService {
    constructor() {
      this.initializeData()
    }

    // Initialize default data if not exists
    initializeData() {
      if (!this.getFromStorage(STORAGE_KEYS.FIREARMS)) {
        this.setToStorage(STORAGE_KEYS.FIREARMS, this.getDefaultFirearms())
      }

      if (!this.getFromStorage(STORAGE_KEYS.INSPECTIONS)) {
        this.setToStorage(STORAGE_KEYS.INSPECTIONS, this.getDefaultInspections())
      }

      if (!this.getFromStorage(STORAGE_KEYS.USERS)) {
        this.setToStorage(STORAGE_KEYS.USERS, this.getDefaultUsers())
      }

      if (!this.getFromStorage(STORAGE_KEYS.SETTINGS)) {
        this.setToStorage(STORAGE_KEYS.SETTINGS, this.getDefaultSettings())
      }
    }

    // Storage helpers
    getFromStorage(key) {
      try {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
      } catch (error) {
        console.error(`Error reading from storage (${key}):`, error)
        return null
      }
    }

    setToStorage(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        return true
      } catch (error) {
        console.error(`Error writing to storage (${key}):`, error)
        return false
      }
    }

    removeFromStorage(key) {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.error(`Error removing from storage (${key}):`, error)
        return false
      }
    }

    // Simulate API delay
    async delay(ms = API_DELAY) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    // Generate unique ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
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
        },
      ]
    }

    getDefaultInspections() {
      return [
        {
          id: "1",
          date: "2025-06-03",
          inspector: "PN Sikhakhane",
          type: "Permanent Import Permit Inspection",
          permitNumber: "PI10184610",
          permitHolder: "Nicholas Yale (PTY) LTD",
          findings:
            "Inspection of Nicholas Yale (PTY) LTD import permit PI10184610. All 500+ Smith & Wesson firearms properly documented and accounted for. Comprehensive verification of serial numbers, calibers, and firearm types completed.",
          status: "passed",
          recommendations:
            "Continue compliance with Firearms Control Act requirements. Maintain proper storage and documentation standards.",
          firearmDetails: [
            // .357 MAG Firearms
            { caliber: ".357 MAG", make: "Smith & Wesson", serialNo: "LLH8085", type: "Rifle" },
            { caliber: ".357 MAG", make: "Smith & Wesson", serialNo: "EEK3159", type: "Revolver" },
            { caliber: ".357 MAG", make: "Smith & Wesson", serialNo: "EER8271", type: "Revolver" },

            // .22 SHORT/LONG/LR Firearms
            { caliber: ".22 SHORT/LONG/LR", make: "Smith & Wesson", serialNo: "EER8189", type: "Revolver" },
            { caliber: ".22 SHORT/LONG/LR", make: "Smith & Wesson", serialNo: "EET5011", type: "Revolver" },
            { caliber: ".22 SHORT/LONG/LR", make: "Smith & Wesson", serialNo: "EET5019", type: "Revolver" },
            { caliber: ".22 SHORT/LONG/LR", make: "Smith & Wesson", serialNo: "EET7761", type: "Revolver" },
            { caliber: ".22 SHORT/LONG/LR", make: "Smith & Wesson", serialNo: "EET7765", type: "Revolver" },
            { caliber: ".22 SHORT/LONG/LR", make: "Smith & Wesson", serialNo: "EET7780", type: "Revolver" },

            // .38 Special Firearms
            { caliber: ".38 Special", make: "Smith & Wesson", serialNo: "EDZ1215", type: "Revolver" },
            { caliber: ".38 Special", make: "Smith & Wesson", serialNo: "EEF2376", type: "Revolver" },
            { caliber: ".38 Special", make: "Smith & Wesson", serialNo: "EEV1568", type: "Revolver" },

            // .22 LR/.22 MAG (WMR) Firearms
            { caliber: ".22 LR/.22 MAG (WMR)", make: "Smith & Wesson", serialNo: "EEN2165", type: "Revolver" },
            { caliber: ".22 LR/.22 MAG (WMR)", make: "Smith & Wesson", serialNo: "EEU0808", type: "Revolver" },

            // .22 LONG/LR (PISTOL)
            { caliber: ".22 LONG/LR (PISTOL)", make: "Smith & Wesson", serialNo: "UES6239", type: "Pistol" },

            // .45 ACP Firearms
            { caliber: ".45 ACP", make: "Smith & Wesson", serialNo: "UFH0813", type: "Pistol" },
            { caliber: ".45 ACP", make: "Smith & Wesson", serialNo: "UFH1723", type: "Pistol" },
            { caliber: ".45 ACP", make: "Smith & Wesson", serialNo: "UFH1897", type: "Pistol" },
            { caliber: ".45 ACP", make: "Smith & Wesson", serialNo: "UFJ2201", type: "Pistol" },
            { caliber: ".45 ACP", make: "Smith & Wesson", serialNo: "UFJ2219", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - First batch
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJP3525", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR2127", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR2139", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR2297", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR2373", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR2375", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR2765", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR2825", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJR3512", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJS3074", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW1464", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW1497", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW1525", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW1533", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW4154", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW4161", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW4385", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW5327", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW5636", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW5639", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - Second batch
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW7647", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW7659", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW7711", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW8129", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW8163", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJW9944", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX8064", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX8079", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX8104", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX8172", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX9285", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX9351", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX9352", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX9365", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX9383", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJX9402", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1880", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1888", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1917", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1927", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - Third batch
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1936", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1945", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1955", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1965", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1971", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1973", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1974", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1979", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1980", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1985", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY1992", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY2008", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY2020", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY9612", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY9617", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY9622", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY9635", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY9639", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY9643", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJY9667", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - Fourth batch
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0369", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0372", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0376", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0393", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0395", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0398", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0403", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0406", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0770", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0775", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0788", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ0833", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1461", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1470", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1482", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1495", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1498", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1501", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1505", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1519", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - Fifth batch
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1523", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1525", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1565", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1575", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ1829", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3194", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3222", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3229", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3231", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3232", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3233", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3236", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3238", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3241", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3246", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3247", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3251", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3260", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "EJZ3266", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJB6240", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - Sixth batch (FJE series)
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1728", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1935", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1952", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1953", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1956", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1959", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1960", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE1961", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE5643", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE5649", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE5654", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE5657", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE5664", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJE7476", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF0482", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF0486", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF2100", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF2101", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF2130", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF7248", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - Seventh batch (FJF series continued)
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF8216", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF9078", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF9081", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF9082", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJF9412", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJH1531", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJH1532", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJH3107", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJH3121", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJH3550", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL1046", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL1051", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL1055", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL1057", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL1172", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL4180", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL6916", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL9077", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "FJL9458", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "JJD2411", type: "Pistol" },

            // 9MM PAR (9X19MM) Firearms - Eighth batch (S series)
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SBR0594", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SBR1398", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SBR1459", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SCN2435", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SCN2482", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SCN2551", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SCN2570", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SCX0957", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED7816", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8018", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8025", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8030", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8037", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8135", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8136", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8137", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8148", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8149", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8151", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8154", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8189", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8195", type: "Pistol" },
            { caliber: "9MM PAR (9X19MM)", make: "Smith & Wesson", serialNo: "SED8196", type: "Pistol" },

            // .44 MAG (.44 REM MAG)
            { caliber: ".44 MAG (.44 REM MAG)", make: "Smith & Wesson", serialNo: "EEH7626", type: "Revolver" },

            // .22 LONG RIFLE (LR) Firearms - First batch
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX0894", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX2059", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX2089", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX2105", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX2130", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX2143", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX2509", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX4723", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX4747", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FHX4758", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH7361", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH7747", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH7757", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH8293", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH8344", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH8351", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH8382", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH8867", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH8985", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH9008", type: "Rifle/Carbine" },

            // .22 LONG RIFLE (LR) Firearms - Second batch
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH9052", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH9054", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH9078", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJH9082", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJJ8623", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJJ9314", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJJ9316", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJJ9336", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJJ9831", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJJ9833", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK2420", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK2739", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK2833", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK2871", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK2873", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK3302", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK3400", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK3639", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK4705", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK4742", type: "Rifle/Carbine" },

            // .22 LONG RIFLE (LR) Firearms - Third batch
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK4755", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK4783", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK5579", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK5808", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK6317", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK6351", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK6397", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7111", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7118", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7138", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7145", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7154", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7180", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7216", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7222", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7224", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7229", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7232", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7236", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7242", type: "Rifle/Carbine" },

            // .22 LONG RIFLE (LR) Firearms - Fourth batch
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7262", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJK7362", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJL5426", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJL5435", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJL6495", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJL6558", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJN1414", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP0835", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1712", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1719", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1721", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1741", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1747", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1768", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1810", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1827", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJP1966", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1013", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1019", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1020", type: "Rifle/Carbine" },

            // .22 LONG RIFLE (LR) Firearms - Fifth batch (FJR series continued)
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1022", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1029", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1030", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1048", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1056", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1063", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1070", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1071", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1077", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1088", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1092", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1093", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1094", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1100", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1106", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJR1107", type: "Rifle/Carbine" },

            // .22 LONG RIFLE (LR) Firearms - Sixth batch (FJT series)
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0652", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0656", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0660", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0664", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0668", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0672", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0676", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0680", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0684", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0688", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0692", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0696", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0700", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0704", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0708", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0712", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0716", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0720", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0724", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT0728", type: "S/L: Rifle Cal" },

            // .22 LONG RIFLE (LR) Firearms - Seventh batch (FJT series continued)
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1622", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1629", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1632", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1641", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1648", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1654", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1662", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1669", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1673", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1684", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1690", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1696", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1702", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1709", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1712", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1718", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1721", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1730", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1733", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1740", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1743", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1751", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1754", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1762", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1765", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1771", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1774", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1783", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1786", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1792", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1795", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1803", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1806", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1815", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1823", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1850", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1971", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "FJT1980", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ3694", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ4123", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ4128", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ4207", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ4722", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ4732", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ5286", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ5291", type: "S/L: Rifle Cal" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ5292", type: "Rifle/Carbine" },
            { caliber: ".22 LONG RIFLE (LR)", make: "Smith & Wesson", serialNo: "LBJ5426", type: "S/L: Rifle Cal" },

            // .500 S&W MAGNUM Firearms
            { caliber: ".500 S&W MAGNUM", make: "Smith & Wesson", serialNo: "EER5141", type: "Revolver" },
            { caliber: ".500 S&W MAGNUM", make: "Smith & Wesson", serialNo: "EES1464", type: "Revolver" },
            { caliber: ".500 S&W MAGNUM", make: "Smith & Wesson", serialNo: "EES6081", type: "Revolver" },
            { caliber: ".500 S&W MAGNUM", make: "Smith & Wesson", serialNo: "EES7603", type: "Revolver" },
            { caliber: ".500 S&W MAGNUM", make: "Smith & Wesson", serialNo: "EET7683", type: "Revolver" },
            { caliber: ".500 S&W MAGNUM", make: "Smith & Wesson", serialNo: "EEU5933", type: "Revolver" },
            { caliber: ".500 S&W MAGNUM", make: "Smith & Wesson", serialNo: "EEU7745", type: "Revolver" },

            // .380 ACP Firearms - First batch
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJH7299", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJR6012", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJS0888", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJV0156", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJV0804", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJV5351", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJV9641", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJW9766", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJX4565", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJX4933", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJX6032", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJX8629", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJX8836", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY0403", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY0792", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY0801", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY0804", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY0808", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY0830", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY0842", type: "Pistol" },

            // .380 ACP Firearms - Second batch
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY1383", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY3726", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY3974", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY4011", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY4030", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY4036", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY4052", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY4083", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY5788", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY5798", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY5819", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY5825", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY5859", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY5873", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY7032", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY7060", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY7313", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY7369", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY7407", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJY9510", type: "Pistol" },

            // .380 ACP Firearms - Third batch
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJZ0042", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJZ6974", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJZ7525", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EJZ9934", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA0134", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA0720", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA1404", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA1435", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA5177", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA5702", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA6060", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA6663", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA7290", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA9375", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA9391", type: "Pistol" },
            { caliber: ".380 ACP", make: "Smith & Wesson", serialNo: "EKA9426", type: "Pistol" },

            // .460 S&W MAG
            { caliber: ".460 S&W MAG", make: "Smith & Wesson", serialNo: "EET9506", type: "Revolver" },

            // 5.56X45MM Firearms - First batch
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88102", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88265", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88270", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88366", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88368", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88373", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88383", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88387", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88389", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88395", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88397", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88407", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88408", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88451", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88469", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88470", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88476", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88479", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88481", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TV88541", type: "Rifle/Carbine" },

            // 5.56X45MM Firearms - Second batch (TW series)
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84272", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84275", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84276", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84313", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84314", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84316", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84317", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84318", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84319", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84320", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84321", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84322", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84329", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84388", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84389", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84392", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84393", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84394", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84395", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84434", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84463", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84478", type: "Rifle/Carbine" },

            // 5.56X45MM Firearms - Third batch (TW series continued)
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84538", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84542", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84546", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84550", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84551", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84580", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84581", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84582", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84584", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84585", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84587", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84640", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84642", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84665", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84667", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84677", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84681", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84685", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84688", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84691", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84693", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84695", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84697", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84698", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "TW84701", type: "S/L: Rifle Cal" },

            // 5.56X45MM Firearms - Fourth batch (UB series)
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB25078", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB25079", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27480", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27481", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27483", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27484", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27485", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27486", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27487", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27488", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27490", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27491", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27492", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27494", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27495", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27496", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27497", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27498", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27499", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27500", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27501", type: "Rifle/Carbine" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27502", type: "S/L: Rifle Cal" },
            { caliber: "5.56X45MM", make: "Smith & Wesson", serialNo: "UB27503", type: "Rifle/Carbine" },

            // .308 WIN Firearms
            { caliber: ".308 WIN", make: "Smith & Wesson", serialNo: "KN87634", type: "S/L: Rifle Cal" },
            { caliber: ".308 WIN", make: "Smith & Wesson", serialNo: "KN87637", type: "Rifle/Carbine" },
            { caliber: ".308 WIN", make: "Smith & Wesson", serialNo: "KN91382", type: "S/L: Rifle Cal" },
            { caliber: ".308 WIN", make: "Smith & Wesson", serialNo: "KN91387", type: "Rifle/Carbine" },
            { caliber: ".308 WIN", make: "Smith & Wesson", serialNo: "KN91390", type: "S/L: Rifle Cal" },

            // .350 LEGEND
            { caliber: ".350 LEGEND", make: "Smith & Wesson", serialNo: "EEJ6562", type: "Rifle/Carbine" },
          ],
        },
      ]
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
        },
      ]
    }

    getDefaultSettings() {
      return {
        theme: "light",
        language: "en",
        dateFormat: "MM/dd/yyyy",
        timezone: "UTC",
        notifications: {
          email: true,
          browser: true,
          sms: false,
        },
        security: {
          sessionTimeout: 30,
          requirePasswordChange: false,
          twoFactorAuth: false,
        },
        display: {
          itemsPerPage: 25,
          showAdvancedFilters: true,
          compactView: false,
        },
      }
    }

    // Firearms API
    async getFirearms(filters = {}) {
      await this.delay()
      let firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || []

      // Apply filters
      if (filters.status && filters.status !== "all") {
        firearms = firearms.filter((f) => f.status === filters.status)
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        firearms = firearms.filter((f) =>
          Object.values(f).some((value) => value && value.toString().toLowerCase().includes(searchTerm)),
        )
      }

      return firearms
    }

    async getFirearm(id) {
      await this.delay()
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || []
      return firearms.find((f) => f.id === id) || null
    }

    async createFirearm(firearmData) {
      await this.delay()
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || []
      const newFirearm = {
        ...firearmData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      firearms.push(newFirearm)
      this.setToStorage(STORAGE_KEYS.FIREARMS, firearms)
      return newFirearm
    }

    async updateFirearm(id, firearmData) {
      await this.delay()
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || []
      const index = firearms.findIndex((f) => f.id === id)

      if (index === -1) {
        throw new Error("Firearm not found")
      }

      firearms[index] = {
        ...firearms[index],
        ...firearmData,
        updatedAt: new Date().toISOString(),
      }

      this.setToStorage(STORAGE_KEYS.FIREARMS, firearms)
      return firearms[index]
    }

    async deleteFirearm(id) {
      await this.delay()
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || []
      const filteredFirearms = firearms.filter((f) => f.id !== id)

      if (filteredFirearms.length === firearms.length) {
        throw new Error("Firearm not found")
      }

      this.setToStorage(STORAGE_KEYS.FIREARMS, filteredFirearms)
      return true
    }

    // Inspections API
    async getInspections(filters = {}) {
      await this.delay()
      let inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || []

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        inspections = inspections.filter((i) =>
          Object.values(i).some((value) => value && value.toString().toLowerCase().includes(searchTerm)),
        )
      }

      return inspections
    }

    async getInspection(id) {
      await this.delay()
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || []
      return inspections.find((i) => i.id === id) || null
    }

    async createInspection(inspectionData) {
      await this.delay()
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || []
      const newInspection = {
        ...inspectionData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      inspections.push(newInspection)
      this.setToStorage(STORAGE_KEYS.INSPECTIONS, inspections)
      return newInspection
    }

    async updateInspection(id, inspectionData) {
      await this.delay()
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || []
      const index = inspections.findIndex((i) => i.id === id)

      if (index === -1) {
        throw new Error("Inspection not found")
      }

      inspections[index] = {
        ...inspections[index],
        ...inspectionData,
        updatedAt: new Date().toISOString(),
      }

      this.setToStorage(STORAGE_KEYS.INSPECTIONS, inspections)
      return inspections[index]
    }

    async deleteInspection(id) {
      await this.delay()
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || []
      const filteredInspections = inspections.filter((i) => i.id !== id)

      if (filteredInspections.length === inspections.length) {
        throw new Error("Inspection not found")
      }

      this.setToStorage(STORAGE_KEYS.INSPECTIONS, filteredInspections)
      return true
    }

    // Users API
    async getUsers() {
      await this.delay()
      return this.getFromStorage(STORAGE_KEYS.USERS) || []
    }

    async getUser(id) {
      await this.delay()
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || []
      return users.find((u) => u.id === id) || null
    }

    async createUser(userData) {
      await this.delay()
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || []

      // Check if username already exists
      if (users.some((u) => u.username === userData.username)) {
        throw new Error("Username already exists")
      }

      const newUser = {
        ...userData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      users.push(newUser)
      this.setToStorage(STORAGE_KEYS.USERS, users)
      return newUser
    }

    async updateUser(id, userData) {
      await this.delay()
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || []
      const index = users.findIndex((u) => u.id === id)

      if (index === -1) {
        throw new Error("User not found")
      }

      // Check if username already exists (excluding current user)
      if (userData.username && users.some((u) => u.id !== id && u.username === userData.username)) {
        throw new Error("Username already exists")
      }

      users[index] = {
        ...users[index],
        ...userData,
        updatedAt: new Date().toISOString(),
      }

      this.setToStorage(STORAGE_KEYS.USERS, users)
      return users[index]
    }

    async deleteUser(id) {
      await this.delay()
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || []
      const user = users.find((u) => u.id === id)

      if (!user) {
        throw new Error("User not found")
      }

      if (user.isSystemAdmin) {
        throw new Error("Cannot delete system administrator")
      }

      const filteredUsers = users.filter((u) => u.id !== id)
      this.setToStorage(STORAGE_KEYS.USERS, filteredUsers)
      return true
    }

    // Authentication API
    async login(username, password) {
      await this.delay()
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || []
      const user = users.find((u) => u.username === username && u.password === password)

      if (!user) {
        throw new Error("Invalid username or password")
      }

      // Update last login
      user.lastLogin = new Date().toISOString()
      this.updateUser(user.id, { lastLogin: user.lastLogin })

      // Store current user
      this.setToStorage(STORAGE_KEYS.CURRENT_USER, user)

      return user
    }

    async logout() {
      await this.delay()
      this.removeFromStorage(STORAGE_KEYS.CURRENT_USER)
      return true
    }

    getCurrentUser() {
      return this.getFromStorage(STORAGE_KEYS.CURRENT_USER)
    }

    // Settings API
    async getSettings() {
      await this.delay()
      return this.getFromStorage(STORAGE_KEYS.SETTINGS) || this.getDefaultSettings()
    }

    async updateSettings(settings) {
      await this.delay()
      const currentSettings = this.getFromStorage(STORAGE_KEYS.SETTINGS) || this.getDefaultSettings()
      const updatedSettings = { ...currentSettings, ...settings }
      this.setToStorage(STORAGE_KEYS.SETTINGS, updatedSettings)
      return updatedSettings
    }

    // Export/Import API
    async exportData(type = "all") {
      await this.delay()
      const data = {}

      if (type === "all" || type === "firearms") {
        data.firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || []
      }

      if (type === "all" || type === "inspections") {
        data.inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || []
      }

      if (type === "all" || type === "users") {
        data.users = this.getFromStorage(STORAGE_KEYS.USERS) || []
      }

      return data
    }

    async importData(data) {
      await this.delay()

      if (data.firearms) {
        this.setToStorage(STORAGE_KEYS.FIREARMS, data.firearms)
      }

      if (data.inspections) {
        this.setToStorage(STORAGE_KEYS.INSPECTIONS, data.inspections)
      }

      if (data.users) {
        this.setToStorage(STORAGE_KEYS.USERS, data.users)
      }

      return true
    }

    // Statistics API
    async getStatistics() {
      await this.delay()
      const firearms = this.getFromStorage(STORAGE_KEYS.FIREARMS) || []
      const inspections = this.getFromStorage(STORAGE_KEYS.INSPECTIONS) || []
      const users = this.getFromStorage(STORAGE_KEYS.USERS) || []

      return {
        firearms: {
          total: firearms.length,
          inStock: firearms.filter((f) => f.status === "in-stock").length,
          dealerStock: firearms.filter((f) => f.status === "dealer-stock").length,
          safeKeeping: firearms.filter((f) => f.status === "safe-keeping").length,
          collected: firearms.filter((f) => f.status === "collected").length,
        },
        inspections: {
          total: inspections.length,
          passed: inspections.filter((i) => i.status === "passed").length,
          failed: inspections.filter((i) => i.status === "failed").length,
          pending: inspections.filter((i) => i.status === "pending").length,
        },
        users: {
          total: users.length,
          admins: users.filter((u) => u.role === "admin").length,
          systemAdmins: users.filter((u) => u.isSystemAdmin).length,
          regularUsers: users.filter((u) => u.role === "user").length,
        },
      }
    }
  }

  // Create global instance
  window.DataService = new DataService()

  // Export for module systems
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DataService
  }
})()
