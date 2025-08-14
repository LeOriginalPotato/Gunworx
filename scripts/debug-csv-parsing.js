// Debug CSV parsing to find all 769 entries
async function debugCSVParsing() {
  try {
    console.log("🔍 DEBUGGING CSV PARSING - Finding all 769 entries")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-bK1RSkPTCPIPLF7DwIh6halXT7htjk.csv",
    )
    const csvText = await response.text()

    console.log(`📄 Raw CSV size: ${csvText.length} characters`)

    // Try different line splitting methods
    const lineBreakTypes = [
      { name: "\\n", lines: csvText.split("\n") },
      { name: "\\r\\n", lines: csvText.split("\r\n") },
      { name: "\\r", lines: csvText.split("\r") },
      { name: "regex \\r?\\n", lines: csvText.split(/\r?\n/) },
    ]

    lineBreakTypes.forEach(({ name, lines }) => {
      const nonEmpty = lines.filter((line) => line.trim().length > 0)
      console.log(`${name}: ${lines.length} total lines, ${nonEmpty.length} non-empty`)
    })

    // Use the most effective splitting method
    const allLines = csvText.split(/\r?\n/)
    const nonEmptyLines = allLines.filter((line) => line.trim().length > 0)

    console.log(`\n📋 Working with ${nonEmptyLines.length} non-empty lines`)

    // Show first 100 lines to understand structure
    console.log("\n=== FIRST 100 LINES FOR STRUCTURE ANALYSIS ===")
    nonEmptyLines.slice(0, 100).forEach((line, index) => {
      console.log(`${String(index + 1).padStart(3, "0")}: ${line}`)
    })

    // Look for patterns that might indicate data rows
    console.log("\n=== ANALYZING LINE PATTERNS ===")

    let potentialDataRows = 0
    let headerRows = 0
    let sectionRows = 0
    const emptyRows = 0

    const dataRowPatterns = []

    nonEmptyLines.forEach((line, index) => {
      const trimmed = line.trim()
      const lower = trimmed.toLowerCase()

      // Count commas to estimate columns
      const commaCount = (line.match(/,/g) || []).length

      // Check for section headers
      if (
        lower.includes("workshop") ||
        lower.includes("safe keeping") ||
        lower.includes("dealer stock") ||
        lower.includes("collected paperwork")
      ) {
        sectionRows++
        console.log(`SECTION at line ${index + 1}: ${trimmed}`)
        return
      }

      // Check for obvious headers
      if (
        lower.includes("stock no") ||
        lower.includes("date received") ||
        lower.includes("make") ||
        lower.includes("type") ||
        lower.includes("caliber") ||
        lower.includes("serial")
      ) {
        headerRows++
        console.log(`HEADER at line ${index + 1}: ${trimmed}`)
        return
      }

      // Check for potential data rows (has multiple commas and doesn't look like header)
      if (commaCount >= 7 && trimmed.length > 10) {
        const columns = parseCSVLine(line)
        const firstCol = columns[0] ? columns[0].trim() : ""

        // Skip if first column looks like a header
        if (
          !firstCol.toLowerCase().includes("stock") &&
          !firstCol.toLowerCase().includes("no") &&
          !firstCol.toLowerCase().includes("date") &&
          !firstCol.toLowerCase().includes("make") &&
          firstCol.length > 0
        ) {
          potentialDataRows++

          if (potentialDataRows <= 10) {
            console.log(
              `DATA ROW ${potentialDataRows} at line ${index + 1}: ${firstCol} | ${columns.slice(1, 4).join(" | ")}`,
            )
          }

          dataRowPatterns.push({
            lineNumber: index + 1,
            commas: commaCount,
            firstColumn: firstCol,
            columns: columns.length,
            sample: columns.slice(0, 5).join(" | "),
          })
        }
      }
    })

    console.log(`\n📊 PATTERN ANALYSIS RESULTS:`)
    console.log(`Section rows: ${sectionRows}`)
    console.log(`Header rows: ${headerRows}`)
    console.log(`Potential data rows: ${potentialDataRows}`)

    if (potentialDataRows < 700) {
      console.log(`\n⚠️ ISSUE: Only found ${potentialDataRows} potential data rows, expected ~769`)
      console.log(`\n🔍 Let's examine the CSV structure more carefully...`)

      // Look for different patterns
      console.log("\n=== EXAMINING ALL LINES WITH 5+ COMMAS ===")
      let alternativeDataRows = 0

      nonEmptyLines.forEach((line, index) => {
        const commaCount = (line.match(/,/g) || []).length
        if (commaCount >= 5) {
          const columns = parseCSVLine(line)
          const firstCol = columns[0] ? columns[0].trim() : ""

          alternativeDataRows++
          if (alternativeDataRows <= 20) {
            console.log(`Line ${index + 1} (${commaCount} commas): ${firstCol} | ${columns.slice(1, 3).join(" | ")}`)
          }
        }
      })

      console.log(`\nFound ${alternativeDataRows} lines with 5+ commas`)
    }

    // Try to parse all potential data
    console.log(`\n🔄 ATTEMPTING TO PARSE ALL DATA...`)

    const allFirearms = []
    let currentSection = ""
    let dataRowCount = 0

    for (let i = 0; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i].trim()
      const lower = line.toLowerCase()

      // Update current section
      if (
        lower.includes("workshop") ||
        lower.includes("safe keeping") ||
        lower.includes("dealer stock") ||
        lower.includes("collected paperwork")
      ) {
        currentSection = line
        continue
      }

      // Skip obvious headers
      if (
        lower.includes("stock no") ||
        lower.includes("date received") ||
        lower.includes("make") ||
        lower.includes("type") ||
        lower.includes("caliber") ||
        lower.includes("serial") ||
        lower.includes("full name") ||
        lower.includes("surname")
      ) {
        continue
      }

      // Try to parse as data row - be more lenient
      const columns = parseCSVLine(line)

      if (columns.length >= 5) {
        // Reduced from 8 to 5 to catch more rows
        const stockNo = columns[0] ? columns[0].trim() : ""

        // More lenient stock number validation
        if (
          stockNo.length > 0 &&
          !stockNo.toLowerCase().includes("stock") &&
          !stockNo.toLowerCase().includes("no") &&
          !stockNo.toLowerCase().includes("date") &&
          !stockNo.toLowerCase().includes("make")
        ) {
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
            section: currentSection,
            lineNumber: i + 1,
          }

          allFirearms.push(firearm)

          if (dataRowCount <= 10 || dataRowCount % 100 === 0) {
            console.log(`Entry ${dataRowCount}: ${firearm.stockNo} - ${firearm.make} ${firearm.type}`)
          }
        }
      }
    }

    console.log(`\n✅ FINAL PARSING RESULTS:`)
    console.log(`Total firearms parsed: ${allFirearms.length}`)

    if (allFirearms.length >= 700) {
      console.log(`🎉 SUCCESS: Found ${allFirearms.length} firearms (expected ~769)`)
    } else {
      console.log(`❌ STILL MISSING DATA: Only found ${allFirearms.length} firearms`)

      // Show sample of what we're missing
      console.log(`\n🔍 SAMPLE OF UNPARSED LINES:`)
      let unparsedCount = 0
      for (let i = 0; i < Math.min(nonEmptyLines.length, 200); i++) {
        const line = nonEmptyLines[i].trim()
        const lower = line.toLowerCase()

        if (
          !lower.includes("workshop") &&
          !lower.includes("safe keeping") &&
          !lower.includes("dealer stock") &&
          !lower.includes("collected") &&
          !lower.includes("stock no") &&
          !lower.includes("date received") &&
          !lower.includes("make") &&
          !lower.includes("type")
        ) {
          const columns = parseCSVLine(line)
          if (columns.length >= 3) {
            unparsedCount++
            if (unparsedCount <= 10) {
              console.log(`Unparsed line ${i + 1}: ${columns.slice(0, 3).join(" | ")}`)
            }
          }
        }
      }
    }

    // Group by section for analysis
    const bySectionCounts = allFirearms.reduce((acc, firearm) => {
      const section = firearm.section || "Unknown"
      acc[section] = (acc[section] || 0) + 1
      return acc
    }, {})

    console.log("\n📈 Firearms by section:")
    Object.entries(bySectionCounts).forEach(([section, count]) => {
      console.log(`  ${section}: ${count} firearms`)
    })

    return allFirearms
  } catch (error) {
    console.error("❌ Error in debug parsing:", error)
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
    return "in-stock"
  }
}

// Execute the debug analysis
debugCSVParsing().then((firearms) => {
  console.log(`\n🏁 DEBUG ANALYSIS COMPLETE`)
  console.log(`Final count: ${firearms.length} firearms`)

  if (firearms.length < 700) {
    console.log(`\n💡 RECOMMENDATIONS:`)
    console.log(`1. Check if CSV has different structure than expected`)
    console.log(`2. Look for merged cells or unusual formatting`)
    console.log(`3. Verify the CSV file contains all expected data`)
    console.log(`4. Consider manual inspection of the CSV file`)
  }
})
