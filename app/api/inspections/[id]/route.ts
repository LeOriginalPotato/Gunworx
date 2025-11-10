import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`SELECT * FROM inspections WHERE id = ${params.id}`

    if (result.length === 0) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      inspection: result[0],
    })
  } catch (error) {
    console.error("Error fetching inspection:", error)
    return NextResponse.json({ error: "Failed to fetch inspection" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inspectionData = await request.json()

    const firearmType = {
      pistol: Boolean(inspectionData.firearmType?.pistol),
      revolver: Boolean(inspectionData.firearmType?.revolver),
      rifle: Boolean(inspectionData.firearmType?.rifle),
      selfLoadingRifle: Boolean(inspectionData.firearmType?.selfLoadingRifle),
      shotgun: Boolean(inspectionData.firearmType?.shotgun),
      combination: Boolean(inspectionData.firearmType?.combination),
      other: Boolean(inspectionData.firearmType?.other),
      otherDetails: inspectionData.firearmType?.otherDetails || "",
    }

    const serialNumbers = {
      barrel: inspectionData.serialNumbers?.barrel || "",
      barrelMake: inspectionData.serialNumbers?.barrelMake || "",
      frame: inspectionData.serialNumbers?.frame || "",
      frameMake: inspectionData.serialNumbers?.frameMake || "",
      receiver: inspectionData.serialNumbers?.receiver || "",
      receiverMake: inspectionData.serialNumbers?.receiverMake || "",
    }

    const actionType = {
      manual: Boolean(inspectionData.actionType?.manual),
      semiAuto: Boolean(inspectionData.actionType?.semiAuto),
      automatic: Boolean(inspectionData.actionType?.automatic),
      bolt: Boolean(inspectionData.actionType?.bolt),
      breakneck: Boolean(inspectionData.actionType?.breakneck),
      pump: Boolean(inspectionData.actionType?.pump),
      cappingBreechLoader: Boolean(inspectionData.actionType?.cappingBreechLoader),
      lever: Boolean(inspectionData.actionType?.lever),
      cylinder: Boolean(inspectionData.actionType?.cylinder),
      fallingBlock: Boolean(inspectionData.actionType?.fallingBlock),
      other: Boolean(inspectionData.actionType?.other),
      otherDetails: inspectionData.actionType?.otherDetails || "",
    }

    const result = await sql`
      UPDATE inspections
      SET
        date = COALESCE(${inspectionData.date}, date),
        inspector = COALESCE(${inspectionData.inspector}, inspector),
        inspector_id = COALESCE(${inspectionData.inspectorId}, inspector_id),
        company_name = COALESCE(${inspectionData.companyName}, company_name),
        dealer_code = COALESCE(${inspectionData.dealerCode}, dealer_code),
        firearm_type = COALESCE(${JSON.stringify(firearmType)}, firearm_type),
        caliber = COALESCE(${inspectionData.caliber}, caliber),
        cartridge_code = COALESCE(${inspectionData.cartridgeCode}, cartridge_code),
        serial_numbers = COALESCE(${JSON.stringify(serialNumbers)}, serial_numbers),
        action_type = COALESCE(${JSON.stringify(actionType)}, action_type),
        make = COALESCE(${inspectionData.make}, make),
        country_of_origin = COALESCE(${inspectionData.countryOfOrigin}, country_of_origin),
        observations = COALESCE(${inspectionData.observations}, observations),
        comments = COALESCE(${inspectionData.comments}, comments),
        signature = COALESCE(${inspectionData.signature}, signature),
        inspector_title = COALESCE(${inspectionData.inspectorTitle}, inspector_title),
        status = COALESCE(${inspectionData.status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *;
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      inspection: result[0],
      message: "Inspection updated successfully",
    })
  } catch (error) {
    console.error("Error updating inspection:", error)
    return NextResponse.json(
      { error: `Failed to update inspection: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM inspections WHERE id = ${params.id}`

    return NextResponse.json({
      success: true,
      message: "Inspection deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting inspection:", error)
    return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 })
  }
}
