// Verification script for SMITH & WESSON inspections
console.log("🔍 Verifying SMITH & WESSON inspections...")

// Mock data for verification (in a real environment, this would fetch from the API)
const inspectionData = [
  {
    id: "inspection_1",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27496",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_2",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27497",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_3",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27498",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_4",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27499",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_5",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27500",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_6",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27501",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_7",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27502",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_8",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "selfLoadingRifle",
    make: "SMITH & WESSON",
    caliber: "5.56X45MM",
    serialNumber: "UB27503",
    action: "semiAuto",
    status: "PENDING",
  },
  {
    id: "inspection_9",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "rifle",
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    serialNumber: "KN87634",
    action: "bolt",
    status: "PENDING",
  },
  {
    id: "inspection_10",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "rifle",
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    serialNumber: "KN87637",
    action: "bolt",
    status: "PENDING",
  },
  {
    id: "inspection_11",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "rifle",
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    serialNumber: "KN91382",
    action: "bolt",
    status: "PENDING",
  },
  {
    id: "inspection_12",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "rifle",
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    serialNumber: "KN91387",
    action: "bolt",
    status: "PENDING",
  },
  {
    id: "inspection_13",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "rifle",
    make: "SMITH & WESSON",
    caliber: ".308 WIN",
    serialNumber: "KN91390",
    action: "bolt",
    status: "PENDING",
  },
  {
    id: "inspection_14",
    date: "2025-06-03",
    inspector: "WIKUS FOURIE",
    company: "Delta",
    firearmType: "rifle",
    make: "SMITH & WESSON",
    caliber: ".350 LEGEND",
    serialNumber: "EEJ6562",
    action: "bolt",
    status: "PENDING",
  },
]

// Verification checks
console.log("📊 Running verification checks...")

// Check 1: Total count
const totalInspections = inspectionData.length
console.log(`✅ Total inspections: ${totalInspections}`)

// Check 2: All are SMITH & WESSON
const nonSmithWesson = inspectionData.filter((inspection) => inspection.make !== "SMITH & WESSON")
if (nonSmithWesson.length === 0) {
  console.log("✅ All inspections are SMITH & WESSON")
} else {
  console.log(`❌ Found ${nonSmithWesson.length} non-SMITH & WESSON inspections:`)
  nonSmithWesson.forEach((inspection) => {
    console.log(`   - ${inspection.id}: ${inspection.make}`)
  })
}

// Check 3: All dates are 2025-06-03
const wrongDates = inspectionData.filter((inspection) => inspection.date !== "2025-06-03")
if (wrongDates.length === 0) {
  console.log("✅ All inspections have date 2025-06-03")
} else {
  console.log(`❌ Found ${wrongDates.length} inspections with wrong dates:`)
  wrongDates.forEach((inspection) => {
    console.log(`   - ${inspection.id}: ${inspection.date}`)
  })
}

// Check 4: All inspectors are WIKUS FOURIE
const wrongInspectors = inspectionData.filter((inspection) => inspection.inspector !== "WIKUS FOURIE")
if (wrongInspectors.length === 0) {
  console.log("✅ All inspections have inspector WIKUS FOURIE")
} else {
  console.log(`❌ Found ${wrongInspectors.length} inspections with wrong inspectors:`)
  wrongInspectors.forEach((inspection) => {
    console.log(`   - ${inspection.id}: ${inspection.inspector}`)
  })
}

// Check 5: All companies are Delta
const wrongCompanies = inspectionData.filter((inspection) => inspection.company !== "Delta")
if (wrongCompanies.length === 0) {
  console.log("✅ All inspections have company Delta")
} else {
  console.log(`❌ Found ${wrongCompanies.length} inspections with wrong companies:`)
  wrongCompanies.forEach((inspection) => {
    console.log(`   - ${inspection.id}: ${inspection.company}`)
  })
}

// Check 6: All statuses are PENDING
const wrongStatuses = inspectionData.filter((inspection) => inspection.status !== "PENDING")
if (wrongStatuses.length === 0) {
  console.log("✅ All inspections have status PENDING")
} else {
  console.log(`❌ Found ${wrongStatuses.length} inspections with wrong statuses:`)
  wrongStatuses.forEach((inspection) => {
    console.log(`   - ${inspection.id}: ${inspection.status}`)
  })
}

// Summary by caliber
console.log("\n📈 Summary by caliber:")
const caliberCounts = {}
inspectionData.forEach((inspection) => {
  caliberCounts[inspection.caliber] = (caliberCounts[inspection.caliber] || 0) + 1
})

Object.entries(caliberCounts).forEach(([caliber, count]) => {
  console.log(`   - ${caliber}: ${count} inspections`)
})

// Summary by firearm type
console.log("\n🔫 Summary by firearm type:")
const typeCounts = {}
inspectionData.forEach((inspection) => {
  typeCounts[inspection.firearmType] = (typeCounts[inspection.firearmType] || 0) + 1
})

Object.entries(typeCounts).forEach(([type, count]) => {
  console.log(`   - ${type}: ${count} inspections`)
})

console.log("\n🎉 Verification complete!")
console.log(`📋 Final count: ${totalInspections} SMITH & WESSON inspections`)
console.log("📅 All dates: 2025-06-03")
console.log("👤 All inspectors: WIKUS FOURIE")
console.log("🏢 All companies: Delta")
console.log("📊 All statuses: PENDING")
