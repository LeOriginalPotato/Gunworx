// Fetch and parse the CSV data
async function fetchCSVData() {
  try {
    console.log("Fetching CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-bqaLG5BSlUIWbLjYL62qwIXiDm48ZH.csv",
    )
    const csvText = await response.text()

    console.log("CSV Content:")
    console.log(csvText)

    // Parse CSV manually
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`Found ${lines.length} lines in CSV`)

    // Show first few lines to understand structure
    console.log("\nFirst 10 lines:")
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`Line ${index + 1}: ${line}`)
    })

    // Parse each line
    const entries = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // Split by comma, handling quoted values
        const values = line.split(",").map((val) => val.replace(/^"|"$/g, "").trim())
        entries.push({
          lineNumber: i + 1,
          values: values,
          rawLine: line,
        })
      }
    }

    console.log(`\nParsed ${entries.length} entries`)

    // Show structure of entries
    console.log("\nSample entries:")
    entries.slice(0, 5).forEach((entry) => {
      console.log(`Entry ${entry.lineNumber}:`, entry.values)
    })

    return entries
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return []
  }
}

// Execute the function
fetchCSVData()
