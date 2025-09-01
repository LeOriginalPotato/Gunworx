import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, addToDataStore } from "../data-migration/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    const dataStore = getCentralDataStore()
    let inspections = dataStore.inspections

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      inspections = inspections.filter((inspection: any) => {
        return (
          inspection.id?.toLowerCase().includes(searchLower) ||
          inspection.inspectorName?.toLowerCase().includes(searchLower) ||
          inspection.firearmType?.manufacturer?.toLowerCase().includes(searchLower) ||
          inspection.firearmType?.model?.toLowerCase().includes(searchLower) ||
          inspection.serialNumbers?.primary?.toLowerCase().includes(searchLower) ||
          inspection.serialNumbers?.secondary?.toLowerCase().includes(searchLower) ||
          inspection.notes?.toLowerCase().includes(searchLower) ||
          inspection.status?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply category filter
    if (category && category !== "all") {
      inspections = inspections.filter((inspection: any) => {
        return inspection.category === category
      })
    }

    return NextResponse.json({
      inspections: inspections.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      total: inspections.length,
    })
  } catch (error) {
    console.error("Error fetching inspections:", error)
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 Creating new inspection:", body)

    // Validate required fields
    if (!body.inspectorName || !body.firearmType) {
      return NextResponse.json(
        { error: "Missing required fields: inspectorName and firearmType are required" },
        { status: 400 },
      )
    }

    // Create inspection object with proper structure
    const inspectionData = {
      id: `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      inspectorName: body.inspectorName,
      date: body.date || new Date().toISOString().split("T")[0],
      firearmType: {
        manufacturer: body.firearmType?.manufacturer || "",
        model: body.firearmType?.model || "",
        caliber: body.firearmType?.caliber || "",
        type: body.firearmType?.type || "rifle",
      },
      serialNumbers: {
        primary: body.serialNumbers?.primary || "",
        secondary: body.serialNumbers?.secondary || "",
        frame: body.serialNumbers?.frame || "",
        barrel: body.serialNumbers?.barrel || "",
      },
      actionType: {
        action: body.actionType?.action || "",
        trigger: body.actionType?.trigger || "",
        safety: body.actionType?.safety || "",
      },
      condition: {
        overall: body.condition?.overall || "good",
        barrel: body.condition?.barrel || "good",
        action: body.condition?.action || "good",
        stock: body.condition?.stock || "good",
        finish: body.condition?.finish || "good",
      },
      measurements: {
        length: body.measurements?.length || "",
        weight: body.measurements?.weight || "",
        barrelLength: body.measurements?.barrelLength || "",
      },
      compliance: {
        legal: Boolean(body.compliance?.legal ?? true),
        registered: Boolean(body.compliance?.registered ?? true),
        permitted: Boolean(body.compliance?.permitted ?? true),
      },
      notes: body.notes || "",
      status: body.status || "completed",
      category: body.category || "routine",
      priority: body.priority || "normal",
      location: body.location || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("📋 Structured inspection data:", inspectionData)

    // Add to data store
    const newInspection = addToDataStore("inspections", inspectionData)

    if (!newInspection) {
      throw new Error("Failed to add inspection to data store")
    }

    console.log("✅ Inspection created successfully:", newInspection.id)

    return NextResponse.json({
      success: true,
      inspection: newInspection,
      message: "Inspection created successfully",
    })
  } catch (error) {
    console.error("❌ Error creating inspection:", error)
    return NextResponse.json(
      {
        error: "Failed to create inspection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
