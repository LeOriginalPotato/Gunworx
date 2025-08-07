import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
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

export function exportToCSV(data: any[], filename = "export.csv"): void {
  if (typeof window === "undefined") return // Don't run on server

  if (!data || data.length === 0) {
    console.warn("No data to export")
    return
  }

  // Get all unique keys from the data
  const headers = Array.from(new Set(data.flatMap((item) => Object.keys(item))))

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((item) =>
      headers
        .map((header) => {
          const value = item[header] || ""
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
