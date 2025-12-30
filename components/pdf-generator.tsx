"use client"

import jsPDF from "jspdf"

interface Inspection {
  id: string
  date: string
  inspector: string
  inspectorId: string
  companyName: string
  dealerCode: string
  firearmType: {
    pistol: boolean
    revolver: boolean
    rifle: boolean
    selfLoadingRifle: boolean
    shotgun: boolean
    combination: boolean
    other: boolean
    otherDetails: string
  }
  caliber: string
  cartridgeCode: string
  serialNumbers: {
    barrel: string
    barrelMake: string
    frame: string
    frameMake: string
    receiver: string
    receiverMake: string
  }
  actionType: {
    manual: boolean
    semiAuto: boolean
    automatic: boolean
    bolt: boolean
    breakneck: boolean
    pump: boolean
    cappingBreechLoader: boolean
    lever: boolean
    cylinder: boolean
    fallingBlock: boolean
    other: boolean
    otherDetails: string
  }
  make: string
  countryOfOrigin: string
  observations: string
  comments: string
  signature: string
  inspectorTitle: string
  status: "passed" | "failed" | "pending"
}

// Helper to load image as promise
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function generateInspectionPDF(inspection: Inspection) {
  console.log("[v0] Starting PDF generation for inspection:", inspection.id)
  // Defensive check for inspection data structure
  console.log("[v0] Inspection firearmType:", inspection.firearmType)
  console.log("[v0] Inspection serialNumbers:", inspection.serialNumbers)
  console.log("[v0] Inspection actionType:", inspection.actionType)

  const doc = new jsPDF()
  const margin = 20
  const pageWidth = doc.internal.pageSize.width
  const contentWidth = pageWidth - margin * 2

  let yPosition = margin

  // Load header image
  try {
    console.log("[v0] Loading header image...")
    const headerImg = await loadImage("/gunworx-header.png")
    console.log("[v0] Header image loaded successfully")

    const imgWidth = 100
    const imgHeight = 35
    const xPosition = (pageWidth - imgWidth) / 2
    doc.addImage(headerImg, "PNG", xPosition, yPosition, imgWidth, imgHeight)
    yPosition = margin + 45
  } catch (error) {
    console.warn("[v0] Header image failed to load:", error)
    yPosition = margin
  }

  // Title - centered
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  const title = "FIREARM INSPECTION REPORT"
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, (pageWidth - titleWidth) / 2, yPosition)
  yPosition += 15

  // Inspector Information Section
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("INSPECTOR INFORMATION", margin, yPosition)
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const col1X = margin
  const col2X = margin + contentWidth / 2

  doc.text(`Inspector: ${inspection.inspector || "N/A"}`, col1X, yPosition)
  doc.text(`ID Number: ${inspection.inspectorId || "N/A"}`, col2X, yPosition)
  yPosition += 6

  doc.text(`Company: ${inspection.companyName || "N/A"}`, col1X, yPosition)
  doc.text(`Dealer Code: ${inspection.dealerCode || "N/A"}`, col2X, yPosition)
  yPosition += 6

  doc.text(`Date: ${inspection.date || "N/A"}`, col1X, yPosition)
  doc.text(`Title: ${inspection.inspectorTitle || "N/A"}`, col2X, yPosition)
  yPosition += 12

  // Firearm Type Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("FIREARM TYPE", margin, yPosition)
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const firearmTypes = []
  if (inspection.firearmType?.pistol) firearmTypes.push("Pistol")
  if (inspection.firearmType?.revolver) firearmTypes.push("Revolver")
  if (inspection.firearmType?.rifle) firearmTypes.push("Rifle")
  if (inspection.firearmType?.selfLoadingRifle) firearmTypes.push("Self-Loading Rifle/Carbine")
  if (inspection.firearmType?.shotgun) firearmTypes.push("Shotgun")
  if (inspection.firearmType?.combination) firearmTypes.push("Combination")
  if (inspection.firearmType?.other) firearmTypes.push(`Other: ${inspection.firearmType.otherDetails || ""}`)

  doc.text(`Selected Types: ${firearmTypes.join(", ") || "None"}`, margin, yPosition)
  yPosition += 10

  // Caliber/Cartridge Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("CALIBER/CARTRIDGE", margin, yPosition)
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Caliber: ${inspection.caliber || "N/A"}`, col1X, yPosition)
  doc.text(`Code: ${inspection.cartridgeCode || "N/A"}`, col2X, yPosition)
  yPosition += 12

  // Serial Numbers Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("SERIAL NUMBERS", margin, yPosition)
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  if (inspection.serialNumbers?.barrel) {
    doc.text(
      `Barrel: ${inspection.serialNumbers.barrel} (${inspection.serialNumbers.barrelMake || "N/A"})`,
      margin,
      yPosition,
    )
    yPosition += 6
  }
  if (inspection.serialNumbers?.frame) {
    doc.text(
      `Frame: ${inspection.serialNumbers.frame} (${inspection.serialNumbers.frameMake || "N/A"})`,
      margin,
      yPosition,
    )
    yPosition += 6
  }
  if (inspection.serialNumbers?.receiver) {
    doc.text(
      `Receiver: ${inspection.serialNumbers.receiver} (${inspection.serialNumbers.receiverMake || "N/A"})`,
      margin,
      yPosition,
    )
    yPosition += 6
  }
  yPosition += 6

  // Action Type Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("ACTION TYPE", margin, yPosition)
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  const actionTypes = []
  if (inspection.actionType?.manual) actionTypes.push("Manual")
  if (inspection.actionType?.semiAuto) actionTypes.push("Semi Auto")
  if (inspection.actionType?.automatic) actionTypes.push("Automatic")
  if (inspection.actionType?.bolt) actionTypes.push("Bolt")
  if (inspection.actionType?.breakneck) actionTypes.push("Breakneck")
  if (inspection.actionType?.pump) actionTypes.push("Pump")
  if (inspection.actionType?.cappingBreechLoader) actionTypes.push("Capping Breech Loader")
  if (inspection.actionType?.lever) actionTypes.push("Lever")
  if (inspection.actionType?.cylinder) actionTypes.push("Cylinder")
  if (inspection.actionType?.fallingBlock) actionTypes.push("Falling Block")
  if (inspection.actionType?.other) actionTypes.push(`Other: ${inspection.actionType.otherDetails || ""}`)

  doc.text(`Selected Actions: ${actionTypes.join(", ") || "None"}`, margin, yPosition)
  yPosition += 12

  // Make and Country Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("MAKE & ORIGIN", margin, yPosition)
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Make: ${inspection.make || "N/A"}`, col1X, yPosition)
  doc.text(`Country of Origin: ${inspection.countryOfOrigin || "N/A"}`, col2X, yPosition)
  yPosition += 12

  // Observations Section
  if (inspection.observations) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("OBSERVATIONS", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    const observationLines = doc.splitTextToSize(inspection.observations, contentWidth)
    doc.text(observationLines, margin, yPosition)
    yPosition += observationLines.length * 6 + 6
  }

  // Comments Section
  if (inspection.comments) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("COMMENTS", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    const commentLines = doc.splitTextToSize(inspection.comments, contentWidth)
    doc.text(commentLines, margin, yPosition)
    yPosition += commentLines.length * 6 + 6
  }

  // Status Section
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("INSPECTION STATUS", margin, yPosition)
  yPosition += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Status: ${inspection.status?.toUpperCase() || "PENDING"}`, margin, yPosition)
  yPosition += 12

  // Signature Section
  if (inspection.signature) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("INSPECTOR SIGNATURE", margin, yPosition)
    yPosition += 8

    try {
      const signatureImg = await loadImage(inspection.signature)
      doc.addImage(signatureImg, "PNG", margin, yPosition, 100, 30)
      yPosition += 35

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`${inspection.inspector || ""}`, margin, yPosition)
      doc.text(`${inspection.inspectorTitle || ""}`, margin, yPosition + 6)
    } catch (error) {
      console.warn("[v0] Signature image failed to load:", error)
    }
  }

  // Save the PDF
  const filename = `inspection_report_${inspection.id}_${inspection.date}.pdf`
  console.log("[v0] Saving PDF:", filename)
  doc.save(filename)
  console.log("[v0] PDF generation completed successfully")
}

export async function generateMultipleInspectionsPDF(inspections: Inspection[]) {
  console.log("[v0] Starting multiple inspections PDF generation, count:", inspections.length)

  const doc = new jsPDF()

  // Pre-load the header image
  let headerImg: HTMLImageElement | null = null
  try {
    headerImg = await loadImage("/gunworx-header.png")
    console.log("[v0] Header image loaded for multiple inspections")
  } catch (error) {
    console.warn("[v0] Header image failed to load for multiple inspections:", error)
  }

  // Generate all pages
  for (let i = 0; i < inspections.length; i++) {
    if (i > 0) {
      doc.addPage()
    }
    await generateSingleInspectionPage(doc, inspections[i], headerImg)
  }

  const filename = `multiple_inspections_${new Date().toISOString().split("T")[0]}.pdf`
  console.log("[v0] Saving multiple inspections PDF:", filename)
  doc.save(filename)
  console.log("[v0] Multiple inspections PDF completed successfully")
}

async function generateSingleInspectionPage(
  doc: jsPDF,
  inspection: Inspection,
  headerImg: HTMLImageElement | null = null,
) {
  const margin = 20
  const pageWidth = doc.internal.pageSize.width
  const contentWidth = pageWidth - margin * 2

  let yPosition = margin

  // Add header if image is available
  if (headerImg) {
    const imgWidth = 100
    const imgHeight = 35
    const xPosition = (pageWidth - imgWidth) / 2

    doc.addImage(headerImg, "PNG", xPosition, yPosition, imgWidth, imgHeight)
    yPosition = margin + 45
  }

  // Title - centered
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  const title = "FIREARM INSPECTION REPORT"
  const titleWidth = doc.getTextWidth(title)
  doc.text(title, (pageWidth - titleWidth) / 2, yPosition)
  yPosition += 15

  // Compact layout for multiple inspections
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  const col1X = margin
  const col2X = margin + contentWidth / 2

  doc.text(`Inspector: ${inspection.inspector || "N/A"}`, col1X, yPosition)
  doc.text(`Date: ${inspection.date || "N/A"}`, col2X, yPosition)
  yPosition += 6

  doc.text(`Company: ${inspection.companyName || "N/A"}`, col1X, yPosition)
  doc.text(`Make: ${inspection.make || "N/A"}`, col2X, yPosition)
  yPosition += 6

  doc.text(`Caliber: ${inspection.caliber || "N/A"}`, col1X, yPosition)
  doc.text(`Status: ${inspection.status?.toUpperCase() || "PENDING"}`, col2X, yPosition)
  yPosition += 10

  // Serial numbers (compact)
  if (inspection.serialNumbers?.receiver) {
    doc.text(`Serial: ${inspection.serialNumbers.receiver}`, margin, yPosition)
    yPosition += 6
  }

  // Observations (truncated if too long)
  if (inspection.observations) {
    doc.setFont("helvetica", "bold")
    doc.text("Observations:", margin, yPosition)
    yPosition += 6

    doc.setFont("helvetica", "normal")
    const obsLines = doc.splitTextToSize(inspection.observations, contentWidth)
    const maxLines = 3
    const displayLines = obsLines.slice(0, maxLines)
    if (obsLines.length > maxLines) {
      displayLines[maxLines - 1] += "..."
    }

    doc.text(displayLines, margin, yPosition)
    yPosition += displayLines.length * 6
  }
}
