// Fetch and analyze the safe keeping and dealer stock register CSV data
async function fetchSafeKeepingData() {
  try {
    console.log("Fetching safe keeping and dealer stock register data...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-bK1RSkPTCPIPLF7DwIh6halXT7htjk.csv",
    )
    const csvText = await response.text()

    console.log("Raw CSV data (first 1000 characters):")
    console.log(csvText.substring(0, 1000))

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Total lines: ${lines.length}`)

    // Find the header row and data structure
    console.log("\nFirst 10 lines:")
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`Line ${index}: ${line}`)
    })

    // Parse the data based on the structure
    const firearms = []
    let currentSection = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!line) continue

      // Check for section headers
      if (
        line.toLowerCase().includes("workshop") ||
        line.toLowerCase().includes("safe keeping") ||
        line.toLowerCase().includes("dealer stock")
      ) {
        currentSection = line
        console.log(`Found section: ${currentSection}`)
        continue
      }

      // Skip header-like lines
      if (
        line.toLowerCase().includes("stock no") ||
        line.toLowerCase().includes("date received") ||
        line.toLowerCase().includes("firearms stock")
      ) {
        continue
      }

      // Parse data lines
      const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""))

      if (columns.length >= 8 && columns[0] && columns[0] !== "") {
        const firearm = {
          stockNo: columns[0] || "",
          dateReceived: columns[1] || "",
          make: columns[2] || "",
          type: columns[3] || "",
          caliber: columns[4] || "",
          serialNo: columns[5] || "",
          fullName: columns[6] || "",
          surname: columns[7] || "",
          registrationId: columns[8] || "",
          physicalAddress: columns[9] || "",
          licenceNo: columns[10] || "",
          licenceDate: columns[11] || "",
          remarks: columns[12] || currentSection || "",
          status: determineStatus(currentSection, columns[12] || ""),
          section: currentSection,
        }

        firearms.push(firearm)
      }
    }

    console.log(`\nParsed ${firearms.length} firearms`)

    // Show sample entries
    console.log("\nSample entries:")
    firearms.slice(0, 5).forEach((firearm, index) => {
      console.log(`Entry ${index + 1}:`, firearm)
    })

    // Group by status
    const statusCounts = firearms.reduce((acc, firearm) => {
      acc[firearm.status] = (acc[firearm.status] || 0) + 1
      return acc
    }, {})

    console.log("\nStatus distribution:", statusCounts)

    return firearms
  } catch (error) {
    console.error("Error fetching safe keeping data:", error)
    return []
  }
}

function determineStatus(section, remarks) {
  const sectionLower = section.toLowerCase()
  const remarksLower = remarks.toLowerCase()

  if (sectionLower.includes("workshop") || remarksLower.includes("workshop")) {
    return "in-stock"
  } else if (sectionLower.includes("safe keeping") || remarksLower.includes("safe keeping")) {
    return "safe-keeping"
  } else if (sectionLower.includes("dealer stock") || remarksLower.includes("dealer")) {
    return "dealer-stock"
  } else if (remarksLower.includes("collected") || remarksLower.includes("collection")) {
    return "collected"
  } else {
    return "in-stock" // default
  }
}

// Execute the function
fetchSafeKeepingData().then((firearms) => {
  console.log("Safe keeping data fetch completed")
  console.log(`Total firearms processed: ${firearms.length}`)
})
