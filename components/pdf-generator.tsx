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

export function generateInspectionPDF(inspection: Inspection) {
  const doc = new jsPDF()

  // Set up the document
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")

  // Header
  doc.text("FIREARM INSPECTION REPORT", 105, 20, { align: "center" })

  // Company header
  doc.setFontSize(12)
  doc.text("GUNWORX", 20, 35)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text("Professional Firearm Services", 20, 42)

  // Inspector Information
  let yPos = 55
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("INSPECTOR INFORMATION", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Inspector: ${inspection.inspector || "N/A"}`, 20, yPos)
  doc.text(`ID Number: ${inspection.inspectorId || "N/A"}`, 120, yPos)

  yPos += 6
  doc.text(`Date: ${inspection.date || "N/A"}`, 20, yPos)
  doc.text(`Company: ${inspection.companyName || "N/A"}`, 120, yPos)

  yPos += 6
  doc.text(`Dealer Code: ${inspection.dealerCode || "N/A"}`, 20, yPos)

  // Firearm Type Section
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("FIREARM TYPE", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  const firearmTypes = []
  if (inspection.firearmType?.pistol) firearmTypes.push("Pistol")
  if (inspection.firearmType?.revolver) firearmTypes.push("Revolver")
  if (inspection.firearmType?.rifle) firearmTypes.push("Rifle")
  if (inspection.firearmType?.selfLoadingRifle) firearmTypes.push("Self-Loading Rifle/Carbine")
  if (inspection.firearmType?.shotgun) firearmTypes.push("Shotgun")
  if (inspection.firearmType?.combination) firearmTypes.push("Combination")
  if (inspection.firearmType?.other) firearmTypes.push(`Other: ${inspection.firearmType.otherDetails}`)

  doc.text(`Selected Types: ${firearmTypes.length > 0 ? firearmTypes.join(", ") : "None selected"}`, 20, yPos)

  // Caliber/Cartridge
  yPos += 12
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("CALIBER/CARTRIDGE", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Caliber: ${inspection.caliber || "N/A"}`, 20, yPos)
  doc.text(`Code: ${inspection.cartridgeCode || "N/A"}`, 120, yPos)

  // Serial Numbers
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("SERIAL NUMBERS", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text("BARREL:", 20, yPos)
  doc.text(`${inspection.serialNumbers?.barrel || "N/A"}`, 50, yPos)
  doc.text(`Make: ${inspection.serialNumbers?.barrelMake || "N/A"}`, 120, yPos)

  yPos += 6
  doc.text("FRAME:", 20, yPos)
  doc.text(`${inspection.serialNumbers?.frame || "N/A"}`, 50, yPos)
  doc.text(`Make: ${inspection.serialNumbers?.frameMake || "N/A"}`, 120, yPos)

  yPos += 6
  doc.text("RECEIVER:", 20, yPos)
  doc.text(`${inspection.serialNumbers?.receiver || "N/A"}`, 50, yPos)
  doc.text(`Make: ${inspection.serialNumbers?.receiverMake || "N/A"}`, 120, yPos)

  // Action Type
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("ACTION TYPE", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

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
  if (inspection.actionType?.other) actionTypes.push(`Other: ${inspection.actionType.otherDetails}`)

  doc.text(`Selected Actions: ${actionTypes.length > 0 ? actionTypes.join(", ") : "None selected"}`, 20, yPos)

  // Make & Origin
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("MAKE & ORIGIN", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Make: ${inspection.make || "N/A"}`, 20, yPos)
  doc.text(`Country of Origin: ${inspection.countryOfOrigin || "N/A"}`, 120, yPos)

  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage()
    yPos = 20
  }

  // Observations & Comments
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("OBSERVATIONS & COMMENTS", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text("Observations:", 20, yPos)
  yPos += 6

  // Handle long text for observations
  const observationsText = inspection.observations || "No observations recorded"
  const observationsLines = doc.splitTextToSize(observationsText, 170)
  doc.text(observationsLines, 20, yPos)
  yPos += observationsLines.length * 5

  yPos += 5
  doc.text("Comments:", 20, yPos)
  yPos += 6

  // Handle long text for comments
  const commentsText = inspection.comments || "No comments recorded"
  const commentsLines = doc.splitTextToSize(commentsText, 170)
  doc.text(commentsLines, 20, yPos)
  yPos += commentsLines.length * 5

  // Inspector Certification
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("INSPECTOR CERTIFICATION", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(`Inspector Title: ${inspection.inspectorTitle || "N/A"}`, 20, yPos)
  doc.text(`Status: ${inspection.status || "Pending"}`, 120, yPos)

  yPos += 15
  doc.text("Inspector Signature: _________________________", 20, yPos)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, yPos)

  // Footer
  yPos += 20
  doc.setFontSize(8)
  doc.text("This report was generated by the Gunworx Inspection System", 105, yPos, { align: "center" })

  // Save the PDF
  doc.save(`inspection-report-${inspection.id}-${inspection.date}.pdf`)
}

export function generateMultipleInspectionsPDF(inspections: Inspection[]) {
  const doc = new jsPDF()

  inspections.forEach((inspection, index) => {
    if (index > 0) {
      doc.addPage()
    }

    // Set up the document
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")

    // Header
    doc.text("FIREARM INSPECTION REPORT", 105, 20, { align: "center" })

    // Company header
    doc.setFontSize(12)
    doc.text("GUNWORX", 20, 35)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text("Professional Firearm Services", 20, 42)

    // Inspector Information
    let yPos = 55
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("INSPECTOR INFORMATION", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Inspector: ${inspection.inspector || "N/A"}`, 20, yPos)
    doc.text(`ID Number: ${inspection.inspectorId || "N/A"}`, 120, yPos)

    yPos += 6
    doc.text(`Date: ${inspection.date || "N/A"}`, 20, yPos)
    doc.text(`Company: ${inspection.companyName || "N/A"}`, 120, yPos)

    yPos += 6
    doc.text(`Dealer Code: ${inspection.dealerCode || "N/A"}`, 20, yPos)

    // Firearm Type Section
    yPos += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("FIREARM TYPE", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)

    const firearmTypes = []
    if (inspection.firearmType?.pistol) firearmTypes.push("Pistol")
    if (inspection.firearmType?.revolver) firearmTypes.push("Revolver")
    if (inspection.firearmType?.rifle) firearmTypes.push("Rifle")
    if (inspection.firearmType?.selfLoadingRifle) firearmTypes.push("Self-Loading Rifle/Carbine")
    if (inspection.firearmType?.shotgun) firearmTypes.push("Shotgun")
    if (inspection.firearmType?.combination) firearmTypes.push("Combination")
    if (inspection.firearmType?.other) firearmTypes.push(`Other: ${inspection.firearmType.otherDetails}`)

    doc.text(`Selected Types: ${firearmTypes.length > 0 ? firearmTypes.join(", ") : "None selected"}`, 20, yPos)

    // Caliber/Cartridge
    yPos += 12
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("CALIBER/CARTRIDGE", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Caliber: ${inspection.caliber || "N/A"}`, 20, yPos)
    doc.text(`Code: ${inspection.cartridgeCode || "N/A"}`, 120, yPos)

    // Serial Numbers
    yPos += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("SERIAL NUMBERS", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("BARREL:", 20, yPos)
    doc.text(`${inspection.serialNumbers?.barrel || "N/A"}`, 50, yPos)
    doc.text(`Make: ${inspection.serialNumbers?.barrelMake || "N/A"}`, 120, yPos)

    yPos += 6
    doc.text("FRAME:", 20, yPos)
    doc.text(`${inspection.serialNumbers?.frame || "N/A"}`, 50, yPos)
    doc.text(`Make: ${inspection.serialNumbers?.frameMake || "N/A"}`, 120, yPos)

    yPos += 6
    doc.text("RECEIVER:", 20, yPos)
    doc.text(`${inspection.serialNumbers?.receiver || "N/A"}`, 50, yPos)
    doc.text(`Make: ${inspection.serialNumbers?.receiverMake || "N/A"}`, 120, yPos)

    // Action Type
    yPos += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("ACTION TYPE", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)

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
    if (inspection.actionType?.other) actionTypes.push(`Other: ${inspection.actionType.otherDetails}`)

    doc.text(`Selected Actions: ${actionTypes.length > 0 ? actionTypes.join(", ") : "None selected"}`, 20, yPos)

    // Make & Origin
    yPos += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("MAKE & ORIGIN", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Make: ${inspection.make || "N/A"}`, 20, yPos)
    doc.text(`Country of Origin: ${inspection.countryOfOrigin || "N/A"}`, 120, yPos)

    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }

    // Observations & Comments
    yPos += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("OBSERVATIONS & COMMENTS", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("Observations:", 20, yPos)
    yPos += 6

    // Handle long text for observations
    const observationsText = inspection.observations || "No observations recorded"
    const observationsLines = doc.splitTextToSize(observationsText, 170)
    doc.text(observationsLines, 20, yPos)
    yPos += observationsLines.length * 5

    yPos += 5
    doc.text("Comments:", 20, yPos)
    yPos += 6

    // Handle long text for comments
    const commentsText = inspection.comments || "No comments recorded"
    const commentsLines = doc.splitTextToSize(commentsText, 170)
    doc.text(commentsLines, 20, yPos)
    yPos += commentsLines.length * 5

    // Inspector Certification
    yPos += 15
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("INSPECTOR CERTIFICATION", 20, yPos)

    yPos += 8
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Inspector Title: ${inspection.inspectorTitle || "N/A"}`, 20, yPos)
    doc.text(`Status: ${inspection.status || "Pending"}`, 120, yPos)

    yPos += 15
    doc.text("Inspector Signature: _________________________", 20, yPos)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, yPos)

    // Footer
    yPos += 20
    doc.setFontSize(8)
    doc.text("This report was generated by the Gunworx Inspection System", 105, yPos, { align: "center" })
  })

  // Save the PDF
  doc.save(`inspection-reports-batch-${new Date().toISOString().split("T")[0]}.pdf`)
}
