import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = `SELECT * FROM firearms WHERE 1=1`
    const params: any[] = []

    if (status && status !== "all") {
      query += ` AND status = $${params.length + 1}`
      params.push(status)
    }

    if (search) {
      query += ` AND (
        stock_no ILIKE $${params.length + 1} OR
        make ILIKE $${params.length + 1} OR
        type ILIKE $${params.length + 1} OR
        caliber ILIKE $${params.length + 1} OR
        serial_no ILIKE $${params.length + 1} OR
        full_name ILIKE $${params.length + 1} OR
        surname ILIKE $${params.length + 1} OR
        remarks ILIKE $${params.length + 1}
      )`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY created_at DESC`

    const result = await sql(query, params)

    return NextResponse.json({
      firearms: result,
      total: result.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching firearms:", error)
    return NextResponse.json({ error: "Failed to fetch firearms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const firearmData = await request.json()

    // Validate required fields
    if (!firearmData.stockNo || !firearmData.make || !firearmData.serialNo) {
      return NextResponse.json({ error: "Missing required fields: stockNo, make, serialNo" }, { status: 400 })
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const result = await sql`
      INSERT INTO firearms (
        id, stock_no, date_received, make, type, caliber, serial_no,
        full_name, surname, registration_id, physical_address, licence_no,
        licence_date, remarks, status
      )
      VALUES (
        ${id}, ${firearmData.stockNo}, ${firearmData.dateReceived}, ${firearmData.make},
        ${firearmData.type}, ${firearmData.caliber}, ${firearmData.serialNo},
        ${firearmData.fullName}, ${firearmData.surname}, ${firearmData.registrationId},
        ${firearmData.physicalAddress}, ${firearmData.licenceNo},
        ${firearmData.licenceDate}, ${firearmData.remarks}, ${firearmData.status}
      )
      RETURNING *;
    `

    const newFirearm = result[0]

    return NextResponse.json(
      {
        firearm: newFirearm,
        total: 1,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating firearm:", error)
    return NextResponse.json({ error: "Failed to create firearm" }, { status: 500 })
  }
}
