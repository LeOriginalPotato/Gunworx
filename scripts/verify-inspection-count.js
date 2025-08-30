// Script to verify that all 496 inspection records are properly loaded

async function verifyInspectionCount() {
  try {
    console.log("🔍 Verifying inspection count...")

    // Fetch data from the API
    const response = await fetch("http://localhost:3000/api/data-migration?action=status")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log("📊 Current data counts:")
    console.log(`  - Firearms: ${data.counts.firearms}`)
    console.log(`  - Inspections: ${data.counts.inspections}`)
    console.log(`  - Users: ${data.counts.users}`)

    if (data.counts.inspections >= 495) {
      console.log("✅ SUCCESS: All 495+ inspection records are loaded!")
    } else {
      console.log(`❌ ERROR: Only ${data.counts.inspections} inspections found, expected 495+`)
    }

    // Fetch full data to verify structure
    const fullResponse = await fetch("http://localhost:3000/api/data-migration")
    const fullData = await fullResponse.json()

    if (fullData.data && fullData.data.inspections) {
      const inspections = fullData.data.inspections
      console.log(`\n📋 Inspection breakdown:`)

      // Count by status
      const statusCounts = inspections.reduce((acc, inspection) => {
        acc[inspection.status] = (acc[inspection.status] || 0) + 1
        return acc
      }, {})

      console.log(`  - PASSED: ${statusCounts.PASSED || 0}`)
      console.log(`  - PENDING: ${statusCounts.PENDING || 0}`)
      console.log(`  - pending: ${statusCounts.pending || 0}`)

      // Count by make
      const makeCounts = inspections.reduce((acc, inspection) => {
        acc[inspection.make] = (acc[inspection.make] || 0) + 1
        return acc
      }, {})

      console.log(`\n🔫 Inspection by make:`)
      Object.entries(makeCounts).forEach(([make, count]) => {
        console.log(`  - ${make}: ${count}`)
      })

      // Count by caliber
      const caliberCounts = inspections.reduce((acc, inspection) => {
        acc[inspection.caliber] = (acc[inspection.caliber] || 0) + 1
        return acc
      }, {})

      console.log(`\n🎯 Inspection by caliber:`)
      Object.entries(caliberCounts).forEach(([caliber, count]) => {
        console.log(`  - ${caliber}: ${count}`)
      })

      // Show first and last few inspections
      console.log(`\n📝 First 3 inspections:`)
      inspections.slice(0, 3).forEach((inspection, index) => {
        console.log(
          `  ${index + 1}. ${inspection.make} ${inspection.caliber} (${inspection.serialNumbers.barrel}) - ${inspection.status}`,
        )
      })

      console.log(`\n📝 Last 3 inspections:`)
      inspections.slice(-3).forEach((inspection, index) => {
        const actualIndex = inspections.length - 3 + index + 1
        console.log(
          `  ${actualIndex}. ${inspection.make} ${inspection.caliber} (${inspection.serialNumbers.barrel}) - ${inspection.status}`,
        )
      })
    }

    return data.counts.inspections
  } catch (error) {
    console.error("❌ Error verifying inspection count:", error)
    return 0
  }
}

// Run the verification
verifyInspectionCount().then((count) => {
  console.log(`\n🎯 Final count: ${count} inspection records`)
  process.exit(count >= 495 ? 0 : 1)
})
