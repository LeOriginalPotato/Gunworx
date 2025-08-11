"use client"

interface Inspection {
  id: string
  date: string
  inspector: string
  type: string
  findings: string
  status: "passed" | "failed" | "pending"
  recommendations: string
}

export function generateInspectionPDF(inspection: Inspection) {
  // Create a new window for the PDF content
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Please allow popups to generate PDF reports")
    return
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inspection Report - ${inspection.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .company-subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin-top: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .info-value {
          margin-left: 10px;
        }
        .status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .status.passed {
          background-color: #dcfce7;
          color: #166534;
        }
        .status.failed {
          background-color: #fef2f2;
          color: #dc2626;
        }
        .status.pending {
          background-color: #fef3c7;
          color: #d97706;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #2563eb;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .content-box {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">GUNWORX</div>
        <div class="company-subtitle">Firearms Management & Inspection Services</div>
        <div class="report-title">INSPECTION REPORT</div>
      </div>

      <div class="info-grid">
        <div>
          <div class="info-item">
            <span class="info-label">Report ID:</span>
            <span class="info-value">${inspection.id}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Inspection Date:</span>
            <span class="info-value">${inspection.date}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Inspector:</span>
            <span class="info-value">${inspection.inspector}</span>
          </div>
        </div>
        <div>
          <div class="info-item">
            <span class="info-label">Inspection Type:</span>
            <span class="info-value">${inspection.type}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value">
              <span class="status ${inspection.status}">${inspection.status}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Generated:</span>
            <span class="info-value">${new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">INSPECTION FINDINGS</div>
        <div class="content-box">
          ${inspection.findings}
        </div>
      </div>

      <div class="section">
        <div class="section-title">RECOMMENDATIONS</div>
        <div class="content-box">
          ${inspection.recommendations}
        </div>
      </div>

      <div class="footer">
        <p>This report was generated electronically by the Gunworx Management System</p>
        <p>Report generated on ${new Date().toLocaleString()} | Gunworx Firearms Management Portal</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

export function generateMultipleInspectionsPDF(inspections: Inspection[]) {
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Please allow popups to generate PDF reports")
    return
  }

  const inspectionSections = inspections
    .map(
      (inspection) => `
    <div class="inspection-section">
      <div class="inspection-header">
        <h3>Inspection Report #${inspection.id}</h3>
        <div class="inspection-meta">
          <span><strong>Date:</strong> ${inspection.date}</span>
          <span><strong>Inspector:</strong> ${inspection.inspector}</span>
          <span><strong>Type:</strong> ${inspection.type}</span>
          <span class="status ${inspection.status}">${inspection.status}</span>
        </div>
      </div>
      
      <div class="findings-section">
        <h4>Findings:</h4>
        <div class="content-box">${inspection.findings}</div>
      </div>
      
      <div class="recommendations-section">
        <h4>Recommendations:</h4>
        <div class="content-box">${inspection.recommendations}</div>
      </div>
    </div>
  `,
    )
    .join("")

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Multiple Inspection Reports</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .company-subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin-top: 15px;
        }
        .inspection-section {
          margin-bottom: 40px;
          page-break-inside: avoid;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }
        .inspection-header {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .inspection-header h3 {
          margin: 0 0 10px 0;
          color: #2563eb;
        }
        .inspection-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
        }
        .inspection-meta span {
          font-size: 14px;
        }
        .status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .status.passed {
          background-color: #dcfce7;
          color: #166534;
        }
        .status.failed {
          background-color: #fef2f2;
          color: #dc2626;
        }
        .status.pending {
          background-color: #fef3c7;
          color: #d97706;
        }
        .findings-section, .recommendations-section {
          margin-bottom: 20px;
        }
        .findings-section h4, .recommendations-section h4 {
          margin: 0 0 10px 0;
          color: #374151;
          font-size: 16px;
        }
        .content-box {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { margin: 0; }
          .inspection-section { page-break-after: always; }
          .inspection-section:last-child { page-break-after: auto; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">GUNWORX</div>
        <div class="company-subtitle">Firearms Management & Inspection Services</div>
        <div class="report-title">MULTIPLE INSPECTION REPORTS</div>
        <p style="margin-top: 15px; font-size: 14px;">
          Generated: ${new Date().toLocaleString()} | Total Reports: ${inspections.length}
        </p>
      </div>

      ${inspectionSections}

      <div class="footer">
        <p>These reports were generated electronically by the Gunworx Management System</p>
        <p>Report generated on ${new Date().toLocaleString()} | Gunworx Firearms Management Portal</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}
