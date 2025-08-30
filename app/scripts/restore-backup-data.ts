export interface BackupData {
  firearms: any[]
  inspections: any[]
  users: any[]
  timestamp: string
}

export interface RestoreResult {
  success: boolean
  message: string
  restored?: {
    firearms: number
    inspections: number
    users: number
  }
  error?: string
}

// Central data store for the application
let applicationData = {
  firearms: [
    {
      id: "firearm_1",
      stockNo: "GW001",
      dateReceived: "2024-01-15",
      make: "Walther",
      type: "Pistol",
      caliber: "9mm",
      serialNo: "WA123456",
      fullName: "John Smith",
      surname: "Smith",
      registrationId: "8501015800083",
      physicalAddress: "123 Main Street, Cape Town, 8001",
      licenceNo: "L001234",
      licenceDate: "2024-01-01",
      remarks: "Standard service pistol",
      status: "in-stock",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "firearm_2",
      stockNo: "GW002",
      dateReceived: "2024-02-20",
      make: "Glock",
      type: "Pistol",
      caliber: "9mm",
      serialNo: "GL789012",
      fullName: "Jane Doe",
      surname: "Doe",
      registrationId: "9203125900084",
      physicalAddress: "456 Oak Avenue, Johannesburg, 2000",
      licenceNo: "L005678",
      licenceDate: "2024-02-01",
      remarks: "Compact model",
      status: "safe-keeping",
      createdAt: "2024-02-20T14:30:00Z",
      updatedAt: "2024-02-20T14:30:00Z",
    },
  ],
  inspections: [
    // Only SMITH & WESSON inspections from the PDF - exactly 14 records
    {
      id: "inspection_1",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27496",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_2",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27497",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_3",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27498",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_4",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27499",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_5",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27500",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_6",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27501",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_7",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27502",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_8",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "selfLoadingRifle",
      make: "SMITH & WESSON",
      caliber: "5.56X45MM",
      serialNumber: "UB27503",
      action: "semiAuto",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_9",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN87634",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_10",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN87637",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_11",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN91382",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_12",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN91387",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_13",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".308 WIN",
      serialNumber: "KN91390",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
    {
      id: "inspection_14",
      date: "2025-06-03",
      inspector: "WIKUS FOURIE",
      company: "Delta",
      firearmType: "rifle",
      make: "SMITH & WESSON",
      caliber: ".350 LEGEND",
      serialNumber: "EEJ6562",
      action: "bolt",
      status: "PENDING",
      observations: "Routine inspection",
      createdAt: "2025-06-03T10:00:00Z",
      updatedAt: "2025-06-03T10:00:00Z",
    },
  ],
  users: [
    {
      id: "user_1",
      username: "admin",
      password: "admin123",
      role: "admin",
      fullName: "System Administrator",
      email: "admin@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_2",
      username: "manager",
      password: "manager123",
      role: "manager",
      fullName: "Operations Manager",
      email: "manager@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_3",
      username: "inspector",
      password: "inspector123",
      role: "inspector",
      fullName: "Firearm Inspector",
      email: "inspector@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_4",
      username: "wikus",
      password: "wikus123",
      role: "inspector",
      fullName: "Wikus Fourie",
      email: "wikus@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user_5",
      username: "Dymian",
      password: "Dymian@888",
      role: "admin",
      fullName: "Dymian Administrator",
      email: "dymian@gunworx.com",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
}

export async function restoreBackupData(backupData: BackupData): Promise<RestoreResult> {
  try {
    // Validate backup data structure
    if (!backupData || typeof backupData !== "object") {
      return {
        success: false,
        message: "Invalid backup data format",
        error: "Backup data must be a valid object",
      }
    }

    // Restore firearms if provided
    if (backupData.firearms && Array.isArray(backupData.firearms)) {
      applicationData.firearms = backupData.firearms
    }

    // Restore inspections if provided
    if (backupData.inspections && Array.isArray(backupData.inspections)) {
      applicationData.inspections = backupData.inspections
    }

    // Restore users if provided
    if (backupData.users && Array.isArray(backupData.users)) {
      applicationData.users = backupData.users
    }

    return {
      success: true,
      message: "Backup data restored successfully",
      restored: {
        firearms: applicationData.firearms.length,
        inspections: applicationData.inspections.length,
        users: applicationData.users.length,
      },
    }
  } catch (error) {
    console.error("Error restoring backup data:", error)
    return {
      success: false,
      message: "Failed to restore backup data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

export async function createBackup(): Promise<BackupData> {
  return {
    firearms: applicationData.firearms,
    inspections: applicationData.inspections,
    users: applicationData.users,
    timestamp: new Date().toISOString(),
  }
}

export function getApplicationData() {
  return applicationData
}

export function updateApplicationData(newData: Partial<typeof applicationData>) {
  applicationData = { ...applicationData, ...newData }
}

export function resetApplicationData() {
  applicationData = {
    firearms: [],
    inspections: [],
    users: [
      {
        id: "user_1",
        username: "admin",
        password: "admin123",
        role: "admin",
        fullName: "System Administrator",
        email: "admin@gunworx.com",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "user_5",
        username: "Dymian",
        password: "Dymian@888",
        role: "admin",
        fullName: "Dymian Administrator",
        email: "dymian@gunworx.com",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ],
  }
}
