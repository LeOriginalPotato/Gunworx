// Extract ALL data from CSV and generate complete hardcoded dataset
async function extractAllCSVData() {
  try {
    console.log("🚀 EXTRACTING ALL 769+ ENTRIES FROM CSV...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-bK1RSkPTCPIPLF7DwIh6halXT7htjk.csv",
    )
    const csvText = await response.text()

    console.log(`📄 CSV loaded: ${csvText.length} characters`)

    // Split lines using multiple methods to catch all variations
    let allLines = csvText.split(/\r?\n/)
    if (allLines.length < 100) {
      allLines = csvText.split(/\r/)
    }
    if (allLines.length < 100) {
      allLines = csvText.split(/\n/)
    }

    const nonEmptyLines = allLines.filter((line) => line.trim().length > 0)
    console.log(`📋 Processing ${nonEmptyLines.length} non-empty lines`)

    const firearms = []
    let currentSection = ""
    let dataRowCount = 0

    // Ultra-aggressive parsing to extract ALL data
    for (let i = 0; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i].trim()
      if (!line) continue

      const lowerLine = line.toLowerCase()

      // Update current section
      if (
        lowerLine.includes("workshop") ||
        lowerLine.includes("safe keeping") ||
        lowerLine.includes("dealer stock") ||
        lowerLine.includes("collected paperwork") ||
        lowerLine.includes("section") ||
        lowerLine.includes("register")
      ) {
        currentSection = line
        console.log(`📂 Section: ${line}`)
        continue
      }

      // Skip obvious headers but be very specific
      const isObviousHeader =
        (lowerLine.includes("stock no") && lowerLine.includes("date")) ||
        (lowerLine.includes("make") && lowerLine.includes("type") && lowerLine.includes("caliber")) ||
        (lowerLine.includes("full name") && lowerLine.includes("surname")) ||
        lowerLine.includes("registration") ||
        lowerLine.includes("licence") ||
        lowerLine.includes("license") ||
        lowerLine.includes("physical address") ||
        lowerLine === "stock no" ||
        lowerLine === "date received" ||
        lowerLine === "make" ||
        lowerLine === "type"

      if (isObviousHeader) continue

      // Parse potential data row
      const columns = parseCSVLine(line)

      if (columns.length >= 1) {
        const stockNo = cleanField(columns[0])

        // Very lenient validation - accept almost anything that looks like data
        const isValidData =
          stockNo.length > 0 &&
          stockNo !== "1" &&
          stockNo !== "2" &&
          stockNo !== "3" &&
          stockNo !== "4" &&
          stockNo !== "5" &&
          !stockNo.toLowerCase().includes("stock no") &&
          !stockNo.toLowerCase().includes("date received") &&
          !(stockNo.toLowerCase().includes("make") && columns.length < 3) &&
          !stockNo.toLowerCase().includes("full name") &&
          !stockNo.toLowerCase().includes("surname") &&
          !stockNo.toLowerCase().includes("registration") &&
          !stockNo.toLowerCase().includes("licence") &&
          !stockNo.toLowerCase().includes("license") &&
          !stockNo.toLowerCase().includes("physical address") &&
          stockNo !== "" &&
          stockNo !== " "

        if (isValidData) {
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
            remarks: cleanField(columns[12]) || currentSection || "",
            status: determineStatus(currentSection, cleanField(columns[12]) || ""),
          }

          firearms.push(firearm)

          if (dataRowCount <= 50 || dataRowCount % 100 === 0) {
            console.log(`⚡ Entry ${dataRowCount}: ${firearm.stockNo} - ${firearm.make} ${firearm.type}`)
          }
        }
      }
    }

    console.log(`✅ EXTRACTION COMPLETE: ${firearms.length} firearms found`)
    console.log(`📊 Status breakdown:`)
    const stats = {
      inStock: firearms.filter((f) => f.status === "in-stock").length,
      dealerStock: firearms.filter((f) => f.status === "dealer-stock").length,
      safeKeeping: firearms.filter((f) => f.status === "safe-keeping").length,
      collected: firearms.filter((f) => f.status === "collected").length,
    }
    console.log(`   - In Stock: ${stats.inStock}`)
    console.log(`   - Dealer Stock: ${stats.dealerStock}`)
    console.log(`   - Safe Keeping: ${stats.safeKeeping}`)
    console.log(`   - Collected: ${stats.collected}`)

    return firearms
  } catch (error) {
    console.error("❌ Error extracting CSV data:", error)
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
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i += 2
        continue
      }
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

function escapeString(str) {
  if (!str) return ""
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r")
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
    return "in-stock"
  }
}

// Execute the extraction
extractAllCSVData()
