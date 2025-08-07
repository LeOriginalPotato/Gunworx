import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ""
    
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  } catch {
    return ""
  }
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    alert("No data to export")
    return
  }

  try {
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || ""
          const stringValue = String(value)
          
          // Handle values that contain commas, quotes, or newlines
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            // Escape quotes by doubling them and wrap in quotes
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          
          return stringValue
        }).join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error("Error exporting CSV:", error)
    alert("Error exporting data. Please try again.")
  }
}
