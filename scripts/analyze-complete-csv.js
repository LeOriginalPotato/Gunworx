// Fetch and analyze the complete CSV data to get all 700+ entries
async function analyzeCompleteCSV() {
  try {
    console.log("Fetching complete CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-bqaLG5BSlUIWbLjYL62qwIXiDm48ZH.csv",
    )
    const csvText = await response.text()

    console.log("Raw CSV length:", csvText.length)

    // Split into lines and filter out empty ones
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim())
    console.log(`Total lines found: ${lines.length}`)

    // Parse each line more carefully
    const entries = []
    const currentEntry = {}
    const fieldIndex = 0

    // Expected fields based on the schema
    const fields = ["stockNo", "remarks"]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // Try different parsing approaches
        console.log(`Line ${i + 1}: "${line}"`)

        // Split by comma and clean up quotes
        const values = line.split(",").map((val) => val.replace(/^["']|["']$/g, "").trim())

        entries.push({
          lineNumber: i + 1,
          rawLine: line,
          values: values,
          stockNo: values[0] || "",
          remarks: values[1] || "",
          allFields: values,
        })
      }
    }

    console.log(`\nParsed ${entries.length} total entries`)

    // Show first 20 entries to understand the pattern
    console.log("\nFirst 20 entries:")
    entries.slice(0, 20).forEach((entry, index) => {
      console.log(`Entry ${index + 1}:`)
      console.log(`  Stock: "${entry.stockNo}"`)
      console.log(`  Remarks: "${entry.remarks}"`)
      console.log(`  All values: [${entry.allFields.map((v) => `"${v}"`).join(", ")}]`)
      console.log(`  Raw: ${entry.rawLine}`)
      console.log("---")
    })

    // Show last 20 entries
    console.log("\nLast 20 entries:")
    entries.slice(-20).forEach((entry, index) => {
      const actualIndex = entries.length - 20 + index + 1
      console.log(`Entry ${actualIndex}:`)
      console.log(`  Stock: "${entry.stockNo}"`)
      console.log(`  Remarks: "${entry.remarks}"`)
      console.log(`  All values: [${entry.allFields.map((v) => `"${v}"`).join(", ")}]`)
      console.log(`  Raw: ${entry.rawLine}`)
      console.log("---")
    })

    // Analyze patterns
    const stockNumbers = new Set()
    const remarksSet = new Set()

    entries.forEach((entry) => {
      if (entry.stockNo) stockNumbers.add(entry.stockNo)
      if (entry.remarks) remarksSet.add(entry.remarks)
    })

    console.log(`\nUnique stock numbers: ${stockNumbers.size}`)
    console.log("Stock numbers:", Array.from(stockNumbers).slice(0, 20))

    console.log(`\nUnique remarks: ${remarksSet.size}`)
    console.log("Remarks:", Array.from(remarksSet).slice(0, 10))

    // Check for different entry types
    const workshopEntries = entries.filter((e) => e.stockNo.toLowerCase().includes("workshop"))
    const collectedEntries = entries.filter((e) => e.remarks.toLowerCase().includes("collected"))
    const paperworkEntries = entries.filter((e) => e.remarks.toLowerCase().includes("paperwork"))

    console.log(`\nWorkshop entries: ${workshopEntries.length}`)
    console.log(`Collected entries: ${collectedEntries.length}`)
    console.log(`Paperwork entries: ${paperworkEntries.length}`)

    return entries
  } catch (error) {
    console.error("Error analyzing CSV:", error)
    return []
  }
}

// Execute the analysis
analyzeCompleteCSV()
