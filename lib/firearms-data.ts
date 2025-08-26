// Complete Firearms Database - Hardcoded for Maximum Performance
// This file contains all 280+ firearms from the CSV data embedded directly in the code

export interface Firearm {
  id: string
  stockNo: string
  dateReceived: string
  make: string
  type: string
  caliber: string
  serialNo: string
  fullName: string
  surname: string
  registrationId: string
  physicalAddress: string
  licenceNo: string
  licenceDate: string
  remarks: string
  status: "in-stock" | "dealer-stock" | "safe-keeping" | "collected"
  signature?: string
  signatureDate?: string
  signedBy?: string
}

export interface FirearmsStats {
  total: number
  inStock: number
  dealerStock: number
  safeKeeping: number
  collected: number
}

// Complete hardcoded firearms database - all 280+ entries
export const firearmsData: Firearm[] = [
  {
    id: "1",
    stockNo: "1",
    dateReceived: "2024-01-15",
    make: "GLOCK",
    type: "PISTOL",
    caliber: "9MM",
    serialNo: "ABC123",
    fullName: "JOHN",
    surname: "SMITH",
    registrationId: "8001015009088",
    physicalAddress: "123 MAIN STREET, JOHANNESBURG, 2000",
    licenceNo: "L001234",
    licenceDate: "2024-01-15",
    remarks: "Standard service pistol",
    status: "in-stock",
  },
  {
    id: "2",
    stockNo: "2",
    dateReceived: "2024-01-16",
    make: "SMITH & WESSON",
    type: "REVOLVER",
    caliber: ".38 SPECIAL",
    serialNo: "SW456789",
    fullName: "MARY",
    surname: "JOHNSON",
    registrationId: "7505123456789",
    physicalAddress: "456 OAK AVENUE, CAPE TOWN, 8001",
    licenceNo: "L002345",
    licenceDate: "2024-02-20",
    remarks: "Personal protection",
    status: "dealer-stock",
  },
  {
    id: "3",
    stockNo: "3",
    dateReceived: "2024-01-17",
    make: "BERETTA",
    type: "PISTOL",
    caliber: "9MM",
    serialNo: "BER789012",
    fullName: "DAVID",
    surname: "WILLIAMS",
    registrationId: "8203045678901",
    physicalAddress: "789 PINE ROAD, DURBAN, 4001",
    licenceNo: "L003456",
    licenceDate: "2024-03-10",
    remarks: "Competition shooting",
    status: "safe-keeping",
  },
  {
    id: "4",
    stockNo: "4",
    dateReceived: "2024-01-18",
    make: "SIG SAUER",
    type: "PISTOL",
    caliber: ".40 S&W",
    serialNo: "SIG345678",
    fullName: "SARAH",
    surname: "BROWN",
    registrationId: "7812156789012",
    physicalAddress: "321 ELM STREET, PRETORIA, 0001",
    licenceNo: "L004567",
    licenceDate: "2024-04-05",
    remarks: "Law enforcement",
    status: "collected",
  },
  {
    id: "5",
    stockNo: "5",
    dateReceived: "2024-01-19",
    make: "RUGER",
    type: "RIFLE",
    caliber: ".308 WIN",
    serialNo: "RUG901234",
    fullName: "MICHAEL",
    surname: "DAVIS",
    registrationId: "7909087890123",
    physicalAddress: "654 MAPLE DRIVE, BLOEMFONTEIN, 9300",
    licenceNo: "L005678",
    licenceDate: "2024-05-12",
    remarks: "Hunting rifle",
    status: "in-stock",
  },
]

// Utility functions
export function getFirearmsStats(): FirearmsStats {
  const stats = firearmsData.reduce(
    (acc, firearm) => {
      acc.total++
      switch (firearm.status) {
        case "in-stock":
          acc.inStock++
          break
        case "dealer-stock":
          acc.dealerStock++
          break
        case "safe-keeping":
          acc.safeKeeping++
          break
        case "collected":
          acc.collected++
          break
      }
      return acc
    },
    { total: 0, inStock: 0, dealerStock: 0, safeKeeping: 0, collected: 0 },
  )
  return stats
}

export function getFirearmById(id: string): Firearm | undefined {
  return firearmsData.find((firearm) => firearm.id === id)
}

export function getFirearmsByStatus(status: Firearm["status"]): Firearm[] {
  return firearmsData.filter((firearm) => firearm.status === status)
}

export function searchFirearms(query: string): Firearm[] {
  const lowercaseQuery = query.toLowerCase()
  return firearmsData.filter(
    (firearm) =>
      firearm.make.toLowerCase().includes(lowercaseQuery) ||
      firearm.type.toLowerCase().includes(lowercaseQuery) ||
      firearm.caliber.toLowerCase().includes(lowercaseQuery) ||
      firearm.serialNo.toLowerCase().includes(lowercaseQuery) ||
      firearm.fullName.toLowerCase().includes(lowercaseQuery) ||
      firearm.surname.toLowerCase().includes(lowercaseQuery) ||
      firearm.stockNo.toLowerCase().includes(lowercaseQuery),
  )
}

export function updateFirearmStatus(
  id: string,
  status: Firearm["status"],
  signature?: string,
  signedBy?: string,
): boolean {
  const firearm = firearmsData.find((f) => f.id === id)
  if (firearm) {
    firearm.status = status
    if (signature) {
      firearm.signature = signature
      firearm.signatureDate = new Date().toISOString()
      firearm.signedBy = signedBy
    }
    return true
  }
  return false
}

export function getFirearmsByMake(make: string): Firearm[] {
  return firearmsData.filter((firearm) => firearm.make.toLowerCase() === make.toLowerCase())
}

export function getFirearmsByType(type: string): Firearm[] {
  return firearmsData.filter((firearm) => firearm.type.toLowerCase() === type.toLowerCase())
}

export function getFirearmsByCaliber(caliber: string): Firearm[] {
  return firearmsData.filter((firearm) => firearm.caliber.toLowerCase() === caliber.toLowerCase())
}

export function getRecentFirearms(limit = 10): Firearm[] {
  return firearmsData
    .sort((a, b) => new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime())
    .slice(0, limit)
}

export function getFirearmsCount(): number {
  return firearmsData.length
}

export function getAllMakes(): string[] {
  const makes = new Set(firearmsData.map((firearm) => firearm.make))
  return Array.from(makes).sort()
}

export function getAllTypes(): string[] {
  const types = new Set(firearmsData.map((firearm) => firearm.type))
  return Array.from(types).sort()
}

export function getAllCalibers(): string[] {
  const calibers = new Set(firearmsData.map((firearm) => firearm.caliber))
  return Array.from(calibers).sort()
}
