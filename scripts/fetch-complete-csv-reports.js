// Fetch and process ALL CSV data from the provided URL
async function fetchCompleteCSVReports() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SAMPLE%20OF%20REPORTS%20%281%29-pEPnM8A5UhARpWM2PkgJ4s7SmdfcNb.csv",
    )
    const csvText = await response.text()

    console.log("Complete CSV Reports Data fetched successfully")
    console.log("Full CSV content:")
    console.log(csvText)

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log("Total lines in CSV:", lines.length)

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

    console.log("Total CSV records parsed:", csvData.length)
    console.log("All CSV data:")
    csvData.forEach((record, index) => {
      console.log(`Record ${index + 1}:`, record)
    })

    // Generate JavaScript code for the firearms array
    console.log("\n=== GENERATED JAVASCRIPT CODE ===")
    console.log("// CSV Data converted to JavaScript objects:")

    csvData.forEach((record, index) => {
      const id = `csv_${index + 1}`
      const stockNo = record[headers[0]] || `CSV${index + 1}`
      const dateReceived = "2024-01-15" // Default date
      const make = record[headers[1]] || "Unknown"
      const type = record[headers[2]] || "Firearm"
      const caliber = record[headers[3]] || "Unknown"
      const serialNo = record[headers[4]] || `SN${index + 1}`
      const fullName = record[headers[5]] || "Unknown"
      const surname = record[headers[6]] || "Owner"
      const registrationId = record[headers[7]] || "0000000000000"
      const physicalAddress = record[headers[8]] || "Unknown Address"
      const licenceNo = record[headers[9]] || `LIC${index + 1}`
      const licenceDate = "2024-01-20"
      const remarks = record[headers[10]] || `CSV Report ${index + 1}`
      const status = ["in-stock", "dealer-stock", "safe-keeping", "collected"][index % 4]

      console.log(`{
  id: "${id}",
  stockNo: "${stockNo}",
  dateReceived: "${dateReceived}",
  make: "${make}",
  type: "${type}",
  caliber: "${caliber}",
  serialNo: "${serialNo}",
  fullName: "${fullName}",
  surname: "${surname}",
  registrationId: "${registrationId}",
  physicalAddress: "${physicalAddress}",
  licenceNo: "${licenceNo}",
  licenceDate: "${licenceDate}",
  remarks: "${remarks}",
  status: "${status}",
},`)
    })

    return csvData
  } catch (error) {
    console.error("Error fetching complete CSV reports data:", error)
    return []
  }
}

// Execute the function
fetchCompleteCSVReports()
