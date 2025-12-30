// Fetch and parse the complete safe keeping and dealer stock register CSV data
async function fetchCompleteSafeKeepingData() {
  try {
    console.log("Fetching complete safe keeping and dealer stock register data...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-bK1RSkPTCPIPLF7DwIh6halXT7htjk.csv",
    )
    const csvText = await response.text()

    console.log("Raw CSV data length:", csvText.length)
    console.log("First 2000 characters:")
    console.log(csvText.substring(0, 2000))

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Total lines: ${lines.length}`)

    // Show structure analysis
    console.log("\nFirst 20 lines for structure analysis:")
    lines.slice(0, 20).forEach((line, index) => {
      console.log(`Line ${index}: ${line}`)
    })

    const firearms = []
    let currentSection = ""
    let idCounter = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!line) continue

      // Check for section headers
      if (
        line.toLowerCase().includes("workshop") ||
        line.toLowerCase().includes("safe keeping") ||
        line.toLowerCase().includes("dealer stock") ||
        line.toLowerCase().includes("collected paperwork")
      ) {
        currentSection = line
        console.log(`Found section: ${currentSection}`)
        continue
      }

      // Skip header-like lines
      if (
        line.toLowerCase().includes("stock no") ||
        line.toLowerCase().includes("date received") ||
        line.toLowerCase().includes("firearms stock") ||
        line.toLowerCase().includes("make") ||
        line.toLowerCase().includes("type") ||
        line.toLowerCase().includes("caliber")
      ) {
        continue
      }

      // Parse data lines - handle CSV with potential commas in quoted fields
      const columns = parseCSVLine(line)

      // Validate we have enough columns and a stock number
      if (columns.length >= 8 && columns[0] && columns[0].trim() !== "") {
        const firearm = {
          id: `firearm_${String(idCounter).padStart(4, "0")}`,
          stockNo: cleanField(columns[0]) || `STOCK_${idCounter}`,
          dateReceived: cleanField(columns[1]) || "",
          make: cleanField(columns[2]) || "",
          type: cleanField(columns[3]) || "",
          caliber: cleanField(columns[4]) || "",
          serialNo: cleanField(columns[5]) || "",
          fullName: cleanField(columns[6]) || "",
          surname: cleanField(columns[7]) || "",
          registrationId: cleanField(columns[8]) || "",
          physicalAddress: cleanField(columns[9]) || "",
          licenceNo: cleanField(columns[10]) || "",
          licenceDate: cleanField(columns[11]) || "",
          remarks: cleanField(columns[12]) || currentSection || "",
          status: determineStatus(currentSection, cleanField(columns[12]) || ""),
          section: currentSection,
        }

        firearms.push(firearm)
        idCounter++
      }
    }

    console.log(`\nParsed ${firearms.length} firearms`)

    // Show sample entries from different sections
    console.log("\nSample entries by section:")
    const sections = [...new Set(firearms.map((f) => f.section))]
    sections.forEach((section) => {
      const sectionFirearms = firearms.filter((f) => f.section === section)
      console.log(`\n${section}: ${sectionFirearms.length} items`)
      if (sectionFirearms.length > 0) {
        console.log("Sample:", sectionFirearms[0])
      }
    })

    // Group by status
    const statusCounts = firearms.reduce((acc, firearm) => {
      acc[firearm.status] = (acc[firearm.status] || 0) + 1
      return acc
    }, {})

    console.log("\nStatus distribution:", statusCounts)

    return firearms
  } catch (error) {
    console.error("Error fetching complete safe keeping data:", error)
    return []
  }
}

function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
      i++
      continue
    } else {
      current += char
    }
    i++
  }

  result.push(current)
  return result
}

function cleanField(field) {
  if (!field) return ""
  return field.toString().trim().replace(/^"|"$/g, "").replace(/""/g, '"')
}

function determineStatus(section, remarks) {
  const sectionLower = (section || "").toLowerCase()
  const remarksLower = (remarks || "").toLowerCase()

  if (sectionLower.includes("workshop") || remarksLower.includes("workshop")) {
    return "in-stock"
  } else if (sectionLower.includes("safe keeping") || remarksLower.includes("safe keeping")) {
    return "safe-keeping"
  } else if (sectionLower.includes("dealer stock") || remarksLower.includes("dealer")) {
    return "dealer-stock"
  } else if (
    sectionLower.includes("collected") ||
    remarksLower.includes("collected") ||
    remarksLower.includes("collection")
  ) {
    return "collected"
  } else {
    return "in-stock" // default
  }
}

// Execute the function
fetchCompleteSafeKeepingData().then((firearms) => {
  console.log("Complete safe keeping data fetch completed")
  console.log(`Total firearms processed: ${firearms.length}`)

  // Generate TypeScript interface for the data
  console.log("\nGenerating firearms data for TypeScript...")

  const tsData = `// Generated firearms data from CSV - ${firearms.length} total items
const completeFirearmsData: Firearm[] = [
${firearms
  .map(
    (firearm, index) => `  {
    id: "${firearm.id}",
    stockNo: "${firearm.stockNo}",
    dateReceived: "${firearm.dateReceived}",
    make: "${firearm.make}",
    type: "${firearm.type}",
    caliber: "${firearm.caliber}",
    serialNo: "${firearm.serialNo}",
    fullName: "${firearm.fullName}",
    surname: "${firearm.surname}",
    registrationId: "${firearm.registrationId}",
    physicalAddress: "${firearm.physicalAddress}",
    licenceNo: "${firearm.licenceNo}",
    licenceDate: "${firearm.licenceDate}",
    remarks: "${firearm.remarks.replace(/"/g, '\\"')}",
    status: "${firearm.status}" as const,
  }${index < firearms.length - 1 ? "," : ""}`,
  )
  .join("\n")}
]`

  console.log("TypeScript data generated. Length:", tsData.length)
  console.log("First 1000 characters of generated data:")
  console.log(tsData.substring(0, 1000))
})
