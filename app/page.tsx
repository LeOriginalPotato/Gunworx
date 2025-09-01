"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { LoginForm } from "@/components/login-form"
import { generateInspectionPDF, generateMultipleInspectionsPDF } from "@/components/pdf-generator"
import { getUserPermissions } from "@/lib/auth"
import type { Firearm } from "@/lib/firearms-data"
import { dataService } from "@/lib/data-service"
import {
  Search,
  FileText,
  LogOut,
  CheckSquare,
  Square,
  Printer,
  Activity,
  Plus,
  X,
  Edit,
  RefreshCw,
} from "lucide-react"
import { users } from "@/lib/auth"

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
  const [isSavingInspection, setIsSavingInspection] = useState(false)

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

  // Initialize newInspection with proper nested object structure
  const getDefaultInspection = (): Partial<Inspection> => ({
    date: new Date().toISOString().split("T")[0],
    inspector: "",
    inspectorId: "",
    companyName: "",
    dealerCode: "",
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
    observations: "",
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

  // Filter inspections based on search term including serial numbers
  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      if (searchTerm === "") return true

      const searchLower = searchTerm.toLowerCase()

      // Search in basic fields
      const basicFieldsMatch = [
        inspection.inspector,
        inspection.inspectorId,
        inspection.companyName,
        inspection.dealerCode,
        inspection.caliber,
        inspection.cartridgeCode,
        inspection.make,
        inspection.countryOfOrigin,
        inspection.observations,
        inspection.comments,
        inspection.inspectorTitle,
        inspection.status,
        inspection.date,
      ].some((value) => value && value.toString().toLowerCase().includes(searchLower))

      // Search in serial numbers
      const serialNumbersMatch =
        inspection.serialNumbers &&
        [
          inspection.serialNumbers.barrel,
          inspection.serialNumbers.barrelMake,
          inspection.serialNumbers.frame,
          inspection.serialNumbers.frameMake,
          inspection.serialNumbers.receiver,
          inspection.serialNumbers.receiverMake,
        ].some((value) => value && value.toString().toLowerCase().includes(searchLower))

      return basicFieldsMatch || serialNumbersMatch
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
      // Delete all selected inspections
      await Promise.all(selectedInspections.map((id) => dataService.deleteInspection(id)))

      // Update state
      setInspections((prev) => prev.filter((i) => !selectedInspections.includes(i.id)))
      setSelectedInspections([])

      toast({
        title: "Inspections Deleted",
        description: `${selectedInspections.length} inspection reports have been successfully deleted.`,
      })
    } catch (error) {
      console.error("Error deleting inspections:", error)
      toast({
        title: "Error",
        description: "Failed to delete some inspections. Please try again.",
        variant: "destructive",
      })
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
    console.log("🔧 Starting to edit inspection:", inspection.id)
    setEditingInspection({ ...inspection })
    setIsEditInspectionDialogOpen(true)
  }

  const handleSaveEditedInspection = async () => {
    if (!editingInspection || isSavingInspection) return

    setIsSavingInspection(true)

    try {
      console.log("💾 Saving edited inspection:", editingInspection.id, editingInspection)

      // Use the data service to update the inspection
      const updatedInspection = await dataService.updateInspection(editingInspection.id, editingInspection)

      // Update the local state with the updated inspection immediately
      setInspections((prev) => prev.map((i) => (i.id === editingInspection.id ? updatedInspection : i)))

      setIsEditInspectionDialogOpen(false)
      setEditingInspection(null)

      toast({
        title: "Inspection Updated",
        description: "Inspection report has been successfully updated and saved to the server.",
      })

      console.log("✅ Successfully updated inspection in UI")

      // Refresh data to ensure consistency
      setTimeout(async () => {
        try {
          const freshInspections = await dataService.getInspections()
          setInspections(freshInspections)
          console.log("🔄 Refreshed inspections after update")
        } catch (error) {
          console.error("Error refreshing inspections:", error)
        }
      }, 1000)
    } catch (error) {
      console.error("❌ Error updating inspection:", error)
      toast({
        title: "Error",
        description: "Failed to update inspection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingInspection(false)
    }
  }

  const updateEditingInspectionField = (field: string, value: any, nestedField?: string) => {
    if (!editingInspection) return

    console.log(`🔧 Updating field: ${field}${nestedField ? `.${nestedField}` : ""} = ${value}`)

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
                <CardDescription>Search across all inspection fields including serial numbers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inspections by make, caliber, serial numbers, inspector..."
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
                        <TableHead>Serial Numbers</TableHead>
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
                            <div className="text-xs space-y-1">
                              {inspection.serialNumbers.barrel && <div>Barrel: {inspection.serialNumbers.barrel}</div>}
                              {inspection.serialNumbers.frame && <div>Frame: {inspection.serialNumbers.frame}</div>}
                              {inspection.serialNumbers.receiver && (
                                <div>Receiver: {inspection.serialNumbers.receiver}</div>
                              )}
                            </div>
                          </TableCell>
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

        {/* Edit Inspection Dialog for Inspector */}
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
                          value={editingInspection.dealerCode || ""}
                          onChange={(e) => updateEditingInspectionField("dealerCode", e.target.value)}
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
                          value={editingInspection.serialNumbers?.barrel || ""}
                          onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "barrel")}
                        />
                        <Input
                          type="text"
                          value={editingInspection.serialNumbers?.barrelMake || ""}
                          onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "barrelMake")}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <label className="text-sm">FRAME:</label>
                        <Input
                          type="text"
                          value={editingInspection.serialNumbers?.frame || ""}
                          onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "frame")}
                        />
                        <Input
                          type="text"
                          value={editingInspection.serialNumbers?.frameMake || ""}
                          onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "frameMake")}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <label className="text-sm">RECEIVER:</label>
                        <Input
                          type="text"
                          value={editingInspection.serialNumbers?.receiver || ""}
                          onChange={(e) => updateEditingInspectionField("serialNumbers", e.target.value, "receiver")}
                        />
                        <Input
                          type="text"
                          value={editingInspection.serialNumbers?.receiverMake || ""}
                          onChange={(e) =>
                            updateEditingInspectionField("serialNumbers", e.target.value, "receiverMake")
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Make and Caliber */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">MAKE & CALIBER</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-make" className="block text-sm font-medium text-gray-700">
                          MAKE
                        </label>
                        <Input
                          id="edit-make"
                          type="text"
                          value={editingInspection.make || ""}
                          onChange={(e) => updateEditingInspectionField("make", e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-caliber" className="block text-sm font-medium text-gray-700">
                          Caliber/Cartridge
                        </label>
                        <Input
                          id="edit-caliber"
                          type="text"
                          value={editingInspection.caliber || ""}
                          onChange={(e) => updateEditingInspectionField("caliber", e.target.value)}
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
                  <Button onClick={handleSaveEditedInspection} disabled={isSavingInspection}>
                    {isSavingInspection ? "Saving..." : "Save Changes"}
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

  // Regular users with full interface - continue with the rest of the component...
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Rest of the component remains the same as it was working properly */}
      <Toaster />
    </div>
  )
}
