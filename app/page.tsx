"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { LoginForm } from "@/components/login-form"
import { generateInspectionPDF, generateMultipleInspectionsPDF } from "@/components/pdf-generator"
import { getUserPermissions } from "@/lib/auth"
import type { Firearm } from "@/lib/firearms-data"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SignaturePad } from "@/components/signature-pad"
import { dataService } from "@/lib/data-service"
import {
  Search,
  FileText,
  Package,
  LogOut,
  CheckSquare,
  Square,
  Printer,
  Settings,
  Activity,
  Plus,
  X,
  Edit,
  Trash2,
  PenTool,
  Download,
  RefreshCw,
  Database,
} from "lucide-react"
import { users } from "@/lib/auth"
import { UserManagement } from "@/components/user-management"

interface Inspection {
  id: string
  date: string
  inspector: string
  inspectorId: string
  companyName: string
  dealerCode: string

  // Firearm Type
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

  // Caliber/Cartridge
  caliber: string
  cartridgeCode: string

  // Serial Numbers
  serialNumbers: {
    barrel: string
    barrelMake: string
    frame: string
    frameMake: string
    receiver: string
    receiverMake: string
  }

  // Action Type
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

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState("")
  const [userRole, setUserRole] = useState("")
  const [firearms, setFirearms] = useState<Firearm[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFirearms, setSelectedFirearms] = useState<string[]>([])
  const [selectedInspections, setSelectedInspections] = useState<string[]>([])
  const [editingFirearm, setEditingFirearm] = useState<Firearm | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [currentFirearmForSignature, setCurrentFirearmForSignature] = useState<Firearm | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddFirearmDialogOpen, setIsAddFirearmDialogOpen] = useState(false)
  const [isAddInspectionDialogOpen, setIsAddInspectionDialogOpen] = useState(false)
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Edit inspection states
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  const [isEditInspectionDialogOpen, setIsEditInspectionDialogOpen] = useState(false)

  const [isBulkStatusDialogOpen, setIsBulkStatusDialogOpen] = useState(false)
  const [bulkStatusValue, setBulkStatusValue] = useState<"passed" | "failed" | "pending">("passed")

  // Initialize newFirearm with proper defaults
  const [newFirearm, setNewFirearm] = useState<Partial<Firearm>>({
    stockNo: "",
    dateReceived: new Date().toISOString().split("T")[0],
    make: "",
    type: "",
    caliber: "",
    serialNo: "",
    fullName: "",
    surname: "",
    registrationId: "",
    physicalAddress: "",
    licenceNo: "",
    licenceDate: "",
    remarks: "",
    status: "in-stock",
  })

  // Initialize newInspection with proper nested object structure and pre-filled data
  const getDefaultInspection = (): Partial<Inspection> => ({
    date: "2025-06-03",
    inspector: "Wikus Fourie",
    inspectorId: "9106045129083",
    companyName: "NICHOLAS YALE (PTY) LTD",
    dealerCode: "Pi10184610",
    firearmType: {
      pistol: false,
      revolver: false,
      rifle: false,
      selfLoadingRifle: false,
      shotgun: false,
      combination: false,
      other: false,
      otherDetails: "",
    },
    caliber: "",
    cartridgeCode: "",
    serialNumbers: {
      barrel: "",
      barrelMake: "",
      frame: "",
      frameMake: "",
      receiver: "",
      receiverMake: "",
    },
    actionType: {
      manual: false,
      semiAuto: false,
      automatic: false,
      bolt: false,
      breakneck: false,
      pump: false,
      cappingBreechLoader: false,
      lever: false,
      cylinder: false,
      fallingBlock: false,
      other: false,
      otherDetails: "",
    },
    make: "",
    countryOfOrigin: "",
    observations:
      "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    comments: "",
    signature: "",
    inspectorTitle: "",
    status: "pending",
  })

  const [newInspection, setNewInspection] = useState<Partial<Inspection>>(getDefaultInspection())

  // Load data from server on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load fresh data from server (ensures cross-device synchronization)
        const freshData = await dataService.refreshAllData()

        setFirearms(freshData.firearms || [])
        setInspections(freshData.inspections || [])

        console.log(
          `🎉 Loaded fresh data: ${freshData.firearms?.length || 0} firearms and ${freshData.inspections?.length || 0} inspections`,
        )

        // Perform a sync to ensure any local changes are uploaded
        await handleSyncData(false) // Silent sync
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error Loading Data",
          description: "Failed to load fresh data from server. Using cached data.",
          variant: "destructive",
        })

        // Fallback to cached data
        const cachedFirearms = dataService.getFromStorage?.("gunworx_firearms") || []
        const cachedInspections = dataService.getFromStorage?.("gunworx_inspections") || []
        setFirearms(cachedFirearms)
        setInspections(cachedInspections)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Get user permissions based on role
  const permissions = getUserPermissions(userRole)

  // Filter firearms based on search term and status
  const filteredFirearms = useMemo(() => {
    return firearms.filter((firearm) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(firearm).some(
          (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        )
      const matchesStatus = statusFilter === "all" || firearm.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [firearms, searchTerm, statusFilter])

  // Filter inspections based on search term
  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      return (
        searchTerm === "" ||
        Object.values(inspection).some(
          (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        )
      )
    })
  }, [inspections, searchTerm])

  // Calculate statistics
  const stats = useMemo(() => {
    const firearmsStats = {
      total: firearms.length,
      inStock: firearms.filter((f) => f.status === "in-stock").length,
      dealerStock: firearms.filter((f) => f.status === "dealer-stock").length,
      safeKeeping: firearms.filter((f) => f.status === "safe-keeping").length,
      collected: firearms.filter((f) => f.status === "collected").length,
    }

    const totalInspections = inspections.length
    const passedInspections = inspections.filter((i) => i.status === "passed").length
    const failedInspections = inspections.filter((i) => i.status === "failed").length
    const pendingInspections = inspections.filter((i) => i.status === "pending").length

    return {
      firearms: firearmsStats,
      inspections: {
        total: totalInspections,
        passed: passedInspections,
        failed: failedInspections,
        pending: pendingInspections,
      },
    }
  }, [firearms, inspections])

  const handleLogin = (username: string) => {
    // Find the user in the auth system to get their role
    const user = users.find((u) => u.username === username)
    if (user) {
      setIsLoggedIn(true)
      setCurrentUser(username)
      setUserRole(user.role)
      toast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
      })
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser("")
    setUserRole("")
    setSelectedFirearms([])
    setSelectedInspections([])
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const handleSyncData = async (showToast = true) => {
    try {
      setIsSyncing(true)

      const result = await dataService.syncData()

      if (showToast) {
        toast({
          title: "Data Synchronized",
          description: `Successfully synced ${result.synced.firearms} firearms, ${result.synced.inspections} inspections, and ${result.synced.users} users.`,
        })
      }

      // Reload data after sync
      const [firearmsData, inspectionsData] = await Promise.all([
        dataService.getFirearms(),
        dataService.getInspections(),
      ])

      setFirearms(firearmsData || [])
      setInspections(inspectionsData || [])
    } catch (error) {
      console.error("Error syncing data:", error)
      if (showToast) {
        toast({
          title: "Sync Failed",
          description: "Failed to synchronize data with server.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }

  const handleBackupData = async () => {
    try {
      const backup = await dataService.backupData()

      // Create downloadable backup file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `gunworx_backup_${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Backup Created",
        description: "Data backup has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Backup Failed",
        description: "Failed to create data backup.",
        variant: "destructive",
      })
    }
  }

  const handleSelectFirearm = (firearmId: string) => {
    setSelectedFirearms((prev) =>
      prev.includes(firearmId) ? prev.filter((id) => id !== firearmId) : [...prev, firearmId],
    )
  }

  const handleSelectAllFirearms = () => {
    if (selectedFirearms.length === filteredFirearms.length) {
      setSelectedFirearms([])
    } else {
      setSelectedFirearms(filteredFirearms.map((f) => f.id))
    }
  }

  const handleSelectInspection = (inspectionId: string) => {
    setSelectedInspections((prev) =>
      prev.includes(inspectionId) ? prev.filter((id) => id !== inspectionId) : [...prev, inspectionId],
    )
  }

  const handleSelectAllInspections = () => {
    if (selectedInspections.length === filteredInspections.length) {
      setSelectedInspections([])
    } else {
      setSelectedInspections(filteredInspections.map((i) => i.id))
    }
  }

  const handleEditFirearm = (firearm: Firearm) => {
    setEditingFirearm({ ...firearm })
    setIsEditDialogOpen(true)
  }

  const handleSaveFirearm = async () => {
    if (editingFirearm) {
      try {
        const updatedFirearm = await dataService.updateFirearm(editingFirearm.id, editingFirearm)
        setFirearms((prev) => prev.map((f) => (f.id === editingFirearm.id ? updatedFirearm : f)))
        setIsEditDialogOpen(false)
        setEditingFirearm(null)
        toast({
          title: "Firearm Updated",
          description: "Firearm details have been successfully updated.",
        })
      } catch (error) {
        console.error("Error updating firearm:", error)
        toast({
          title: "Error",
          description: "Failed to update firearm. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteFirearm = async (firearmId: string) => {
    try {
      await dataService.deleteFirearm(firearmId)
      setFirearms((prev) => prev.filter((f) => f.id !== firearmId))
      setSelectedFirearms((prev) => prev.filter((id) => id !== firearmId))
      toast({
        title: "Firearm Deleted",
        description: "Firearm has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting firearm:", error)
      toast({
        title: "Error",
        description: "Failed to delete firearm. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteInspection = async (inspectionId: string) => {
    try {
      await dataService.deleteInspection(inspectionId)
      setInspections((prev) => prev.filter((i) => i.id !== inspectionId))
      setSelectedInspections((prev) => prev.filter((id) => id !== inspectionId))
      toast({
        title: "Inspection Deleted",
        description: "Inspection report has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting inspection:", error)
      toast({
        title: "Error",
        description: "Failed to delete inspection. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSelectedInspections = async () => {
    if (selectedInspections.length === 0) {
      toast({
        title: "No Inspections Selected",
        description: "Please select inspections to delete.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSyncing(true)

      // Delete all selected inspections one by one
      const deletePromises = selectedInspections.map(async (id) => {
        try {
          const response = await fetch(`/api/inspections/${id}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
            throw new Error(errorData.error || `Failed to delete inspection ${id}`)
          }

          return { id, success: true }
        } catch (error) {
          console.error(`Error deleting inspection ${id}:`, error)
          return { id, success: false, error: error.message }
        }
      })

      const results = await Promise.all(deletePromises)
      const successful = results.filter((r) => r.success)
      const failed = results.filter((r) => !r.success)

      // Update state with successfully deleted inspections
      if (successful.length > 0) {
        const successfulIds = successful.map((r) => r.id)
        setInspections((prev) => prev.filter((i) => !successfulIds.includes(i.id)))
        setSelectedInspections([])
      }

      // Show appropriate toast message
      if (failed.length === 0) {
        toast({
          title: "Inspections Deleted",
          description: `${successful.length} inspection reports have been successfully deleted.`,
        })
      } else if (successful.length === 0) {
        toast({
          title: "Delete Failed",
          description: `Failed to delete all ${failed.length} selected inspections.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Partial Success",
          description: `${successful.length} inspections deleted, ${failed.length} failed.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in bulk delete operation:", error)
      toast({
        title: "Delete Operation Failed",
        description: "An unexpected error occurred during the delete operation.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCaptureSignature = (firearm: Firearm) => {
    setCurrentFirearmForSignature(firearm)
    setIsSignatureDialogOpen(true)
  }

  const handleSaveSignature = async (signatureData: string) => {
    if (currentFirearmForSignature) {
      try {
        const updatedFirearm = await dataService.updateFirearm(currentFirearmForSignature.id, {
          ...currentFirearmForSignature,
          signature: signatureData,
          signatureDate: new Date().toISOString(),
          signedBy: currentUser,
          status: "collected",
        })

        setFirearms((prev) => prev.map((f) => (f.id === currentFirearmForSignature.id ? updatedFirearm : f)))

        setIsSignatureDialogOpen(false)
        setCurrentFirearmForSignature(null)

        toast({
          title: "Signature Captured",
          description: "Firearm collection signature has been successfully recorded.",
        })
      } catch (error) {
        console.error("Error saving signature:", error)
        toast({
          title: "Error",
          description: "Failed to save signature. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleAddFirearm = async () => {
    try {
      if (!newFirearm.stockNo || !newFirearm.make || !newFirearm.serialNo) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Stock No, Make, Serial No).",
          variant: "destructive",
        })
        return
      }

      const firearmToAdd = {
        ...newFirearm,
        dateReceived: newFirearm.dateReceived || new Date().toISOString().split("T")[0],
        status: newFirearm.status || "in-stock",
      } as Omit<Firearm, "id">

      const addedFirearm = await dataService.createFirearm(firearmToAdd)
      setFirearms((prev) => [...prev, addedFirearm])
      setIsAddFirearmDialogOpen(false)
      setNewFirearm({
        stockNo: "",
        dateReceived: new Date().toISOString().split("T")[0],
        make: "",
        type: "",
        caliber: "",
        serialNo: "",
        fullName: "",
        surname: "",
        registrationId: "",
        physicalAddress: "",
        licenceNo: "",
        licenceDate: "",
        remarks: "",
        status: "in-stock",
      })
      toast({
        title: "Firearm Added",
        description: "New firearm has been successfully added to the database.",
      })
    } catch (error) {
      console.error("Error adding firearm:", error)
      toast({
        title: "Error",
        description: "Failed to add firearm. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddInspection = async () => {
    if (isSubmittingInspection) return // Prevent double submission

    setIsSubmittingInspection(true)

    try {
      console.log("Creating inspection with data:", newInspection)

      // Validate that we have the minimum required data
      if (!newInspection.date) {
        toast({
          title: "Validation Error",
          description: "Inspection date is required.",
          variant: "destructive",
        })
        return
      }

      // Ensure all nested objects are properly structured
      const inspectionToAdd: Omit<Inspection, "id"> = {
        date: newInspection.date,
        inspector: newInspection.inspector || "Unknown Inspector",
        inspectorId: newInspection.inspectorId || "",
        companyName: newInspection.companyName || "",
        dealerCode: newInspection.dealerCode || "",
        firearmType: {
          pistol: newInspection.firearmType?.pistol || false,
          revolver: newInspection.firearmType?.revolver || false,
          rifle: newInspection.firearmType?.rifle || false,
          selfLoadingRifle: newInspection.firearmType?.selfLoadingRifle || false,
          shotgun: newInspection.firearmType?.shotgun || false,
          combination: newInspection.firearmType?.combination || false,
          other: newInspection.firearmType?.other || false,
          otherDetails: newInspection.firearmType?.otherDetails || "",
        },
        caliber: newInspection.caliber || "",
        cartridgeCode: newInspection.cartridgeCode || "",
        serialNumbers: {
          barrel: newInspection.serialNumbers?.barrel || "",
          barrelMake: newInspection.serialNumbers?.barrelMake || "",
          frame: newInspection.serialNumbers?.frame || "",
          frameMake: newInspection.serialNumbers?.frameMake || "",
          receiver: newInspection.serialNumbers?.receiver || "",
          receiverMake: newInspection.serialNumbers?.receiverMake || "",
        },
        actionType: {
          manual: newInspection.actionType?.manual || false,
          semiAuto: newInspection.actionType?.semiAuto || false,
          automatic: newInspection.actionType?.automatic || false,
          bolt: newInspection.actionType?.bolt || false,
          breakneck: newInspection.actionType?.breakneck || false,
          pump: newInspection.actionType?.pump || false,
          cappingBreechLoader: newInspection.actionType?.cappingBreechLoader || false,
          lever: newInspection.actionType?.lever || false,
          cylinder: newInspection.actionType?.cylinder || false,
          fallingBlock: newInspection.actionType?.fallingBlock || false,
          other: newInspection.actionType?.other || false,
          otherDetails: newInspection.actionType?.otherDetails || "",
        },
        make: newInspection.make || "",
        countryOfOrigin: newInspection.countryOfOrigin || "",
        observations: newInspection.observations || "",
        comments: newInspection.comments || "",
        signature: newInspection.signature || "",
        inspectorTitle: newInspection.inspectorTitle || "",
        status: newInspection.status || "pending",
      }

      console.log("Processed inspection data:", inspectionToAdd)

      const addedInspection = await dataService.createInspection(inspectionToAdd)

      console.log("Successfully created inspection:", addedInspection)

      setInspections((prev) => [...prev, addedInspection])
      setIsAddInspectionDialogOpen(false)

      // Reset form to default state
      setNewInspection(getDefaultInspection())

      toast({
        title: "Inspection Report Created",
        description: "New firearm inspection report has been successfully created.",
      })
    } catch (error) {
      console.error("Error creating inspection:", error)
      toast({
        title: "Error",
        description: `Failed to create inspection report: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmittingInspection(false)
    }
  }

  // Edit inspection handlers
  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection({ ...inspection })
    setIsEditInspectionDialogOpen(true)
  }

  const handleSaveEditedInspection = async () => {
    if (!editingInspection) return

    try {
      setIsSyncing(true)

      // Use the data service to update the inspection
      const response = await fetch(`/api/inspections/${editingInspection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingInspection),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update inspection")
      }

      const data = await response.json()

      // Update local state immediately
      setInspections((prev) => prev.map((i) => (i.id === editingInspection.id ? data.inspection : i)))

      // Close dialog and reset state
      setIsEditInspectionDialogOpen(false)
      setEditingInspection(null)

      // Force a data refresh to ensure consistency
      await handleRefreshData()

      toast({
        title: "Inspection Updated",
        description: "Inspection report has been successfully updated and saved.",
      })
    } catch (error) {
      console.error("Error updating inspection:", error)
      toast({
        title: "Error",
        description: `Failed to update inspection: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const updateEditingInspectionField = (field: string, value: any, nestedField?: string) => {
    if (!editingInspection) return

    setEditingInspection((prev) => {
      if (!prev) return prev

      if (nestedField) {
        return {
          ...prev,
          [field]: {
            ...prev[field as keyof typeof prev],
            [nestedField]: value,
          },
        }
      } else {
        return {
          ...prev,
          [field]: value,
        }
      }
    })
  }

  const handleExportFirearms = (type: "all" | "selected" | "filtered") => {
    let dataToExport: Firearm[] = []

    switch (type) {
      case "all":
        dataToExport = firearms
        break
      case "selected":
        dataToExport = firearms.filter((f) => selectedFirearms.includes(f.id))
        break
      case "filtered":
        dataToExport = filteredFirearms
        break
    }

    if (dataToExport.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please select firearms to export or adjust your filters.",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = [
      "Stock No",
      "Date Received",
      "Make",
      "Type",
      "Caliber",
      "Serial No",
      "Full Name",
      "Surname",
      "Registration ID",
      "Physical Address",
      "Licence No",
      "Licence Date",
      "Remarks",
      "Status",
    ]

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((firearm) =>
        [
          firearm.stockNo,
          firearm.dateReceived,
          firearm.make,
          firearm.type,
          firearm.caliber,
          firearm.serialNo,
          firearm.fullName,
          firearm.surname,
          firearm.registrationId,
          `"${firearm.physicalAddress}"`,
          firearm.licenceNo,
          firearm.licenceDate,
          `"${firearm.remarks}"`,
          firearm.status,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `gunworx_firearms_${type}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `${dataToExport.length} firearms exported successfully.`,
    })
  }

  const handlePrintInspection = (inspection: Inspection) => {
    generateInspectionPDF(inspection)
    toast({
      title: "PDF Generated",
      description: "Inspection report has been generated and sent to printer.",
    })
  }

  const handlePrintSelectedInspections = () => {
    const inspectionsToPrint = inspections.filter((i) => selectedInspections.includes(i.id))
    if (inspectionsToPrint.length === 0) {
      toast({
        title: "No Inspections Selected",
        description: "Please select inspections to print.",
        variant: "destructive",
      })
      return
    }

    generateMultipleInspectionsPDF(inspectionsToPrint)
    toast({
      title: "PDF Generated",
      description: `${inspectionsToPrint.length} inspection reports have been generated and sent to printer.`,
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "in-stock":
        return "default"
      case "dealer-stock":
        return "secondary"
      case "safe-keeping":
        return "outline"
      case "collected":
        return "destructive"
      case "passed":
        return "default"
      case "failed":
        return "destructive"
      case "pending":
        return "secondary"
      default:
        return "default"
    }
  }

  // Helper function to safely update nested inspection objects
  const updateInspectionField = (field: string, value: any, nestedField?: string) => {
    setNewInspection((prev) => {
      if (nestedField) {
        return {
          ...prev,
          [field]: {
            ...prev[field as keyof typeof prev],
            [nestedField]: value,
          },
        }
      } else {
        return {
          ...prev,
          [field]: value,
        }
      }
    })
  }

  const handleRefreshData = async () => {
    try {
      setIsSyncing(true)

      const freshData = await dataService.refreshAllData()

      setFirearms(freshData.firearms || [])
      setInspections(freshData.inspections || [])

      toast({
        title: "Data Refreshed",
        description: `Loaded latest data: ${freshData.firearms.length} firearms, ${freshData.inspections.length} inspections`,
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data from server.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleRestoreData = async (backupData: any) => {
    try {
      setIsSyncing(true)

      const response = await fetch("/api/data-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", data: backupData }),
      })

      if (!response.ok) {
        throw new Error("Failed to restore data")
      }

      const result = await response.json()
      console.log("Data restored:", result)

      // Refresh data after restore
      await handleRefreshData()

      toast({
        title: "Data Restored",
        description: `Successfully restored ${result.restored.firearms} firearms, ${result.restored.inspections} inspections, and ${result.restored.users} users.`,
      })
    } catch (error) {
      console.error("Error restoring data:", error)
      toast({
        title: "Restore Failed",
        description: "Failed to restore data from backup.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLoadBackupFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to load.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string)
        await handleRestoreData(backupData)
      } catch (error) {
        console.error("Error parsing backup file:", error)
        toast({
          title: "Invalid File",
          description: "Failed to parse backup file. Please ensure it is a valid JSON file.",
          variant: "destructive",
        })
      }
    }

    reader.readAsText(file)
  }

  const handleClearAllInspections = async () => {
    try {
      setIsSyncing(true)

      const response = await fetch("/api/data-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_inspections" }),
      })

      if (!response.ok) {
        throw new Error("Failed to clear inspections")
      }

      const result = await response.json()

      // Update local state
      setInspections([])
      setSelectedInspections([])

      toast({
        title: "All Inspections Cleared",
        description: `Successfully removed ${result.cleared} inspection records from the system.`,
      })

      console.log(`🧹 Cleared ${result.cleared} inspections from the system`)
    } catch (error) {
      console.error("Error clearing all inspections:", error)
      toast({
        title: "Clear Failed",
        description: "Failed to clear all inspections from the system.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleBulkUpdateStatus = async () => {
    try {
      setIsSyncing(true)

      const result = await dataService.bulkUpdateInspectionStatus(
        bulkStatusValue,
        selectedInspections.length > 0 ? selectedInspections : undefined,
      )

      // Update local state
      setInspections((prev) =>
        prev.map((inspection) => {
          if (selectedInspections.length === 0 || selectedInspections.includes(inspection.id)) {
            return { ...inspection, status: bulkStatusValue }
          }
          return inspection
        }),
      )

      setSelectedInspections([])
      setIsBulkStatusDialogOpen(false)

      toast({
        title: "Status Updated",
        description: `Successfully updated ${result.updated} inspection${result.updated !== 1 ? "s" : ""} to "${bulkStatusValue}".`,
      })
    } catch (error) {
      console.error("Error updating inspection statuses:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update inspection statuses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading firearms database...</p>
        </div>
      </div>
    )
  }

  // Inspector role - only show inspections
  if (userRole === "inspector") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Inspection Portal</h1>
                  <p className="text-sm text-gray-500">View and Print Inspection Reports</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => handleRefreshData()} disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Refreshing..." : "Refresh Data"}
                </Button>
                <span className="text-sm text-gray-600">Welcome, {currentUser} (Inspector)</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Inspection Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inspections.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Passed</CardTitle>
                  <Badge variant="default" className="h-4 w-4 rounded-full p-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inspections.passed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <Badge variant="destructive" className="h-4 w-4 rounded-full p-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inspections.failed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Badge variant="secondary" className="h-4 w-4 rounded-full p-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inspections.pending}</div>
                </CardContent>
              </Card>
            </div>

            {/* Add Inspection Button */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Inspection</CardTitle>
                <CardDescription>Create a new inspection record</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsAddInspectionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inspection
                </Button>
              </CardContent>
            </Card>

            {/* Search Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Search Inspections</CardTitle>
                <CardDescription>Search across all inspection fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inspections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Print Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Print Options</CardTitle>
                <CardDescription>Generate PDF reports for selected inspections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handlePrintSelectedInspections}
                    variant="outline"
                    size="sm"
                    disabled={selectedInspections.length === 0}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Selected ({selectedInspections.length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inspections Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Inspection Records</CardTitle>
                    <CardDescription>
                      Showing {filteredInspections.length} of {stats.inspections.total} inspections
                      {selectedInspections.length > 0 && ` (${selectedInspections.length} selected)`}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllInspections}
                    disabled={filteredInspections.length === 0}
                  >
                    {selectedInspections.length === filteredInspections.length ? (
                      <CheckSquare className="h-4 w-4 mr-2" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    {selectedInspections.length === filteredInspections.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedInspections.length === filteredInspections.length &&
                              filteredInspections.length > 0
                            }
                            onCheckedChange={handleSelectAllInspections}
                          />
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInspections.map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedInspections.includes(inspection.id)}
                              onCheckedChange={() => handleSelectInspection(inspection.id)}
                            />
                          </TableCell>
                          <TableCell>{inspection.date}</TableCell>
                          <TableCell>{inspection.inspector}</TableCell>
                          <TableCell>{inspection.companyName}</TableCell>
                          <TableCell>{inspection.make}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(inspection.status)}>{inspection.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditInspection(inspection)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handlePrintInspection(inspection)}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Toaster />
      </div>
    )
  }

  // Regular users with full interface
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gunworx Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => handleRefreshData()} disabled={isSyncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Refreshing..." : "Refresh Data"}
              </Button>
              {userRole === "admin" && (
                <Button variant="outline" size="sm" onClick={handleBackupData}>
                  <Database className="h-4 w-4 mr-2" />
                  Backup
                </Button>
              )}
              <div className="text-right">
                <span className="text-sm text-gray-600">
                  Welcome, {currentUser} ({userRole})
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="firearms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {permissions.canViewFirearms && (
              <TabsTrigger value="firearms" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Firearms ({stats.firearms.total})</span>
              </TabsTrigger>
            )}
            {permissions.canViewInspections && (
              <TabsTrigger value="inspections" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Inspections ({stats.inspections.total})</span>
              </TabsTrigger>
            )}
            {permissions.canManageUsers && (
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
            )}
          </TabsList>

          {permissions.canViewFirearms && (
            <TabsContent value="firearms" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Firearms</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                    <Badge variant="default" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.inStock}</div>
                    <p className="text-xs text-muted-foreground">Workshop items</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dealer Stock</CardTitle>
                    <Badge variant="secondary" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.dealerStock}</div>
                    <p className="text-xs text-muted-foreground">Items in dealer stock</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Safe Keeping</CardTitle>
                    <Badge variant="outline" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.safeKeeping}</div>
                    <p className="text-xs text-muted-foreground">Items under safe keeping</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collected</CardTitle>
                    <Badge variant="destructive" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.collected}</div>
                    <p className="text-xs text-muted-foreground">Collected firearms</p>
                  </CardContent>
                </Card>
              </div>

              {/* Add Firearm */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Firearm</CardTitle>
                  <CardDescription>Add a new firearm to the database</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setIsAddFirearmDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Firearm
                  </Button>
                </CardContent>
              </Card>

              {/* Search Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Search & Filter</CardTitle>
                  <CardDescription>Search and filter firearms by various criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search firearms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="in-stock">In Stock</option>
                      <option value="dealer-stock">Dealer Stock</option>
                      <option value="safe-keeping">Safe Keeping</option>
                      <option value="collected">Collected</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Export Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Export firearms data in various formats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleExportFirearms("all")} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                    <Button
                      onClick={() => handleExportFirearms("selected")}
                      variant="outline"
                      size="sm"
                      disabled={selectedFirearms.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected ({selectedFirearms.length})
                    </Button>
                    <Button onClick={() => handleExportFirearms("filtered")} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Filtered ({filteredFirearms.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Firearms Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Firearms Database</CardTitle>
                      <CardDescription>
                        Showing {filteredFirearms.length} of {stats.firearms.total} firearms
                        {selectedFirearms.length > 0 && ` (${selectedFirearms.length} selected)`}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllFirearms}
                      disabled={filteredFirearms.length === 0}
                    >
                      {selectedFirearms.length === filteredFirearms.length ? (
                        <CheckSquare className="h-4 w-4 mr-2" />
                      ) : (
                        <Square className="h-4 w-4 mr-2" />
                      )}
                      {selectedFirearms.length === filteredFirearms.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedFirearms.length === filteredFirearms.length && filteredFirearms.length > 0
                              }
                              onCheckedChange={handleSelectAllFirearms}
                            />
                          </TableHead>
                          <TableHead>Stock No</TableHead>
                          <TableHead>Make</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Caliber</TableHead>
                          <TableHead>Serial No</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFirearms.map((firearm) => (
                          <TableRow key={firearm.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedFirearms.includes(firearm.id)}
                                onCheckedChange={() => handleSelectFirearm(firearm.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{firearm.stockNo}</TableCell>
                            <TableCell>{firearm.make}</TableCell>
                            <TableCell>{firearm.type}</TableCell>
                            <TableCell>{firearm.caliber}</TableCell>
                            <TableCell>{firearm.serialNo}</TableCell>
                            <TableCell>{firearm.fullName}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(firearm.status)}>{firearm.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditFirearm(firearm)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCaptureSignature(firearm)}
                                  disabled={firearm.status === "collected"}
                                >
                                  <PenTool className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteFirearm(firearm.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {permissions.canViewInspections && (
            <TabsContent value="inspections" className="space-y-6">
              {/* Inspections Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inspections.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Passed</CardTitle>
                    <Badge variant="default" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inspections.passed}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Failed</CardTitle>
                    <Badge variant="destructive" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inspections.failed}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Badge variant="secondary" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inspections.pending}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Inspection Button */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Inspection</CardTitle>
                  <CardDescription>Create a new inspection record</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setIsAddInspectionDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Inspection
                  </Button>
                </CardContent>
              </Card>

              {/* Search Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Search Inspections</CardTitle>
                  <CardDescription>Search across all inspection fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inspections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Admin Controls for Inspections */}
              {userRole === "admin" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Controls</CardTitle>
                    <CardDescription>Administrative actions for inspection management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handlePrintSelectedInspections}
                        variant="outline"
                        size="sm"
                        disabled={selectedInspections.length === 0}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Selected ({selectedInspections.length})
                      </Button>
                      <Button
                        onClick={handleDeleteSelectedInspections}
                        variant="destructive"
                        size="sm"
                        disabled={selectedInspections.length === 0 || isSyncing}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedInspections.length})
                      </Button>
                      <Button onClick={handleClearAllInspections} variant="destructive" size="sm" disabled={isSyncing}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All Inspections
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="backup-file">
                          <Download className="h-4 w-4 mr-2" />
                          Restore Backup
                          <input
                            type="file"
                            id="backup-file"
                            accept=".json"
                            onChange={handleLoadBackupFile}
                            className="hidden"
                          />
                        </label>
                      </Button>
                      <Button
                        onClick={() => setIsBulkStatusDialogOpen(true)}
                        variant="outline"
                        size="sm"
                        disabled={isSyncing}
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Update Status ({selectedInspections.length > 0 ? selectedInspections.length : "All"})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Print Controls for Non-Admin Users */}
              {userRole !== "admin" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Print Options</CardTitle>
                    <CardDescription>Generate PDF reports for selected inspections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handlePrintSelectedInspections}
                        variant="outline"
                        size="sm"
                        disabled={selectedInspections.length === 0}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Selected ({selectedInspections.length})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inspections Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Inspection Records</CardTitle>
                      <CardDescription>
                        Showing {filteredInspections.length} of {stats.inspections.total} inspections
                        {selectedInspections.length > 0 && ` (${selectedInspections.length} selected)`}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllInspections}
                      disabled={filteredInspections.length === 0}
                    >
                      {selectedInspections.length === filteredInspections.length ? (
                        <CheckSquare className="h-4 w-4 mr-2" />
                      ) : (
                        <Square className="h-4 w-4 mr-2" />
                      )}
                      {selectedInspections.length === filteredInspections.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedInspections.length === filteredInspections.length &&
                                filteredInspections.length > 0
                              }
                              onCheckedChange={handleSelectAllInspections}
                            />
                          </TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Inspector</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Make</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInspections.map((inspection) => (
                          <TableRow key={inspection.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedInspections.includes(inspection.id)}
                                onCheckedChange={() => handleSelectInspection(inspection.id)}
                              />
                            </TableCell>
                            <TableCell>{inspection.date}</TableCell>
                            <TableCell>{inspection.inspector}</TableCell>
                            <TableCell>{inspection.companyName}</TableCell>
                            <TableCell>{inspection.make}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(inspection.status)}>{inspection.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditInspection(inspection)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handlePrintInspection(inspection)}>
                                  <Printer className="h-4 w-4" />
                                </Button>
                                {userRole === "admin" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteInspection(inspection.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {permissions.canManageUsers && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Add Firearm Dialog */}
      {isAddFirearmDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Firearm</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsAddFirearmDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stockNo">Stock No *</Label>
                  <Input
                    id="stockNo"
                    type="text"
                    placeholder="Stock Number"
                    value={newFirearm.stockNo || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, stockNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateReceived">Date Received</Label>
                  <Input
                    id="dateReceived"
                    type="date"
                    value={newFirearm.dateReceived || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, dateReceived: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    type="text"
                    placeholder="Manufacturer"
                    value={newFirearm.make || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, make: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    type="text"
                    placeholder="Firearm Type"
                    value={newFirearm.type || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, type: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="caliber">Caliber</Label>
                  <Input
                    id="caliber"
                    type="text"
                    placeholder="Caliber"
                    value={newFirearm.caliber || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, caliber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="serialNo">Serial No *</Label>
                  <Input
                    id="serialNo"
                    type="text"
                    placeholder="Serial Number"
                    value={newFirearm.serialNo || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, serialNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Owner Full Name"
                    value={newFirearm.fullName || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Owner Surname"
                    value={newFirearm.surname || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, surname: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="registrationId">Registration ID</Label>
                  <Input
                    id="registrationId"
                    type="text"
                    placeholder="Registration ID"
                    value={newFirearm.registrationId || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, registrationId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="physicalAddress">Physical Address</Label>
                  <Textarea
                    id="physicalAddress"
                    placeholder="Physical Address"
                    value={newFirearm.physicalAddress || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, physicalAddress: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="licenceNo">Licence No</Label>
                  <Input
                    id="licenceNo"
                    type="text"
                    placeholder="Licence Number"
                    value={newFirearm.licenceNo || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, licenceNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="licenceDate">Licence Date</Label>
                  <Input
                    id="licenceDate"
                    type="date"
                    value={newFirearm.licenceDate || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, licenceDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Additional remarks"
                    value={newFirearm.remarks || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, remarks: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={newFirearm.status || "in-stock"}
                    onChange={(e) => setNewFirearm({ ...newFirearm, status: e.target.value as any })}
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="dealer-stock">Dealer Stock</option>
                    <option value="safe-keeping">Safe Keeping</option>
                    <option value="collected">Collected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsAddFirearmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFirearm}>Add Firearm</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Firearm Dialog */}
      {isEditDialogOpen && editingFirearm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Firearm</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-stockNo">Stock No</Label>
                  <Input
                    id="edit-stockNo"
                    type="text"
                    value={editingFirearm.stockNo}
                    onChange={(e) => setEditingFirearm({ ...editingFirearm, stockNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-make">Make</Label>
                  <Input
                    id="edit-make"
                    type="text"
                    value={editingFirearm.make}
                    onChange={(e) => setEditingFirearm({ ...editingFirearm, make: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Input
                    id="edit-type"
                    type="text"
                    value={editingFirearm.type}
                    onChange={(e) => setEditingFirearm({ ...editingFirearm, type: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-caliber">Caliber</Label>
                  <Input
                    id="edit-caliber"
                    type="text"
                    value={editingFirearm.caliber}
                    onChange={(e) => setEditingFirearm({ ...editingFirearm, caliber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-serialNo">Serial No</Label>
                  <Input
                    id="edit-serialNo"
                    type="text"
                    value={editingFirearm.serialNo}
                    onChange={(e) => setEditingFirearm({ ...editingFirearm, serialNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fullName">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    type="text"
                    value={editingFirearm.fullName}
                    onChange={(e) => setEditingFirearm({ ...editingFirearm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={editingFirearm.status}
                    onChange={(e) => setEditingFirearm({ ...editingFirearm, status: e.target.value as any })}
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="dealer-stock">Dealer Stock</option>
                    <option value="safe-keeping">Safe Keeping</option>
                    <option value="collected">Collected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFirearm}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Dialog */}
      {isSignatureDialogOpen && currentFirearmForSignature && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Capture Signature</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsSignatureDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Firearm: {currentFirearmForSignature.make} {currentFirearmForSignature.type} (
                  {currentFirearmForSignature.serialNo})
                </p>
                <p className="text-sm text-gray-600">Owner: {currentFirearmForSignature.fullName}</p>
                <SignaturePad onSave={handleSaveSignature} onCancel={() => setIsSignatureDialogOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Inspection Dialog */}
      {isAddInspectionDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl leading-6 font-bold text-gray-900">FIREARM INSPECTION REPORT</h3>
                  <p className="text-sm text-gray-600 mt-1">Complete firearm inspection form</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAddInspectionDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Inspector Information */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Inspector Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="inspector" className="block text-sm font-medium text-gray-700">
                        Inspector Name
                      </label>
                      <Input
                        id="inspector"
                        type="text"
                        placeholder="Inspector Name"
                        value={newInspection.inspector || ""}
                        onChange={(e) => updateInspectionField("inspector", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="inspectorId" className="block text-sm font-medium text-gray-700">
                        Inspector ID Number
                      </label>
                      <Input
                        id="inspectorId"
                        type="text"
                        placeholder="ID Number"
                        value={newInspection.inspectorId || ""}
                        onChange={(e) => updateInspectionField("inspectorId", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700">
                        Inspection Date
                      </label>
                      <Input
                        id="inspectionDate"
                        type="date"
                        value={newInspection.date || ""}
                        onChange={(e) => updateInspectionField("date", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Company Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Company Name"
                        value={newInspection.companyName || ""}
                        onChange={(e) => updateInspectionField("companyName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="dealerCode" className="block text-sm font-medium text-gray-700">
                        Dealer Code
                      </label>
                      <Input
                        id="dealerCode"
                        type="text"
                        placeholder="Dealer Code"
                        value={newInspection.dealerCode || ""}
                        onChange={(e) => updateInspectionField("dealerCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Firearm Type */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">FIREARM TYPE</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pistol"
                        checked={newInspection.firearmType?.pistol || false}
                        onCheckedChange={(checked) => updateInspectionField("firearmType", checked, "pistol")}
                      />
                      <label htmlFor="pistol" className="text-sm">
                        Pistol
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="revolver"
                        checked={newInspection.firearmType?.revolver || false}
                        onCheckedChange={(checked) => updateInspectionField("firearmType", checked, "revolver")}
                      />
                      <label htmlFor="revolver" className="text-sm">
                        Revolver
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rifle"
                        checked={newInspection.firearmType?.rifle || false}
                        onCheckedChange={(checked) => updateInspectionField("firearmType", checked, "rifle")}
                      />
                      <label htmlFor="rifle" className="text-sm">
                        Rifle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selfLoadingRifle"
                        checked={newInspection.firearmType?.selfLoadingRifle || false}
                        onCheckedChange={(checked) => updateInspectionField("firearmType", checked, "selfLoadingRifle")}
                      />
                      <label htmlFor="selfLoadingRifle" className="text-sm">
                        Self-Loading Rifle/Carbine
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shotgun"
                        checked={newInspection.firearmType?.shotgun || false}
                        onCheckedChange={(checked) => updateInspectionField("firearmType", checked, "shotgun")}
                      />
                      <label htmlFor="shotgun" className="text-sm">
                        Shotgun
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="combination"
                        checked={newInspection.firearmType?.combination || false}
                        onCheckedChange={(checked) => updateInspectionField("firearmType", checked, "combination")}
                      />
                      <label htmlFor="combination" className="text-sm">
                        Combination
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="otherFirearmType"
                        checked={newInspection.firearmType?.other || false}
                        onCheckedChange={(checked) => updateInspectionField("firearmType", checked, "other")}
                      />
                      <label htmlFor="otherFirearmType" className="text-sm">
                        Other
                      </label>
                    </div>
                  </div>
                  {newInspection.firearmType?.other && (
                    <div className="mt-3">
                      <label htmlFor="otherFirearmDetails" className="block text-sm font-medium text-gray-700">
                        Other Details
                      </label>
                      <Input
                        id="otherFirearmDetails"
                        type="text"
                        placeholder="Provide details"
                        value={newInspection.firearmType?.otherDetails || ""}
                        onChange={(e) => updateInspectionField("firearmType", e.target.value, "otherDetails")}
                      />
                    </div>
                  )}
                </div>

                {/* Caliber/Cartridge */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">CALIBER/CARTRIDGE</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="caliber" className="block text-sm font-medium text-gray-700">
                        Caliber/Cartridge
                      </label>
                      <Input
                        id="caliber"
                        type="text"
                        placeholder="e.g., .308 WIN"
                        value={newInspection.caliber || ""}
                        onChange={(e) => updateInspectionField("caliber", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="cartridgeCode" className="block text-sm font-medium text-gray-700">
                        Code
                      </label>
                      <Input
                        id="cartridgeCode"
                        type="text"
                        placeholder="e.g., 123"
                        value={newInspection.cartridgeCode || ""}
                        onChange={(e) => updateInspectionField("cartridgeCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Serial Numbers */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">SERIAL NUMBERS</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <label className="font-medium text-sm">Component</label>
                      <label className="font-medium text-sm">Serial Number</label>
                      <label className="font-medium text-sm">Make</label>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">BARREL:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={newInspection.serialNumbers?.barrel || ""}
                        onChange={(e) => updateInspectionField("serialNumbers", e.target.value, "barrel")}
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={newInspection.serialNumbers?.barrelMake || ""}
                        onChange={(e) => updateInspectionField("serialNumbers", e.target.value, "barrelMake")}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">FRAME:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={newInspection.serialNumbers?.frame || ""}
                        onChange={(e) => updateInspectionField("serialNumbers", e.target.value, "frame")}
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={newInspection.serialNumbers?.frameMake || ""}
                        onChange={(e) => updateInspectionField("serialNumbers", e.target.value, "frameMake")}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">RECEIVER:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={newInspection.serialNumbers?.receiver || ""}
                        onChange={(e) => updateInspectionField("serialNumbers", e.target.value, "receiver")}
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={newInspection.serialNumbers?.receiverMake || ""}
                        onChange={(e) => updateInspectionField("serialNumbers", e.target.value, "receiverMake")}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Type */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">ACTION TYPE</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="manual"
                        checked={newInspection.actionType?.manual || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "manual")}
                      />
                      <label htmlFor="manual" className="text-sm">
                        Manual
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="semiAuto"
                        checked={newInspection.actionType?.semiAuto || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "semiAuto")}
                      />
                      <label htmlFor="semiAuto" className="text-sm">
                        Semi Auto
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="automatic"
                        checked={newInspection.actionType?.automatic || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "automatic")}
                      />
                      <label htmlFor="automatic" className="text-sm">
                        Automatic
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bolt"
                        checked={newInspection.actionType?.bolt || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "bolt")}
                      />
                      <label htmlFor="bolt" className="text-sm">
                        Bolt
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="breakneck"
                        checked={newInspection.actionType?.breakneck || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "breakneck")}
                      />
                      <label htmlFor="breakneck" className="text-sm">
                        Breakneck
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pump"
                        checked={newInspection.actionType?.pump || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "pump")}
                      />
                      <label htmlFor="pump" className="text-sm">
                        Pump
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cappingBreechLoader"
                        checked={newInspection.actionType?.cappingBreechLoader || false}
                        onCheckedChange={(checked) =>
                          updateInspectionField("actionType", checked, "cappingBreechLoader")
                        }
                      />
                      <label htmlFor="cappingBreechLoader" className="text-sm">
                        Capping Breech Loader
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lever"
                        checked={newInspection.actionType?.lever || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "lever")}
                      />
                      <label htmlFor="lever" className="text-sm">
                        Lever
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cylinder"
                        checked={newInspection.actionType?.cylinder || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "cylinder")}
                      />
                      <label htmlFor="cylinder" className="text-sm">
                        Cylinder
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fallingBlock"
                        checked={newInspection.actionType?.fallingBlock || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "fallingBlock")}
                      />
                      <label htmlFor="fallingBlock" className="text-sm">
                        Falling Block
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="otherActionType"
                        checked={newInspection.actionType?.other || false}
                        onCheckedChange={(checked) => updateInspectionField("actionType", checked, "other")}
                      />
                      <label htmlFor="otherActionType" className="text-sm">
                        Other
                      </label>
                    </div>
                  </div>
                  {newInspection.actionType?.other && (
                    <div className="mt-3">
                      <label htmlFor="otherActionDetails" className="block text-sm font-medium text-gray-700">
                        Other Details
                      </label>
                      <Input
                        id="otherActionDetails"
                        type="text"
                        placeholder="Provide details"
                        value={newInspection.actionType?.otherDetails || ""}
                        onChange={(e) => updateInspectionField("actionType", e.target.value, "otherDetails")}
                      />
                    </div>
                  )}
                </div>

                {/* Make and Country */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">MAKE & ORIGIN</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                        MAKE
                      </label>
                      <Input
                        id="make"
                        type="text"
                        placeholder="e.g., RUGER"
                        value={newInspection.make || ""}
                        onChange={(e) => updateInspectionField("make", e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        (As engraved on the firearm i.e Beretta/Colt/Glock/Ruger, etc.)
                      </p>
                    </div>
                    <div>
                      <label htmlFor="countryOfOrigin" className="block text-sm font-medium text-gray-700">
                        COUNTRY OF ORIGIN
                      </label>
                      <Input
                        id="countryOfOrigin"
                        type="text"
                        placeholder="e.g., USA"
                        value={newInspection.countryOfOrigin || ""}
                        onChange={(e) => updateInspectionField("countryOfOrigin", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Observations and Comments */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">OBSERVATIONS & COMMENTS</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
                        Observations
                      </label>
                      <textarea
                        id="observations"
                        placeholder="According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm."
                        value={newInspection.observations || ""}
                        onChange={(e) => updateInspectionField("observations", e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                        Comments
                      </label>
                      <textarea
                        id="comments"
                        placeholder="Additional comments"
                        value={newInspection.comments || ""}
                        onChange={(e) => updateInspectionField("comments", e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Inspector Details */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">INSPECTOR CERTIFICATION</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="inspectorTitle" className="block text-sm font-medium text-gray-700">
                        Inspector Title
                      </label>
                      <Input
                        id="inspectorTitle"
                        type="text"
                        placeholder="e.g., Head Gunsmith"
                        value={newInspection.inspectorTitle || ""}
                        onChange={(e) => updateInspectionField("inspectorTitle", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="inspectionStatus" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="inspectionStatus"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={newInspection.status || "pending"}
                        onChange={(e) =>
                          updateInspectionField("status", e.target.value as "passed" | "failed" | "pending")
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsAddInspectionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleAddInspection} disabled={isSubmittingInspection}>
                  {isSubmittingInspection ? "Creating..." : "Create Inspection"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Inspection Dialog */}
      {isEditInspectionDialogOpen && editingInspection && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl leading-6 font-bold text-gray-900">EDIT FIREARM INSPECTION REPORT</h3>
                  <p className="text-sm text-gray-600 mt-1">Update firearm inspection details</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditInspectionDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Inspector Information */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Inspector Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="edit-inspector" className="block text-sm font-medium text-gray-700">
                        Inspector Name
                      </label>
                      <Input
                        id="edit-inspector"
                        type="text"
                        placeholder="Inspector Name"
                        value={editingInspection.inspector || ""}
                        onChange={(e) => updateEditingInspectionField("inspector", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-inspectorId" className="block text-sm font-medium text-gray-700">
                        Inspector ID Number
                      </label>
                      <Input
                        id="edit-inspectorId"
                        type="text"
                        placeholder="ID Number"
                        value={editingInspection.inspectorId || ""}
                        onChange={(e) => updateEditingInspectionField("inspectorId", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-inspectionDate" className="block text-sm font-medium text-gray-700">
                        Inspection Date
                      </label>
                      <Input
                        id="edit-inspectionDate"
                        type="date"
                        value={editingInspection.date || ""}
                        onChange={(e) => updateEditingInspectionField("date", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Company Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-companyName" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <Input
                        id="edit-companyName"
                        type="text"
                        placeholder="Company Name"
                        value={editingInspection.companyName || ""}
                        onChange={(e) => updateEditingInspectionField("companyName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-dealerCode" className="block text-sm font-medium text-gray-700">
                        Dealer Code
                      </label>
                      <Input
                        id="edit-dealerCode"
                        type="text"
                        placeholder="Dealer Code"
                        value={editingInspection.dealerCode || ""}
                        onChange={(e) => updateEditingInspectionField("dealerCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Firearm Type */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">FIREARM TYPE</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-pistol"
                        checked={editingInspection.firearmType?.pistol || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("firearmType", checked, "pistol")}
                      />
                      <label htmlFor="edit-pistol" className="text-sm">
                        Pistol
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-revolver"
                        checked={editingInspection.firearmType?.revolver || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("firearmType", checked, "revolver")}
                      />
                      <label htmlFor="edit-revolver" className="text-sm">
                        Revolver
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-rifle"
                        checked={editingInspection.firearmType?.rifle || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("firearmType", checked, "rifle")}
                      />
                      <label htmlFor="edit-rifle" className="text-sm">
                        Rifle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-selfLoadingRifle"
                        checked={editingInspection.firearmType?.selfLoadingRifle || false}
                        onCheckedChange={(checked) =>
                          updateEditingInspectionField("firearmType", checked, "selfLoadingRifle")
                        }
                      />
                      <label htmlFor="edit-selfLoadingRifle" className="text-sm">
                        Self-Loading Rifle/Carbine
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-shotgun"
                        checked={editingInspection.firearmType?.shotgun || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("firearmType", checked, "shotgun")}
                      />
                      <label htmlFor="edit-shotgun" className="text-sm">
                        Shotgun
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-combination"
                        checked={editingInspection.firearmType?.combination || false}
                        onCheckedChange={(checked) =>
                          updateEditingInspectionField("firearmType", checked, "combination")
                        }
                      />
                      <label htmlFor="edit-combination" className="text-sm">
                        Combination
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-otherFirearmType"
                        checked={editingInspection.firearmType?.other || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("firearmType", checked, "other")}
                      />
                      <label htmlFor="edit-otherFirearmType" className="text-sm">
                        Other
                      </label>
                    </div>
                  </div>
                  {editingInspection.firearmType?.other && (
                    <div className="mt-3">
                      <label htmlFor="edit-otherFirearmDetails" className="block text-sm font-medium text-gray-700">
                        Other Details
                      </label>
                      <Input
                        id="edit-otherFirearmDetails"
                        type="text"
                        placeholder="Provide details"
                        value={editingInspection.firearmType?.otherDetails || ""}
                        onChange={(e) => updateEditingInspectionField("firearmType", e.target.value, "otherDetails")}
                      />
                    </div>
                  )}
                </div>

                {/* Caliber/Cartridge */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">CALIBER/CARTRIDGE</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-caliber" className="block text-sm font-medium text-gray-700">
                        Caliber/Cartridge
                      </label>
                      <Input
                        id="edit-caliber"
                        type="text"
                        placeholder="e.g., .308 WIN"
                        value={editingInspection.caliber || ""}
                        onChange={(e) => updateEditingInspectionField("caliber", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-cartridgeCode" className="block text-sm font-medium text-gray-700">
                        Code
                      </label>
                      <Input
                        id="edit-cartridgeCode"
                        type="text"
                        placeholder="e.g., 123"
                        value={editingInspection.cartridgeCode || ""}
                        onChange={(e) => updateEditingInspectionField("cartridgeCode", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Serial Numbers */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">SERIAL NUMBERS</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <label className="font-medium text-sm">Component</label>
                      <label className="font-medium text-sm">Serial Number</label>
                      <label className="font-medium text-sm">Make</label>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">BARREL:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={editingInspection.serialNumbers?.barrel || ""}
                        onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "barrel")}
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={editingInspection.serialNumbers?.barrelMake || ""}
                        onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "barrelMake")}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">FRAME:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={editingInspection.serialNumbers?.frame || ""}
                        onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "frame")}
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={editingInspection.serialNumbers?.frameMake || ""}
                        onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "frameMake")}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">RECEIVER:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={editingInspection.serialNumbers?.receiver || ""}
                        onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "receiver")}
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={editingInspection.serialNumbers?.receiverMake || ""}
                        onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "receiverMake")}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Type */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">ACTION TYPE</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-manual"
                        checked={editingInspection.actionType?.manual || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "manual")}
                      />
                      <label htmlFor="edit-manual" className="text-sm">
                        Manual
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-semiAuto"
                        checked={editingInspection.actionType?.semiAuto || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "semiAuto")}
                      />
                      <label htmlFor="edit-semiAuto" className="text-sm">
                        Semi Auto
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-automatic"
                        checked={editingInspection.actionType?.automatic || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "automatic")}
                      />
                      <label htmlFor="edit-automatic" className="text-sm">
                        Automatic
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-bolt"
                        checked={editingInspection.actionType?.bolt || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "bolt")}
                      />
                      <label htmlFor="edit-bolt" className="text-sm">
                        Bolt
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-breakneck"
                        checked={editingInspection.actionType?.breakneck || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "breakneck")}
                      />
                      <label htmlFor="edit-breakneck" className="text-sm">
                        Breakneck
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-pump"
                        checked={editingInspection.actionType?.pump || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "pump")}
                      />
                      <label htmlFor="edit-pump" className="text-sm">
                        Pump
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-cappingBreechLoader"
                        checked={editingInspection.actionType?.cappingBreechLoader || false}
                        onCheckedChange={(checked) =>
                          updateEditingInspectionField("actionType", checked, "cappingBreechLoader")
                        }
                      />
                      <label htmlFor="edit-cappingBreechLoader" className="text-sm">
                        Capping Breech Loader
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-lever"
                        checked={editingInspection.actionType?.lever || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "lever")}
                      />
                      <label htmlFor="edit-lever" className="text-sm">
                        Lever
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-cylinder"
                        checked={editingInspection.actionType?.cylinder || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "cylinder")}
                      />
                      <label htmlFor="edit-cylinder" className="text-sm">
                        Cylinder
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-fallingBlock"
                        checked={editingInspection.actionType?.fallingBlock || false}
                        onCheckedChange={(checked) =>
                          updateEditingInspectionField("actionType", checked, "fallingBlock")
                        }
                      />
                      <label htmlFor="edit-fallingBlock" className="text-sm">
                        Falling Block
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-otherActionType"
                        checked={editingInspection.actionType?.other || false}
                        onCheckedChange={(checked) => updateEditingInspectionField("actionType", checked, "other")}
                      />
                      <label htmlFor="edit-otherActionType" className="text-sm">
                        Other
                      </label>
                    </div>
                  </div>
                  {editingInspection.actionType?.other && (
                    <div className="mt-3">
                      <label htmlFor="edit-otherActionDetails" className="block text-sm font-medium text-gray-700">
                        Other Details
                      </label>
                      <Input
                        id="edit-otherActionDetails"
                        type="text"
                        placeholder="Provide details"
                        value={editingInspection.actionType?.otherDetails || ""}
                        onChange={(e) => updateEditingInspectionField("actionType", e.target.value, "otherDetails")}
                      />
                    </div>
                  )}
                </div>

                {/* Make and Country */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">MAKE & ORIGIN</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-make" className="block text-sm font-medium text-gray-700">
                        MAKE
                      </label>
                      <Input
                        id="edit-make"
                        type="text"
                        placeholder="e.g., RUGER"
                        value={editingInspection.make || ""}
                        onChange={(e) => updateEditingInspectionField("make", e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        (As engraved on the firearm i.e Beretta/Colt/Glock/Ruger, etc.)
                      </p>
                    </div>
                    <div>
                      <label htmlFor="edit-countryOfOrigin" className="block text-sm font-medium text-gray-700">
                        COUNTRY OF ORIGIN
                      </label>
                      <Input
                        id="edit-countryOfOrigin"
                        type="text"
                        placeholder="e.g., USA"
                        value={editingInspection.countryOfOrigin || ""}
                        onChange={(e) => updateEditingInspectionField("countryOfOrigin", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Observations and Comments */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">OBSERVATIONS & COMMENTS</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-observations" className="block text-sm font-medium text-gray-700">
                        Observations
                      </label>
                      <textarea
                        id="edit-observations"
                        placeholder="According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm."
                        value={editingInspection.observations || ""}
                        onChange={(e) => updateEditingInspectionField("observations", e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-comments" className="block text-sm font-medium text-gray-700">
                        Comments
                      </label>
                      <textarea
                        id="edit-comments"
                        placeholder="Additional comments"
                        value={editingInspection.comments || ""}
                        onChange={(e) => updateEditingInspectionField("comments", e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Inspector Details */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">INSPECTOR CERTIFICATION</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-inspectorTitle" className="block text-sm font-medium text-gray-700">
                        Inspector Title
                      </label>
                      <Input
                        id="edit-inspectorTitle"
                        type="text"
                        placeholder="e.g., Head Gunsmith"
                        value={editingInspection.inspectorTitle || ""}
                        onChange={(e) => updateEditingInspectionField("inspectorTitle", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-inspectionStatus" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="edit-inspectionStatus"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={editingInspection.status || "pending"}
                        onChange={(e) =>
                          updateEditingInspectionField("status", e.target.value as "passed" | "failed" | "pending")
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="ghost" onClick={() => setIsEditInspectionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleSaveEditedInspection} disabled={isSyncing}>
                  {isSyncing ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Dialog */}
      {isBulkStatusDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Update Inspection Status</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsBulkStatusDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedInspections.length > 0
                      ? `Update status for ${selectedInspections.length} selected inspection${selectedInspections.length !== 1 ? "s" : ""}`
                      : `Update status for all ${inspections.length} inspections`}
                  </p>
                  <Label htmlFor="bulkStatus">New Status</Label>
                  <select
                    id="bulkStatus"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={bulkStatusValue}
                    onChange={(e) => setBulkStatusValue(e.target.value as "passed" | "failed" | "pending")}
                  >
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setIsBulkStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkUpdateStatus} disabled={isSyncing}>
                  {isSyncing ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  )
}
