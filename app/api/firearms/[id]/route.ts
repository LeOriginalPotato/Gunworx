import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`SELECT * FROM firearms WHERE id = ${params.id}`

    if (result.length === 0) {
      return NextResponse.json({ error: "Firearm not found" }, { status: 404 })
    }

    return NextResponse.json({ firearm: result[0] })
  } catch (error) {
    console.error("Error fetching firearm:", error)
    return NextResponse.json({ error: "Failed to fetch firearm" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updateData = await request.json()

    const result = await sql`
      UPDATE firearms
      SET
        stock_no = COALESCE(${updateData.stockNo}, stock_no),
        date_received = COALESCE(${updateData.dateReceived}, date_received),
        make = COALESCE(${updateData.make}, make),
        type = COALESCE(${updateData.type}, type),
        caliber = COALESCE(${updateData.caliber}, caliber),
        serial_no = COALESCE(${updateData.serialNo}, serial_no),
        full_name = COALESCE(${updateData.fullName}, full_name),
        surname = COALESCE(${updateData.surname}, surname),
        registration_id = COALESCE(${updateData.registrationId}, registration_id),
        physical_address = COALESCE(${updateData.physicalAddress}, physical_address),
        licence_no = COALESCE(${updateData.licenceNo}, licence_no),
        licence_date = COALESCE(${updateData.licenceDate}, licence_date),
        remarks = COALESCE(${updateData.remarks}, remarks),
        status = COALESCE(${updateData.status}, status),
        signature = COALESCE(${updateData.signature}, signature),
        signature_date = COALESCE(${updateData.signatureDate}, signature_date),
        signed_by = COALESCE(${updateData.signedBy}, signed_by),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *;
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Firearm not found" }, { status: 404 })
    }

    return NextResponse.json({ firearm: result[0] })
  } catch (error) {
    console.error("Error updating firearm:", error)
    return NextResponse.json({ error: "Failed to update firearm" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM firearms WHERE id = ${params.id}`

    return NextResponse.json({
      message: "Firearm deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting firearm:", error)
    return NextResponse.json({ error: "Failed to delete firearm" }, { status: 500 })
  }
}
