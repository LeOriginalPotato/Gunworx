// Fetch and process the CSV data from the provided URL
async function fetchCSVReports() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAMPLE%20OF%20REPORTS%20%281%29-pEPnM8A5UhARpWM2PkgJ4s7SmdfcNb.csv",
    )
    const csvText = await response.text()

    console.log("CSV Reports Data fetched successfully")
    console.log("First 1000 characters:", csvText.substring(0, 1000))

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log("Total lines:", lines.length)

    // Get headers from first line
    const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))
    console.log("Headers:", headers)

    const csvData = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim().replace(/"/g, ""))
      if (values.length >= 1 && values[0]) {
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        csvData.push(row)
      }
    }

    console.log("Parsed CSV reports data:", csvData)
    console.log("Total CSV records:", csvData.length)

    // Display sample records
    console.log("Sample records:")
    csvData.slice(0, 5).forEach((record, index) => {
      console.log(`Record ${index + 1}:`, record)
    })

    return csvData
  } catch (error) {
    console.error("Error fetching CSV reports data:", error)
    return []
  }
}

// Execute the function
fetchCSVReports()
