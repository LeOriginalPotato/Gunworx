"use client"

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
import {
  Search,
  FileText,
  BarChart3,
  Package,
  LogOut,
  CheckSquare,
  Square,
  Printer,
  Settings,
  Activity,
  Plus,
  X,
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

// Declare global DataService
declare global {
  interface Window {
    DataService: any
  }
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
  const [newInspection, setNewInspection] = useState<Partial<Inspection>>({
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

  // Load data from server on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (window.DataService) {
          const [firearmsData, inspectionsData] = await Promise.all([
            window.DataService.getFirearms(),
            window.DataService.getInspections(),
          ])
          setFirearms(firearmsData)
          setInspections(inspectionsData)
          console.log(`🎉 Loaded ${firearmsData.length} firearms and ${inspectionsData.length} inspections from server`)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error Loading Data",
          description: "Failed to load data from server. Please refresh the page.",
          variant: "destructive",
        })
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
        const updatedFirearm = await window.DataService.updateFirearm(editingFirearm.id, editingFirearm)
        setFirearms((prev) => prev.map((f) => (f.id === editingFirearm.id ? updatedFirearm : f)))
        setIsEditDialogOpen(false)
        setEditingFirearm(null)
        toast({
          title: "Firearm Updated",
          description: "Firearm details have been successfully updated.",
        })
      } catch (error) {
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
      await window.DataService.deleteFirearm(firearmId)
      setFirearms((prev) => prev.filter((f) => f.id !== firearmId))
      setSelectedFirearms((prev) => prev.filter((id) => id !== firearmId))
      toast({
        title: "Firearm Deleted",
        description: "Firearm has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete firearm. Please try again.",
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
        const updatedFirearm = await window.DataService.updateFirearm(currentFirearmForSignature.id, {
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

      const addedFirearm = await window.DataService.createFirearm(firearmToAdd)
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
      toast({
        title: "Error",
        description: "Failed to add firearm. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddInspection = async () => {
    try {
      const inspectionToAdd = {
        ...newInspection,
        date: newInspection.date || new Date().toISOString().split("T")[0],
        status: newInspection.status || "pending",
        inspector: newInspection.inspector || "Unknown Inspector",
        inspectorId: newInspection.inspectorId || "",
        companyName: newInspection.companyName || "",
        dealerCode: newInspection.dealerCode || "",
      } as Omit<Inspection, "id">

      const addedInspection = await window.DataService.createInspection(inspectionToAdd)
      setInspections((prev) => [...prev, addedInspection])
      setIsAddInspectionDialogOpen(false)

      // Reset form
      setNewInspection({
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

      toast({
        title: "Inspection Report Created",
        description: "New firearm inspection report has been successfully created.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create inspection report. Please try again.",
        variant: "destructive",
      })
    }
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
                              onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, inspectorId: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, date: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, companyName: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, dealerCode: e.target.value })}
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
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, pistol: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="pistol" className="text-sm">
                              Pistol
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="revolver"
                              checked={newInspection.firearmType?.revolver || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, revolver: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="revolver" className="text-sm">
                              Revolver
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="rifle"
                              checked={newInspection.firearmType?.rifle || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, rifle: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="rifle" className="text-sm">
                              Rifle
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="selfLoadingRifle"
                              checked={newInspection.firearmType?.selfLoadingRifle || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, selfLoadingRifle: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="selfLoadingRifle" className="text-sm">
                              Self-Loading Rifle/Carbine
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="shotgun"
                              checked={newInspection.firearmType?.shotgun || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, shotgun: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="shotgun" className="text-sm">
                              Shotgun
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="combination"
                              checked={newInspection.firearmType?.combination || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, combination: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="combination" className="text-sm">
                              Combination
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="otherFirearmType"
                              checked={newInspection.firearmType?.other || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, other: checked as boolean },
                                })
                              }
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
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  firearmType: { ...newInspection.firearmType, otherDetails: e.target.value },
                                })
                              }
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
                              onChange={(e) => setNewInspection({ ...newInspection, caliber: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, cartridgeCode: e.target.value })}
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
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  serialNumbers: { ...newInspection.serialNumbers, barrel: e.target.value },
                                })
                              }
                            />
                            <Input
                              type="text"
                              placeholder="Make"
                              value={newInspection.serialNumbers?.barrelMake || ""}
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  serialNumbers: { ...newInspection.serialNumbers, barrelMake: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <label className="text-sm">FRAME:</label>
                            <Input
                              type="text"
                              placeholder="Serial Number"
                              value={newInspection.serialNumbers?.frame || ""}
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  serialNumbers: { ...newInspection.serialNumbers, frame: e.target.value },
                                })
                              }
                            />
                            <Input
                              type="text"
                              placeholder="Make"
                              value={newInspection.serialNumbers?.frameMake || ""}
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  serialNumbers: { ...newInspection.serialNumbers, frameMake: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <label className="text-sm">RECEIVER:</label>
                            <Input
                              type="text"
                              placeholder="Serial Number"
                              value={newInspection.serialNumbers?.receiver || ""}
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  serialNumbers: { ...newInspection.serialNumbers, receiver: e.target.value },
                                })
                              }
                            />
                            <Input
                              type="text"
                              placeholder="Make"
                              value={newInspection.serialNumbers?.receiverMake || ""}
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  serialNumbers: { ...newInspection.serialNumbers, receiverMake: e.target.value },
                                })
                              }
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
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, manual: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="manual" className="text-sm">
                              Manual
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="semiAuto"
                              checked={newInspection.actionType?.semiAuto || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, semiAuto: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="semiAuto" className="text-sm">
                              Semi Auto
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="automatic"
                              checked={newInspection.actionType?.automatic || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, automatic: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="automatic" className="text-sm">
                              Automatic
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="bolt"
                              checked={newInspection.actionType?.bolt || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, bolt: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="bolt" className="text-sm">
                              Bolt
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="breakneck"
                              checked={newInspection.actionType?.breakneck || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, breakneck: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="breakneck" className="text-sm">
                              Breakneck
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="pump"
                              checked={newInspection.actionType?.pump || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, pump: checked as boolean },
                                })
                              }
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
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, cappingBreechLoader: checked as boolean },
                                })
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
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, lever: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="lever" className="text-sm">
                              Lever
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="cylinder"
                              checked={newInspection.actionType?.cylinder || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, cylinder: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="cylinder" className="text-sm">
                              Cylinder
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="fallingBlock"
                              checked={newInspection.actionType?.fallingBlock || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, fallingBlock: checked as boolean },
                                })
                              }
                            />
                            <label htmlFor="fallingBlock" className="text-sm">
                              Falling Block
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="otherActionType"
                              checked={newInspection.actionType?.other || false}
                              onCheckedChange={(checked) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, other: checked as boolean },
                                })
                              }
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
                              onChange={(e) =>
                                setNewInspection({
                                  ...newInspection,
                                  actionType: { ...newInspection.actionType, otherDetails: e.target.value },
                                })
                              }
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
                              onChange={(e) => setNewInspection({ ...newInspection, make: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, countryOfOrigin: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, observations: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, comments: e.target.value })}
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
                              onChange={(e) => setNewInspection({ ...newInspection, inspectorTitle: e.target.value })}
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
                                setNewInspection({
                                  ...newInspection,
                                  status: e.target.value as "passed" | "failed" | "pending",
                                })
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
                      <Button variant="default" onClick={handleAddInspection}>
                        Create Inspection Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                            <Button variant="outline" size="sm" onClick={() => handlePrintInspection(inspection)}>
                              <Printer className="h-4 w-4" />
                            </Button>
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
                <p className="text-sm text-gray-500">Complete Safe Keeping & Dealer Stock Register System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
          <TabsList className="grid w-full grid-cols-4">
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
            {permissions.canViewAnalytics && (
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
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
                              <Button variant="outline" size="sm" onClick={() => handlePrintInspection(inspection)}>
                                <Printer className="h-4 w-4" />
                              </Button>
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

          {permissions.canViewAnalytics && (
            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder for Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>View various analytics related to firearms and inspections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Analytics content goes here</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {permissions.canManageUsers && (
            <TabsContent value="users" className="space-y-6">
              {/* User Management Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <UserManagement />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

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
                        onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, inspectorId: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, date: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, companyName: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, dealerCode: e.target.value })}
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
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, pistol: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="pistol" className="text-sm">
                        Pistol
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="revolver"
                        checked={newInspection.firearmType?.revolver || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, revolver: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="revolver" className="text-sm">
                        Revolver
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rifle"
                        checked={newInspection.firearmType?.rifle || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, rifle: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="rifle" className="text-sm">
                        Rifle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selfLoadingRifle"
                        checked={newInspection.firearmType?.selfLoadingRifle || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, selfLoadingRifle: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="selfLoadingRifle" className="text-sm">
                        Self-Loading Rifle/Carbine
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shotgun"
                        checked={newInspection.firearmType?.shotgun || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, shotgun: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="shotgun" className="text-sm">
                        Shotgun
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="combination"
                        checked={newInspection.firearmType?.combination || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, combination: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="combination" className="text-sm">
                        Combination
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="otherFirearmType"
                        checked={newInspection.firearmType?.other || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, other: checked as boolean },
                          })
                        }
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
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            firearmType: { ...newInspection.firearmType, otherDetails: e.target.value },
                          })
                        }
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
                        onChange={(e) => setNewInspection({ ...newInspection, caliber: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, cartridgeCode: e.target.value })}
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
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            serialNumbers: { ...newInspection.serialNumbers, barrel: e.target.value },
                          })
                        }
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={newInspection.serialNumbers?.barrelMake || ""}
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            serialNumbers: { ...newInspection.serialNumbers, barrelMake: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">FRAME:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={newInspection.serialNumbers?.frame || ""}
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            serialNumbers: { ...newInspection.serialNumbers, frame: e.target.value },
                          })
                        }
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={newInspection.serialNumbers?.frameMake || ""}
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            serialNumbers: { ...newInspection.serialNumbers, frameMake: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="text-sm">RECEIVER:</label>
                      <Input
                        type="text"
                        placeholder="Serial Number"
                        value={newInspection.serialNumbers?.receiver || ""}
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            serialNumbers: { ...newInspection.serialNumbers, receiver: e.target.value },
                          })
                        }
                      />
                      <Input
                        type="text"
                        placeholder="Make"
                        value={newInspection.serialNumbers?.receiverMake || ""}
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            serialNumbers: { ...newInspection.serialNumbers, receiverMake: e.target.value },
                          })
                        }
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
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, manual: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="manual" className="text-sm">
                        Manual
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="semiAuto"
                        checked={newInspection.actionType?.semiAuto || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, semiAuto: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="semiAuto" className="text-sm">
                        Semi Auto
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="automatic"
                        checked={newInspection.actionType?.automatic || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, automatic: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="automatic" className="text-sm">
                        Automatic
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bolt"
                        checked={newInspection.actionType?.bolt || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, bolt: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="bolt" className="text-sm">
                        Bolt
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="breakneck"
                        checked={newInspection.actionType?.breakneck || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, breakneck: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="breakneck" className="text-sm">
                        Breakneck
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pump"
                        checked={newInspection.actionType?.pump || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, pump: checked as boolean },
                          })
                        }
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
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, cappingBreechLoader: checked as boolean },
                          })
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
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, lever: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="lever" className="text-sm">
                        Lever
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cylinder"
                        checked={newInspection.actionType?.cylinder || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, cylinder: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="cylinder" className="text-sm">
                        Cylinder
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fallingBlock"
                        checked={newInspection.actionType?.fallingBlock || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, fallingBlock: checked as boolean },
                          })
                        }
                      />
                      <label htmlFor="fallingBlock" className="text-sm">
                        Falling Block
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="otherActionType"
                        checked={newInspection.actionType?.other || false}
                        onCheckedChange={(checked) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, other: checked as boolean },
                          })
                        }
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
                        onChange={(e) =>
                          setNewInspection({
                            ...newInspection,
                            actionType: { ...newInspection.actionType, otherDetails: e.target.value },
                          })
                        }
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
                        onChange={(e) => setNewInspection({ ...newInspection, make: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, countryOfOrigin: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, observations: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, comments: e.target.value })}
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
                        onChange={(e) => setNewInspection({ ...newInspection, inspectorTitle: e.target.value })}
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
                          setNewInspection({
                            ...newInspection,
                            status: e.target.value as "passed" | "failed" | "pending",
                          })
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
                <Button variant="default" onClick={handleAddInspection}>
                  Create Inspection Report
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
