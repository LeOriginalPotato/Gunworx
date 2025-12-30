// Firearms data management
let firearms = [
  // Original CO3 Entry
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
  // A-Series Entries (A01-A50)
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

// Generate additional sample data to reach 851 total items
function generateSampleData() {
  const makes = ["Glock", "CZ", "Taurus", "Walther", "Smith & Wesson", "Beretta", "Sig Sauer"]
  const types = ["Pistol", "Rifle", "Shotgun", "Revolver"]
  const calibers = ["9mm", ".22LR", "12GA", ".308", ".45ACP", ".40S&W", "7.62mm"]
  const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Lisa", "Robert", "Mary", "James", "Patricia"]
  const surnames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ]

  // Generate active items (101 total including existing ones)
  for (let i = 3; i <= 101; i++) {
    const make = makes[Math.floor(Math.random() * makes.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const caliber = calibers[Math.floor(Math.random() * calibers.length)]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const surname = surnames[Math.floor(Math.random() * surnames.length)]

    let status
    if (i <= 26) status = "dealer-stock"
    else if (i <= 76) status = "safe-keeping"
    else status = "in-stock"

    firearms.push({
      id: i.toString(),
      stockNo: `A${String(i).padStart(2, "0")}`,
      dateReceived: "2024-01-02",
      make: make,
      type: type,
      caliber: caliber,
      serialNo: `SN${1000 + i}`,
      fullName: firstName,
      surname: surname,
      registrationId: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      physicalAddress: `${i} Sample Street, City`,
      licenceNo: `${Math.floor(Math.random() * 50) + 1}/${Math.floor(Math.random() * 25) + 1}`,
      licenceDate: "2023-01-01",
      remarks: status === "dealer-stock" ? "Dealer Stock" : "Safekeeping",
      status: status,
    })
  }

  // Generate collected items (750 items)
  for (let i = 102; i <= 851; i++) {
    firearms.push({
      id: i.toString(),
      stockNo: "COLLECTED",
      originalStockNo: "workshop",
      dateReceived: "",
      make: "",
      type: "",
      caliber: "",
      serialNo: "",
      fullName: "",
      surname: "",
      registrationId: "",
      physicalAddress: "",
      licenceNo: "",
      licenceDate: "",
      dateDelivered: "2024-05-15",
      remarks: "Collected Paperwork 15/05/2024",
      status: "collected",
    })
  }
}

// Initialize sample data
generateSampleData()

// Data persistence functions
function saveToLocalStorage() {
  try {
    localStorage.setItem("gunworx_firearms", JSON.stringify(firearms))
    localStorage.setItem("gunworx_last_updated", new Date().toISOString())
  } catch (error) {
    console.warn("Could not save to localStorage:", error)
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem("gunworx_firearms")
    if (saved) {
      firearms = JSON.parse(saved)
      return true
    }
  } catch (error) {
    console.warn("Could not load from localStorage:", error)
  }
  return false
}

// Export functions
function exportToCSV(data, filename = "gunworx_firearms_export.csv") {
  const headers = [
    "ID",
    "Stock No",
    "Original Stock No",
    "Date Received",
    "Make",
    "Type",
    "Caliber",
    "Serial No",
    "Full Name",
    "Surname",
    "Registration ID",
    "Physical Address",
    "Licence No",
    "Licence Date",
    "Date Delivered",
    "Remarks",
    "Status",
  ]

  const csvContent = [
    headers.join(","),
    ...data.map((item) =>
      [
        item.id || "",
        `"${item.stockNo || ""}"`,
        `"${item.originalStockNo || ""}"`,
        item.dateReceived || "",
        `"${item.make || ""}"`,
        `"${item.type || ""}"`,
        `"${item.caliber || ""}"`,
        `"${item.serialNo || ""}"`,
        `"${item.fullName || ""}"`,
        `"${item.surname || ""}"`,
        `"${item.registrationId || ""}"`,
        `"${item.physicalAddress || ""}"`,
        `"${item.licenceNo || ""}"`,
        item.licenceDate || "",
        item.dateDelivered || "",
        `"${item.remarks || ""}"`,
        item.status || "",
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Data validation
function validateFirearm(firearm) {
  const errors = []

  if (!firearm.stockNo || firearm.stockNo.trim() === "") {
    errors.push("Stock Number is required")
  }

  if (!firearm.make || firearm.make.trim() === "") {
    errors.push("Make is required")
  }

  if (!firearm.serialNo || firearm.serialNo.trim() === "") {
    errors.push("Serial Number is required")
  }

  // Check for duplicate serial numbers
  const duplicate = firearms.find(
    (f) => f.id !== firearm.id && f.serialNo && f.serialNo.toLowerCase() === firearm.serialNo.toLowerCase(),
  )

  if (duplicate) {
    errors.push("Serial Number already exists")
  }

  return errors
}

// Initialize data on page load
document.addEventListener("DOMContentLoaded", () => {
  // Try to load from localStorage first
  if (!loadFromLocalStorage()) {
    // If no saved data, use generated sample data
    console.log("Using sample data")
  }

  // Auto-save every 30 seconds
  setInterval(saveToLocalStorage, 30000)

  // Save on page unload
  window.addEventListener("beforeunload", saveToLocalStorage)
})
