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
  stamp?: string
  inspectorTitle: string
  status: "passed" | "failed" | "pending"
}

export function generateInspectionPDF(inspection: Inspection) {
  const doc = new jsPDF()

  // Set up page margins
  const margin = 20
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const contentWidth = pageWidth - margin * 2

  let yPosition = margin

  // Header with logo - centered and original size
  try {
    // Add header image centered at top
    const headerImg = new Image()
    headerImg.crossOrigin = "anonymous"
    headerImg.src = "/gunworx-header.png"

    headerImg.onload = () => {
      // Center the 100x35 image (increased height)
      const imgWidth = 100
      const imgHeight = 35
      const xPosition = (pageWidth - imgWidth) / 2

      doc.addImage(headerImg, "PNG", xPosition, yPosition, imgWidth, imgHeight)

      // Continue with rest of document
      generatePDFContent()
    }

    headerImg.onerror = () => {
      console.warn("Header image failed to load, continuing without it")
      generatePDFContent()
    }
  } catch (error) {
    console.warn("Error loading header image:", error)
    generatePDFContent()
  }

  function generatePDFContent() {
    yPosition = margin + 45 // Increased from 30 to account for taller header

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

    // Two column layout for inspector info
    const col1X = margin
    const col2X = margin + contentWidth / 2

    doc.text(`Inspector: ${inspection.inspector}`, col1X, yPosition)
    doc.text(`ID Number: ${inspection.inspectorId}`, col2X, yPosition)
    yPosition += 6

    doc.text(`Company: ${inspection.companyName}`, col1X, yPosition)
    doc.text(`Dealer Code: ${inspection.dealerCode}`, col2X, yPosition)
    yPosition += 6

    doc.text(`Date: ${inspection.date}`, col1X, yPosition)
    doc.text(`Title: ${inspection.inspectorTitle}`, col2X, yPosition)
    yPosition += 12

    // Firearm Type Section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("FIREARM TYPE", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    const firearmTypes = []
    if (inspection.firearmType.pistol) firearmTypes.push("Pistol")
    if (inspection.firearmType.revolver) firearmTypes.push("Revolver")
    if (inspection.firearmType.rifle) firearmTypes.push("Rifle")
    if (inspection.firearmType.selfLoadingRifle) firearmTypes.push("Self-Loading Rifle/Carbine")
    if (inspection.firearmType.shotgun) firearmTypes.push("Shotgun")
    if (inspection.firearmType.combination) firearmTypes.push("Combination")
    if (inspection.firearmType.other) firearmTypes.push(`Other: ${inspection.firearmType.otherDetails}`)

    doc.text(`Selected Types: ${firearmTypes.join(", ") || "None"}`, margin, yPosition)
    yPosition += 10

    // Caliber/Cartridge Section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("CALIBER/CARTRIDGE", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Caliber: ${inspection.caliber}`, col1X, yPosition)
    doc.text(`Code: ${inspection.cartridgeCode}`, col2X, yPosition)
    yPosition += 12

    // Serial Numbers Section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("SERIAL NUMBERS", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    if (inspection.serialNumbers.barrel) {
      doc.text(`Barrel: ${inspection.serialNumbers.barrel} (${inspection.serialNumbers.barrelMake})`, margin, yPosition)
      yPosition += 6
    }
    if (inspection.serialNumbers.frame) {
      doc.text(`Frame: ${inspection.serialNumbers.frame} (${inspection.serialNumbers.frameMake})`, margin, yPosition)
      yPosition += 6
    }
    if (inspection.serialNumbers.receiver) {
      doc.text(
        `Receiver: ${inspection.serialNumbers.receiver} (${inspection.serialNumbers.receiverMake})`,
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
    if (inspection.actionType.manual) actionTypes.push("Manual")
    if (inspection.actionType.semiAuto) actionTypes.push("Semi Auto")
    if (inspection.actionType.automatic) actionTypes.push("Automatic")
    if (inspection.actionType.bolt) actionTypes.push("Bolt")
    if (inspection.actionType.breakneck) actionTypes.push("Breakneck")
    if (inspection.actionType.pump) actionTypes.push("Pump")
    if (inspection.actionType.cappingBreechLoader) actionTypes.push("Capping Breech Loader")
    if (inspection.actionType.lever) actionTypes.push("Lever")
    if (inspection.actionType.cylinder) actionTypes.push("Cylinder")
    if (inspection.actionType.fallingBlock) actionTypes.push("Falling Block")
    if (inspection.actionType.other) actionTypes.push(`Other: ${inspection.actionType.otherDetails}`)

    doc.text(`Selected Actions: ${actionTypes.join(", ") || "None"}`, margin, yPosition)
    yPosition += 12

    // Make and Country Section
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("MAKE & ORIGIN", margin, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Make: ${inspection.make}`, col1X, yPosition)
    doc.text(`Country of Origin: ${inspection.countryOfOrigin}`, col2X, yPosition)
    yPosition += 12

    // Observations Section
    if (inspection.observations) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("OBSERVATIONS", margin, yPosition)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)

      // Split long text into multiple lines
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
    doc.text(`Status: ${inspection.status.toUpperCase()}`, margin, yPosition)
    yPosition += 12

    // Signature and Stamp Section
    if (inspection.signature || inspection.stamp) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("INSPECTOR SIGNATURE & STAMP", margin, yPosition)
      yPosition += 8

      // Load both signature and stamp images
      const imagesToLoad = []

      if (inspection.signature) {
        imagesToLoad.push({
          type: "signature",
          src: inspection.signature,
          label: "Signature",
        })
      }

      if (inspection.stamp) {
        imagesToLoad.push({
          type: "stamp",
          src: inspection.stamp,
          label: "Official Stamp",
        })
      }

      let imagesLoaded = 0
      const totalImages = imagesToLoad.length
      const loadedImages = {}

      if (totalImages === 0) {
        // No images to load, save PDF
        doc.save(`inspection_report_${inspection.id}_${inspection.date}.pdf`)
        return
      }

      imagesToLoad.forEach((imageInfo) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = imageInfo.src

        img.onload = () => {
          loadedImages[imageInfo.type] = img
          imagesLoaded++

          if (imagesLoaded === totalImages) {
            // All images loaded, add them to PDF
            let currentY = yPosition

            // Add signature if available
            if (loadedImages.signature) {
              doc.setFont("helvetica", "normal")
              doc.setFontSize(10)
              doc.text("Inspector Signature:", margin, currentY)
              currentY += 6

              doc.addImage(loadedImages.signature, "PNG", margin, currentY, 100, 30)
              currentY += 35
            }

            // Add stamp if available (positioned to the right of signature or below)
            if (loadedImages.stamp) {
              const stampX = loadedImages.signature ? margin + 110 : margin
              const stampY = loadedImages.signature ? yPosition + 6 : currentY

              doc.setFont("helvetica", "normal")
              doc.setFontSize(10)
              doc.text("Official Stamp:", stampX, stampY)

              doc.addImage(loadedImages.stamp, "PNG", stampX, stampY + 6, 80, 80)

              if (!loadedImages.signature) {
                currentY += 90
              }
            }

            // Add inspector details
            currentY += 10
            doc.setFont("helvetica", "normal")
            doc.setFontSize(10)
            doc.text(`${inspection.inspector}`, margin, currentY)
            doc.text(`${inspection.inspectorTitle}`, margin, currentY + 6)

            // Save the PDF
            doc.save(`inspection_report_${inspection.id}_${inspection.date}.pdf`)
          }
        }

        img.onerror = () => {
          console.warn(`Failed to load ${imageInfo.type} image`)
          imagesLoaded++

          if (imagesLoaded === totalImages) {
            // Save PDF even if some images failed to load
            doc.save(`inspection_report_${inspection.id}_${inspection.date}.pdf`)
          }
        }
      })
    } else {
      // No signature or stamp, save PDF
      doc.save(`inspection_report_${inspection.id}_${inspection.date}.pdf`)
    }
  }
}

export function generateMultipleInspectionsPDF(inspections: Inspection[]) {
  const doc = new jsPDF()

  // Pre-load the header image
  const headerImg = new Image()
  headerImg.crossOrigin = "anonymous"
  headerImg.src = "/gunworx-header.png"

  headerImg.onload = () => {
    // Generate all pages with header
    let pageIndex = 0

    function generateNextPage() {
      if (pageIndex >= inspections.length) {
        // All pages generated, save PDF
        doc.save(`multiple_inspections_${new Date().toISOString().split("T")[0]}.pdf`)
        return
      }

      if (pageIndex > 0) {
        doc.addPage()
      }

      const inspection = inspections[pageIndex]
      generateSingleInspectionPage(doc, inspection, headerImg, () => {
        pageIndex++
        generateNextPage()
      })
    }

    generateNextPage()
  }

  headerImg.onerror = () => {
    console.warn("Header image failed to load, generating PDF without headers")
    // Generate all pages without header
    let pageIndex = 0

    function generateNextPage() {
      if (pageIndex >= inspections.length) {
        // All pages generated, save PDF
        doc.save(`multiple_inspections_${new Date().toISOString().split("T")[0]}.pdf`)
        return
      }

      if (pageIndex > 0) {
        doc.addPage()
      }

      const inspection = inspections[pageIndex]
      generateSingleInspectionPage(doc, inspection, null, () => {
        pageIndex++
        generateNextPage()
      })
    }

    generateNextPage()
  }
}

function generateSingleInspectionPage(
  doc: jsPDF,
  inspection: Inspection,
  headerImg: HTMLImageElement | null = null,
  onComplete?: () => void,
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
    yPosition = margin + 45 // Account for header space
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

  // Basic info in two columns
  const col1X = margin
  const col2X = margin + contentWidth / 2

  doc.text(`Inspector: ${inspection.inspector}`, col1X, yPosition)
  doc.text(`Date: ${inspection.date}`, col2X, yPosition)
  yPosition += 6

  doc.text(`Company: ${inspection.companyName}`, col1X, yPosition)
  doc.text(`Make: ${inspection.make}`, col2X, yPosition)
  yPosition += 6

  doc.text(`Caliber: ${inspection.caliber}`, col1X, yPosition)
  doc.text(`Status: ${inspection.status.toUpperCase()}`, col2X, yPosition)
  yPosition += 10

  // Serial numbers (compact)
  if (inspection.serialNumbers.receiver) {
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
    const maxLines = 3 // Limit to 3 lines for compact view
    const displayLines = obsLines.slice(0, maxLines)
    if (obsLines.length > maxLines) {
      displayLines[maxLines - 1] += "..."
    }

    doc.text(displayLines, margin, yPosition)
    yPosition += displayLines.length * 6 + 6
  }

  // Compact signature and stamp section
  if (inspection.signature || inspection.stamp) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Signature & Stamp:", margin, yPosition)
    yPosition += 6

    // Load both signature and stamp images for compact display
    const imagesToLoad = []

    if (inspection.signature) {
      imagesToLoad.push({
        type: "signature",
        src: inspection.signature,
      })
    }

    if (inspection.stamp) {
      imagesToLoad.push({
        type: "stamp",
        src: inspection.stamp,
      })
    }

    let imagesLoaded = 0
    const totalImages = imagesToLoad.length
    const loadedImages = {}

    if (totalImages === 0) {
      // No images to load, continue
      if (onComplete) onComplete()
      return
    }

    imagesToLoad.forEach((imageInfo) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = imageInfo.src

      img.onload = () => {
        loadedImages[imageInfo.type] = img
        imagesLoaded++

        if (imagesLoaded === totalImages) {
          // All images loaded, add them to PDF (compact size)
          let currentX = margin

          // Add signature if available (compact)
          if (loadedImages.signature) {
            doc.addImage(loadedImages.signature, "PNG", currentX, yPosition, 60, 20)
            currentX += 70
          }

          // Add stamp if available (compact)
          if (loadedImages.stamp) {
            doc.addImage(loadedImages.stamp, "PNG", currentX, yPosition, 40, 40)
          }

          if (onComplete) onComplete()
        }
      }

      img.onerror = () => {
        console.warn(`Failed to load ${imageInfo.type} image for page`)
        imagesLoaded++

        if (imagesLoaded === totalImages) {
          if (onComplete) onComplete()
        }
      }
    })
  } else {
    // No signature or stamp, continue
    if (onComplete) onComplete()
  }
}
