// Fetch and process the CSV data from the provided URL
async function fetchCSVData() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/safe%20keeping%20and%20dealer%20stock%20registar-31hmsCegEOMQapeGPystr3gGCpZw83.csv",
    )
    const csvText = await response.text()

    console.log("CSV Data fetched successfully")
    console.log("First 500 characters:", csvText.substring(0, 500))

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))

    console.log("Headers:", headers)

    const csvData = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim().replace(/"/g, ""))
      if (values.length >= 2 && values[0] && values[1]) {
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        csvData.push(row)
      }
    }

    console.log("Parsed CSV data:", csvData)
    console.log("Total CSV records:", csvData.length)

    return csvData
  } catch (error) {
    console.error("Error fetching CSV data:", error)
    return []
  }
}

// Execute the function
fetchCSVData()
