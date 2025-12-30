import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function seedFirearms() {
  try {
    console.log("Seeding firearms...")

    const firearms = [
      {
        id: "1",
        stockNo: "CO3",
        dateReceived: "2023-11-15",
        make: "Walther",
        type: "Pistol",
        caliber: "7.65",
        serialNo: "223083",
        fullName: "GM",
        surname: "Smuts",
        registrationId: "1/23/1985",
        physicalAddress: "",
        licenceNo: "31/21",
        licenceDate: "",
        remarks: "Mac EPR Dealer Stock",
        status: "dealer-stock",
      },
      {
        id: "2",
        stockNo: "A01",
        dateReceived: "2025-05-07",
        make: "Glock",
        type: "Pistol",
        caliber: "9mm",
        serialNo: "SSN655",
        fullName: "I",
        surname: "Dunn",
        registrationId: "9103035027088",
        physicalAddress: "54 Lazaar Ave",
        licenceNo: "",
        licenceDate: "",
        remarks: "Safekeeping",
        status: "safe-keeping",
      },
    ]

    for (const firearm of firearms) {
      await sql`
        INSERT INTO firearms (
          id, stock_no, date_received, make, type, caliber, serial_no, 
          full_name, surname, registration_id, physical_address, licence_no, 
          licence_date, remarks, status
        )
        VALUES (
          ${firearm.id}, ${firearm.stockNo}, ${firearm.dateReceived}, ${firearm.make}, 
          ${firearm.type}, ${firearm.caliber}, ${firearm.serialNo}, 
          ${firearm.fullName}, ${firearm.surname}, ${firearm.registrationId}, 
          ${firearm.physicalAddress}, ${firearm.licenceNo}, 
          ${firearm.licenceDate}, ${firearm.remarks}, ${firearm.status}
        )
        ON CONFLICT (id) DO NOTHING;
      `
      console.log(`Created firearm: ${firearm.stockNo}`)
    }

    console.log("Firearms seeded successfully!")
  } catch (error) {
    console.error("Error seeding firearms:", error)
    throw error
  }
}

seedFirearms()
