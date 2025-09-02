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
  signature?: string
  stamp?: string
  inspectorTitle: string
  status: "passed" | "failed" | "pending"
}

// Helper function to load image and convert to base64
async function loadImageAsBase64(imagePath: string): Promise<string | null> {
  try {
    const response = await fetch(imagePath)
    if (!response.ok) {
      console.warn(`Failed to load image: ${imagePath}`)
      return null
    }
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn(`Error loading image ${imagePath}:`, error)
    return null
  }
}

// Helper function to get selected firearm types
function getSelectedFirearmTypes(firearmType: Inspection["firearmType"]): string[] {
  const types = []
  if (firearmType.pistol) types.push("Pistol")
  if (firearmType.revolver) types.push("Revolver")
  if (firearmType.rifle) types.push("Rifle")
  if (firearmType.selfLoadingRifle) types.push("Self-Loading Rifle/Carbine")
  if (firearmType.shotgun) types.push("Shotgun")
  if (firearmType.combination) types.push("Combination")
  if (firearmType.other) types.push(`Other: ${firearmType.otherDetails}`)
  return types
}

// Helper function to get selected action types
function getSelectedActionTypes(actionType: Inspection["actionType"]): string[] {
  const types = []
  if (actionType.manual) types.push("Manual")
  if (actionType.semiAuto) types.push("Semi Auto")
  if (actionType.automatic) types.push("Automatic")
  if (actionType.bolt) types.push("Bolt")
  if (actionType.breakneck) types.push("Breakneck")
  if (actionType.pump) types.push("Pump")
  if (actionType.cappingBreechLoader) types.push("Capping Breech Loader")
  if (actionType.lever) types.push("Lever")
  if (actionType.cylinder) types.push("Cylinder")
  if (actionType.fallingBlock) types.push("Falling Block")
  if (actionType.other) types.push(`Other: ${actionType.otherDetails}`)
  return types
}

export async function generateInspectionPDF(inspection: Inspection) {
  try {
    console.log("🖨️ Generating PDF for inspection:", inspection.id)

    const pdf = new jsPDF()
    let yPosition = 20

    // Load signature and stamp images
    const signatureImage = inspection.signature ? await loadImageAsBase64(inspection.signature) : null
    const stampImage = inspection.stamp ? await loadImageAsBase64(inspection.stamp) : null

    // Header
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("FIREARM INSPECTION REPORT", 105, yPosition, { align: "center" })
    yPosition += 15

    // Inspector Information
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("INSPECTOR INFORMATION", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    pdf.text(`Inspector: ${inspection.inspector}`, 20, yPosition)
    pdf.text(`ID Number: ${inspection.inspectorId}`, 120, yPosition)
    yPosition += 6
    pdf.text(`Date: ${inspection.date}`, 20, yPosition)
    yPosition += 10

    // Company Information
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("COMPANY INFORMATION", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    pdf.text(`Company: ${inspection.companyName}`, 20, yPosition)
    pdf.text(`Dealer Code: ${inspection.dealerCode}`, 120, yPosition)
    yPosition += 10

    // Firearm Type
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("FIREARM TYPE", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    const selectedFirearmTypes = getSelectedFirearmTypes(inspection.firearmType)
    if (selectedFirearmTypes.length > 0) {
      pdf.text(`Selected Types: ${selectedFirearmTypes.join(", ")}`, 20, yPosition)
      yPosition += 6
    }
    yPosition += 5

    // Caliber/Cartridge
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("CALIBER/CARTRIDGE", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    pdf.text(`Caliber: ${inspection.caliber}`, 20, yPosition)
    pdf.text(`Code: ${inspection.cartridgeCode}`, 120, yPosition)
    yPosition += 10

    // Serial Numbers
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("SERIAL NUMBERS", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    if (inspection.serialNumbers.barrel) {
      pdf.text(`Barrel: ${inspection.serialNumbers.barrel} (${inspection.serialNumbers.barrelMake})`, 20, yPosition)
      yPosition += 6
    }
    if (inspection.serialNumbers.frame) {
      pdf.text(`Frame: ${inspection.serialNumbers.frame} (${inspection.serialNumbers.frameMake})`, 20, yPosition)
      yPosition += 6
    }
    if (inspection.serialNumbers.receiver) {
      pdf.text(
        `Receiver: ${inspection.serialNumbers.receiver} (${inspection.serialNumbers.receiverMake})`,
        20,
        yPosition,
      )
      yPosition += 6
    }
    yPosition += 5

    // Action Type
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("ACTION TYPE", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    const selectedActionTypes = getSelectedActionTypes(inspection.actionType)
    if (selectedActionTypes.length > 0) {
      pdf.text(`Selected Types: ${selectedActionTypes.join(", ")}`, 20, yPosition)
      yPosition += 6
    }
    yPosition += 5

    // Make and Country
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("MAKE & ORIGIN", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    pdf.text(`Make: ${inspection.make}`, 20, yPosition)
    pdf.text(`Country: ${inspection.countryOfOrigin}`, 120, yPosition)
    yPosition += 10

    // Observations
    if (inspection.observations) {
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("OBSERVATIONS", 20, yPosition)
      yPosition += 8

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      const observationLines = pdf.splitTextToSize(inspection.observations, 170)
      pdf.text(observationLines, 20, yPosition)
      yPosition += observationLines.length * 6 + 5
    }

    // Comments
    if (inspection.comments) {
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("COMMENTS", 20, yPosition)
      yPosition += 8

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      const commentLines = pdf.splitTextToSize(inspection.comments, 170)
      pdf.text(commentLines, 20, yPosition)
      yPosition += commentLines.length * 6 + 5
    }

    // Status
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("STATUS", 20, yPosition)
    yPosition += 8

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    pdf.text(`Inspection Status: ${inspection.status.toUpperCase()}`, 20, yPosition)
    yPosition += 10

    // Inspector Title
    if (inspection.inspectorTitle) {
      pdf.text(`Inspector Title: ${inspection.inspectorTitle}`, 20, yPosition)
      yPosition += 10
    }

    // Signature and Stamp Section
    if (signatureImage || stampImage) {
      // Check if we need a new page
      if (yPosition > 220) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("CERTIFICATION", 20, yPosition)
      yPosition += 15

      // Display signature and stamp side by side
      if (signatureImage && stampImage) {
        // Both signature and stamp
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.text("Inspector Signature:", 20, yPosition)
        pdf.text("Official Stamp:", 120, yPosition)
        yPosition += 5

        try {
          pdf.addImage(signatureImage, "PNG", 20, yPosition, 80, 30)
          pdf.addImage(stampImage, "PNG", 120, yPosition, 60, 30)
          yPosition += 35
        } catch (error) {
          console.error("Error adding images to PDF:", error)
          pdf.text("Signature and stamp could not be displayed", 20, yPosition)
          yPosition += 10
        }
      } else if (signatureImage) {
        // Only signature
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.text("Inspector Signature:", 20, yPosition)
        yPosition += 5

        try {
          pdf.addImage(signatureImage, "PNG", 20, yPosition, 100, 40)
          yPosition += 45
        } catch (error) {
          console.error("Error adding signature to PDF:", error)
          pdf.text("Signature could not be displayed", 20, yPosition)
          yPosition += 10
        }
      } else if (stampImage) {
        // Only stamp
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "normal")
        pdf.text("Official Stamp:", 20, yPosition)
        yPosition += 5

        try {
          pdf.addImage(stampImage, "PNG", 20, yPosition, 80, 40)
          yPosition += 45
        } catch (error) {
          console.error("Error adding stamp to PDF:", error)
          pdf.text("Stamp could not be displayed", 20, yPosition)
          yPosition += 10
        }
      }
    }

    // Footer
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "italic")
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 280)
    pdf.text(`Inspection ID: ${inspection.id}`, 150, 280)

    // Save the PDF
    pdf.save(`inspection_${inspection.id}_${inspection.date}.pdf`)
    console.log("✅ PDF generated successfully")
  } catch (error) {
    console.error("❌ Error generating PDF:", error)
    throw error
  }
}

export async function generateMultipleInspectionsPDF(inspections: Inspection[]) {
  try {
    console.log(`🖨️ Generating PDF for ${inspections.length} inspections`)

    const pdf = new jsPDF()
    let yPosition = 20

    // Header
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("FIREARM INSPECTION REPORTS", 105, yPosition, { align: "center" })
    yPosition += 10

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Total Inspections: ${inspections.length}`, 105, yPosition, { align: "center" })
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, yPosition + 5, { align: "center" })
    yPosition += 20

    for (let i = 0; i < inspections.length; i++) {
      const inspection = inspections[i]

      // Check if we need a new page
      if (yPosition > 220) {
        pdf.addPage()
        yPosition = 20
      }

      // Load signature and stamp images for this inspection
      const signatureImage = inspection.signature ? await loadImageAsBase64(inspection.signature) : null
      const stampImage = inspection.stamp ? await loadImageAsBase64(inspection.stamp) : null

      // Inspection header
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text(`INSPECTION ${i + 1} - ${inspection.date}`, 20, yPosition)
      yPosition += 8

      // Basic info in compact format
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Inspector: ${inspection.inspector}`, 20, yPosition)
      pdf.text(`Company: ${inspection.companyName}`, 110, yPosition)
      yPosition += 5

      pdf.text(`Make: ${inspection.make}`, 20, yPosition)
      pdf.text(`Caliber: ${inspection.caliber}`, 110, yPosition)
      yPosition += 5

      pdf.text(`Status: ${inspection.status.toUpperCase()}`, 20, yPosition)
      yPosition += 8

      // Serial numbers (compact)
      const serialInfo = []
      if (inspection.serialNumbers.barrel) serialInfo.push(`Barrel: ${inspection.serialNumbers.barrel}`)
      if (inspection.serialNumbers.frame) serialInfo.push(`Frame: ${inspection.serialNumbers.frame}`)
      if (inspection.serialNumbers.receiver) serialInfo.push(`Receiver: ${inspection.serialNumbers.receiver}`)

      if (serialInfo.length > 0) {
        pdf.text(`Serial Numbers: ${serialInfo.join(", ")}`, 20, yPosition)
        yPosition += 5
      }

      // Firearm and action types (compact)
      const firearmTypes = getSelectedFirearmTypes(inspection.firearmType)
      if (firearmTypes.length > 0) {
        pdf.text(`Type: ${firearmTypes.join(", ")}`, 20, yPosition)
        yPosition += 5
      }

      // Compact signature and stamp display
      if (signatureImage || stampImage) {
        yPosition += 3

        if (signatureImage && stampImage) {
          // Both signature and stamp (compact)
          pdf.setFontSize(8)
          pdf.text("Signature:", 20, yPosition)
          pdf.text("Stamp:", 90, yPosition)
          yPosition += 3

          try {
            pdf.addImage(signatureImage, "PNG", 20, yPosition, 60, 15)
            pdf.addImage(stampImage, "PNG", 90, yPosition, 40, 15)
            yPosition += 18
          } catch (error) {
            console.error("Error adding images to PDF:", error)
            pdf.text("Images could not be displayed", 20, yPosition)
            yPosition += 5
          }
        } else if (signatureImage) {
          // Only signature (compact)
          pdf.setFontSize(8)
          pdf.text("Signature:", 20, yPosition)
          yPosition += 3

          try {
            pdf.addImage(signatureImage, "PNG", 20, yPosition, 70, 18)
            yPosition += 21
          } catch (error) {
            console.error("Error adding signature to PDF:", error)
            pdf.text("Signature could not be displayed", 20, yPosition)
            yPosition += 5
          }
        } else if (stampImage) {
          // Only stamp (compact)
          pdf.setFontSize(8)
          pdf.text("Stamp:", 20, yPosition)
          yPosition += 3

          try {
            pdf.addImage(stampImage, "PNG", 20, yPosition, 50, 18)
            yPosition += 21
          } catch (error) {
            console.error("Error adding stamp to PDF:", error)
            pdf.text("Stamp could not be displayed", 20, yPosition)
            yPosition += 5
          }
        }
      }

      // Separator line
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, yPosition + 2, 190, yPosition + 2)
      yPosition += 8
    }

    // Save the PDF
    const timestamp = new Date().toISOString().split("T")[0]
    pdf.save(`inspections_batch_${timestamp}.pdf`)
    console.log("✅ Multiple inspections PDF generated successfully")
  } catch (error) {
    console.error("❌ Error generating multiple inspections PDF:", error)
    throw error
  }
}
