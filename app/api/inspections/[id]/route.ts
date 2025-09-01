import { type NextRequest, NextResponse } from "next/server"
import { getCentralDataStore, updateCentralDataStore } from "../../data-migration/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataStore = getCentralDataStore()
    const inspection = dataStore.inspections.find((i) => i.id === params.id)

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    return NextResponse.json({ inspection })
  } catch (error) {
    console.error("Error fetching inspection:", error)
    return NextResponse.json({ error: "Failed to fetch inspection" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const inspectionId = params.id

    console.log(`🔄 Updating inspection ${inspectionId} with data:`, body)

    // Get current data store
    const currentDataStore = getCentralDataStore()
    const inspections = currentDataStore.inspections || []

    // Find the inspection to update
    const inspectionIndex = inspections.findIndex((i) => i.id === inspectionId)

    if (inspectionIndex === -1) {
      console.error(`❌ Inspection not found: ${inspectionId}`)
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    const existingInspection = inspections[inspectionIndex]

    // Create the updated inspection with proper nested object handling
    const updatedInspection = {
      ...existingInspection,
      ...body,
      id: inspectionId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      // Properly merge nested objects
      firearmType: {
        ...existingInspection.firearmType,
        ...body.firearmType,
      },
      serialNumbers: {
        ...existingInspection.serialNumbers,
        ...body.serialNumbers,
      },
      actionType: {
        ...existingInspection.actionType,
        ...body.actionType,
      },
    }

    // Update the inspection in the array
    const updatedInspections = [...inspections]
    updatedInspections[inspectionIndex] = updatedInspection

    // Update the central data store with the new inspections array
    updateCentralDataStore({
      ...currentDataStore,
      inspections: updatedInspections,
    })

    console.log(`✅ Successfully updated inspection: ${inspectionId}`)
    console.log(`📊 Updated inspection data:`, updatedInspection)

    return NextResponse.json({
      message: "Inspection updated successfully",
      inspection: updatedInspection,
    })
  } catch (error) {
    console.error(`❌ Error updating inspection ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update inspection" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inspectionId = params.id

    // Get current data store
    const currentDataStore = getCentralDataStore()
    const inspections = currentDataStore.inspections || []

    // Find the inspection to delete
    const inspectionIndex = inspections.findIndex((i) => i.id === inspectionId)

    if (inspectionIndex === -1) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 })
    }

    const deletedInspection = inspections[inspectionIndex]

    // Remove the inspection from the array
    const updatedInspections = inspections.filter((i) => i.id !== inspectionId)

    // Update the central data store
    updateCentralDataStore({
      ...currentDataStore,
      inspections: updatedInspections,
    })

    console.log(`🗑️ Successfully deleted inspection: ${inspectionId}`)

    return NextResponse.json({
      message: "Inspection deleted successfully",
      inspection: deletedInspection,
    })
  } catch (error) {
    console.error("Error deleting inspection:", error)
    return NextResponse.json({ error: "Failed to delete inspection" }, { status: 500 })
  }
}
