import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    alert("No data to export")
    return
  }

  try {
    // Get headers from the first object
    const headers = Object.keys(data[0])
    
    // Create CSV content
    const csvContent = [
      // Header row
      headers.join(","),
      // Data rows
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ""
        }).join(",")
      )
    ].join("\n")

    // Create and download the file
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
    } else {
      // Fallback for browsers that don't support download attribute
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error("Error exporting CSV:", error)
    alert("Failed to export CSV file")
  }
}
