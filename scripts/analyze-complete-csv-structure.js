// Comprehensive analysis of the complete CSV file to ensure all 769 entries are captured
async function analyzeCompleteCSVStructure() {
  try {
    console.log("=== COMPLETE CSV ANALYSIS ===")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-bK1RSkPTCPIPLF7DwIh6halXT7htjk.csv",
    )
    const csvText = await response.text()

    console.log(`Raw CSV length: ${csvText.length} characters`)

    // Split into lines and analyze
    const allLines = csvText.split(/\r?\n/)
    console.log(`Total lines in CSV: ${allLines.length}`)

    // Remove empty lines
    const nonEmptyLines = allLines.filter((line) => line.trim().length > 0)
    console.log(`Non-empty lines: ${nonEmptyLines.length}`)

    // Show first 50 lines to understand structure
    console.log("\n=== FIRST 50 LINES ===")
    nonEmptyLines.slice(0, 50).forEach((line, index) => {
      console.log(`${index + 1}: ${line}`)
    })

    // Analyze sections
    const sections = []
    let currentSection = ""
    const sectionCounts = {}

    nonEmptyLines.forEach((line, index) => {
      const trimmedLine = line.trim().toLowerCase()

      // Check for section headers
      if (
        trimmedLine.includes("workshop") ||
        trimmedLine.includes("safe keeping") ||
        trimmedLine.includes("dealer stock") ||
        trimmedLine.includes("collected paperwork") ||
        trimmedLine.includes("section")
      ) {
        currentSection = line.trim()
        sections.push({ section: currentSection, startLine: index })
        sectionCounts[currentSection] = 0
        console.log(`\nFound section at line ${index + 1}: ${currentSection}`)
      }
    })

    console.log("\n=== SECTIONS FOUND ===")
    sections.forEach((section) => {
      console.log(`Section: ${section.section} (starts at line ${section.startLine + 1})`)
    })

    // Parse all data entries
    const allFirearms = []
    let currentSectionName = ""
    let dataRowCount = 0

    for (let i = 0; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i].trim()

      if (!line) continue

      // Update current section
      const lowerLine = line.toLowerCase()
      if (
        lowerLine.includes("workshop") ||
        lowerLine.includes("safe keeping") ||
        lowerLine.includes("dealer stock") ||
        lowerLine.includes("collected paperwork")
      ) {
        currentSectionName = line
        console.log(`\nProcessing section: ${currentSectionName}`)
        continue
      }

      // Skip obvious headers
      if (
        lowerLine.includes("stock no") ||
        lowerLine.includes("date received") ||
        lowerLine.includes("make") ||
        lowerLine.includes("type") ||
        lowerLine.includes("caliber") ||
        lowerLine.includes("serial") ||
        lowerLine.includes("full name") ||
        lowerLine.includes("surname")
      ) {
        continue
      }

      // Try to parse as data row
      const columns = parseCSVLine(line)

      // Check if this looks like a data row (has stock number in first column)
      if (columns.length >= 8 && columns[0] && columns[0].trim() !== "") {
        const stockNo = columns[0].trim()

        // Skip if stock number looks like a header
        if (
          stockNo.toLowerCase().includes("stock") ||
          stockNo.toLowerCase().includes("no") ||
          stockNo.toLowerCase().includes("date")
        ) {
          continue
        }

        dataRowCount++
        const firearm = {
          id: `firearm_${String(dataRowCount).padStart(4, "0")}`,
          stockNo: cleanField(columns[0]) || `STOCK_${dataRowCount}`,
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
          remarks: cleanField(columns[12]) || currentSectionName || "",
          status: determineStatus(currentSectionName, cleanField(columns[12]) || ""),
          section: currentSectionName,
          originalLine: i + 1,
        }

        allFirearms.push(firearm)

        // Log every 100th entry for progress
        if (dataRowCount % 100 === 0) {
          console.log(`Processed ${dataRowCount} entries...`)
          console.log(`Latest entry: ${firearm.stockNo} - ${firearm.make} ${firearm.type}`)
        }
      }
    }

    console.log(`\n=== FINAL RESULTS ===`)
    console.log(`Total firearms parsed: ${allFirearms.length}`)

    // Group by section
    const bySectionCounts = allFirearms.reduce((acc, firearm) => {
      const section = firearm.section || "Unknown"
      acc[section] = (acc[section] || 0) + 1
      return acc
    }, {})

    console.log("\nFirearms by section:")
    Object.entries(bySectionCounts).forEach(([section, count]) => {
      console.log(`  ${section}: ${count} firearms`)
    })

    // Group by status
    const byStatusCounts = allFirearms.reduce((acc, firearm) => {
      acc[firearm.status] = (acc[firearm.status] || 0) + 1
      return acc
    }, {})

    console.log("\nFirearms by status:")
    Object.entries(byStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} firearms`)
    })

    // Show sample entries from each section
    console.log("\n=== SAMPLE ENTRIES BY SECTION ===")
    const uniqueSections = [...new Set(allFirearms.map((f) => f.section))]
    uniqueSections.forEach((section) => {
      const sectionFirearms = allFirearms.filter((f) => f.section === section)
      console.log(`\n${section} (${sectionFirearms.length} total):`)
      sectionFirearms.slice(0, 3).forEach((firearm, index) => {
        console.log(`  ${index + 1}. ${firearm.stockNo} - ${firearm.make} ${firearm.type} (${firearm.serialNo})`)
      })
    })

    // Generate the complete TypeScript data
    console.log("\n=== GENERATING TYPESCRIPT DATA ===")

    const tsData = `// Complete firearms data from CSV - ALL ${allFirearms.length} entries
const completeFirearmsDatabase: Firearm[] = [
${allFirearms
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
    physicalAddress: "${firearm.physicalAddress.replace(/"/g, '\\"')}",
    licenceNo: "${firearm.licenceNo}",
    licenceDate: "${firearm.licenceDate}",
    remarks: "${firearm.remarks.replace(/"/g, '\\"')}",
    status: "${firearm.status}" as const,
  }${index < allFirearms.length - 1 ? "," : ""}`,
  )
  .join("\n")}
]`

    console.log(`Generated TypeScript data with ${allFirearms.length} entries`)
    console.log(`Data length: ${tsData.length} characters`)

    return allFirearms
  } catch (error) {
    console.error("Error analyzing CSV:", error)
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

// Execute the analysis
analyzeCompleteCSVStructure().then((firearms) => {
  console.log(`\n=== ANALYSIS COMPLETE ===`)
  console.log(`Successfully parsed ${firearms.length} firearms from CSV`)

  if (firearms.length < 700) {
    console.warn(`WARNING: Expected ~769 entries but only found ${firearms.length}`)
    console.log("This suggests some data may not be parsing correctly")
  } else {
    console.log("✅ Successfully captured all firearms data!")
  }
})
