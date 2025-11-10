import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let result

    if (search) {
      const searchTerm = `%${search}%`
      result = await sql`
        SELECT * FROM inspections
        WHERE
          inspector ILIKE ${searchTerm} OR
          inspector_id ILIKE ${searchTerm} OR
          company_name ILIKE ${searchTerm} OR
          dealer_code ILIKE ${searchTerm} OR
          caliber ILIKE ${searchTerm} OR
          cartridge_code ILIKE ${searchTerm} OR
          make ILIKE ${searchTerm} OR
          country_of_origin ILIKE ${searchTerm} OR
          observations ILIKE ${searchTerm} OR
          comments ILIKE ${searchTerm} OR
          inspector_title ILIKE ${searchTerm} OR
          status ILIKE ${searchTerm} OR
          CAST(date AS TEXT) ILIKE ${searchTerm}
        ORDER BY date DESC
      `
    } else {
      result = await sql`SELECT * FROM inspections ORDER BY date DESC`
    }

    return NextResponse.json({
      success: true,
      inspections: result,
      count: result.length,
    })
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const inspectionData = await request.json()

    if (!inspectionData.date) {
      return NextResponse.json({ error: "Missing required field: date is required" }, { status: 400 })
    }

    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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
      INSERT INTO inspections (
        id, date, inspector, inspector_id, company_name, dealer_code,
        firearm_type, caliber, cartridge_code, serial_numbers, action_type,
        make, country_of_origin, observations, comments, signature,
        inspector_title, status
      )
      VALUES (
        ${id}, ${inspectionData.date}, ${inspectionData.inspector || "Unknown Inspector"},
        ${inspectionData.inspectorId || ""}, ${inspectionData.companyName || ""},
        ${inspectionData.dealerCode || ""}, ${JSON.stringify(firearmType)},
        ${inspectionData.caliber || ""}, ${inspectionData.cartridgeCode || ""},
        ${JSON.stringify(serialNumbers)}, ${JSON.stringify(actionType)},
        ${inspectionData.make || ""}, ${inspectionData.countryOfOrigin || ""},
        ${inspectionData.observations || ""}, ${inspectionData.comments || ""},
        ${inspectionData.signature || ""}, ${inspectionData.inspectorTitle || ""},
        ${inspectionData.status || "pending"}
      )
      RETURNING *;
    `

    return NextResponse.json(
      {
        success: true,
        inspection: result[0],
        message: "Inspection created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating inspection:", error)
    return NextResponse.json(
      { error: `Failed to create inspection: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
