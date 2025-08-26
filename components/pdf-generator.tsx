"use client"

import { toast } from "@/hooks/use-toast"

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
  // Create a new window for printing
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    toast({
      title: "Error",
      description: "Unable to open print window. Please check your popup blocker.",
      variant: "destructive",
    })
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
          margin: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .report-subtitle {
          color: #666;
          font-size: 14px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .field {
          margin-bottom: 10px;
        }
        .field-label {
          font-weight: bold;
          display: inline-block;
          width: 150px;
        }
        .field-value {
          display: inline-block;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-passed {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-failed {
          background-color: #fef2f2;
          color: #dc2626;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #d97706;
        }
        .findings-section {
          background-color: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }
        .recommendations-section {
          background-color: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">GUNWORX PORTAL</div>
        <div class="report-title">FIREARMS INSPECTION REPORT</div>
        <div class="report-subtitle">Firearms Control Act, 2000 (Act No. 60 of 2000)</div>
      </div>

      <div class="section">
        <div class="section-title">Inspection Details</div>
        <div class="field">
          <span class="field-label">Report ID:</span>
          <span class="field-value">${inspection.id}</span>
        </div>
        <div class="field">
          <span class="field-label">Date:</span>
          <span class="field-value">${new Date(inspection.date).toLocaleDateString("en-ZA")}</span>
        </div>
        <div class="field">
          <span class="field-label">Inspector:</span>
          <span class="field-value">${inspection.inspector}</span>
        </div>
        <div class="field">
          <span class="field-label">Type:</span>
          <span class="field-value">${inspection.type}</span>
        </div>
        <div class="field">
          <span class="field-label">Status:</span>
          <span class="field-value">
            <span class="status-badge status-${inspection.status}">${inspection.status}</span>
          </span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Inspection Findings</div>
        <div class="findings-section">
          ${inspection.findings}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Recommendations</div>
        <div class="recommendations-section">
          ${inspection.recommendations}
        </div>
      </div>

      <div class="footer">
        <p><strong>Gunworx Firearms Management Portal</strong></p>
        <p>Generated on: ${new Date().toLocaleDateString("en-ZA")} at ${new Date().toLocaleTimeString("en-ZA")}</p>
        <p>This report is generated in compliance with the Firearms Control Act, 2000</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

export function generateMultipleInspectionsPDF(inspections: Inspection[]) {
  // Create a new window for printing
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    toast({
      title: "Error",
      description: "Unable to open print window. Please check your popup blocker.",
      variant: "destructive",
    })
    return
  }

  const inspectionRows = inspections
    .map(
      (inspection) => `
    <tr>
      <td>${inspection.id}</td>
      <td>${new Date(inspection.date).toLocaleDateString("en-ZA")}</td>
      <td>${inspection.inspector}</td>
      <td>${inspection.type}</td>
      <td>
        <span class="status-badge status-${inspection.status}">${inspection.status}</span>
      </td>
      <td class="findings-cell">${inspection.findings.substring(0, 100)}${inspection.findings.length > 100 ? "..." : ""}</td>
    </tr>
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
          margin: 20px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .report-subtitle {
          color: #666;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .status-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-passed {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-failed {
          background-color: #fef2f2;
          color: #dc2626;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #d97706;
        }
        .findings-cell {
          max-width: 200px;
          word-wrap: break-word;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">GUNWORX PORTAL</div>
        <div class="report-title">MULTIPLE INSPECTION REPORTS</div>
        <div class="report-subtitle">Firearms Control Act, 2000 (Act No. 60 of 2000)</div>
        <div style="margin-top: 10px; font-size: 14px;">
          <strong>Total Reports: ${inspections.length}</strong>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Date</th>
            <th>Inspector</th>
            <th>Type</th>
            <th>Status</th>
            <th>Findings (Summary)</th>
          </tr>
        </thead>
        <tbody>
          ${inspectionRows}
        </tbody>
      </table>

      <div class="footer">
        <p><strong>Gunworx Firearms Management Portal</strong></p>
        <p>Generated on: ${new Date().toLocaleDateString("en-ZA")} at ${new Date().toLocaleTimeString("en-ZA")}</p>
        <p>This report contains ${inspections.length} inspection records in compliance with the Firearms Control Act, 2000</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
