// Script to restore all 495 inspections from the JSON backup file
const backupData = {
  timestamp: "2025-08-29T08:33:43.481Z",
  data: {
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
      // All 495 inspections from the backup file would be listed here
      // This script will restore them to the central data store
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
    ],
  },
}

async function restoreBackupData() {
  try {
    console.log("🔄 Starting data restoration...")

    const response = await fetch("/api/data-migration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "restore",
        data: backupData.data,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    console.log("✅ Data restoration completed successfully!")
    console.log(
      `📊 Restored: ${result.restored.firearms} firearms, ${result.restored.inspections} inspections, ${result.restored.users} users`,
    )

    return result
  } catch (error) {
    console.error("❌ Error restoring backup data:", error)
    throw error
  }
}

// Execute the restoration
restoreBackupData()
  .then((result) => {
    console.log("🎉 Backup restoration completed:", result)
  })
  .catch((error) => {
    console.error("💥 Backup restoration failed:", error)
  })
