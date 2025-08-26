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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
      if (
        !newInspection.inspector ||
        !newInspection.inspectorId ||
        !newInspection.companyName ||
        !newInspection.dealerCode
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Inspector, ID, Company Name, Dealer Code).",
          variant: "destructive",
        })
        return
      }

      const inspectionToAdd = {
        ...newInspection,
        date: newInspection.date || new Date().toISOString().split("T")[0],
        status: newInspection.status || "pending",
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
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Findings</TableHead>
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
                          <TableCell>{inspection.type}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(inspection.status)}>{inspection.status}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{inspection.findings}</TableCell>
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
                    <p className="text-xs text-muted-foreground">Dealer inventory</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Safe Keeping</CardTitle>
                    <Badge variant="outline" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.safeKeeping}</div>
                    <p className="text-xs text-muted-foreground">Temporary custody</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collected</CardTitle>
                    <Badge variant="destructive" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.collected}</div>
                    <p className="text-xs text-muted-foreground">Paperwork complete</p>
                  </CardContent>
                </Card>
              </div>

              {/* Add Firearm Button */}
              {permissions.canEditFirearms && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Firearm</CardTitle>
                    <CardDescription>Register a new firearm in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setIsAddFirearmDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Firearm
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Search and Filter Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Search & Filter</CardTitle>
                  <CardDescription>Find firearms by keyword, status, or date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search firearms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Filter by Status
                    </label>
                    <select
                      id="status"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="in-stock">In Stock</option>
                      <option value="dealer-stock">Dealer Stock</option>
                      <option value="safe-keeping">Safe Keeping</option>
                      <option value="collected">Collected</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Data Export Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Firearms Data</CardTitle>
                  <CardDescription>Download firearms data in CSV format</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button onClick={() => handleExportFirearms("all")} variant="outline" size="sm">
                    Export All ({stats.firearms.total})
                  </Button>
                  <Button
                    onClick={() => handleExportFirearms("selected")}
                    variant="outline"
                    size="sm"
                    disabled={selectedFirearms.length === 0}
                  >
                    Export Selected ({selectedFirearms.length})
                  </Button>
                  <Button
                    onClick={() => handleExportFirearms("filtered")}
                    variant="outline"
                    size="sm"
                    disabled={filteredFirearms.length === 0}
                  >
                    Export Filtered ({filteredFirearms.length})
                  </Button>
                </CardContent>
              </Card>

              {/* Firearms Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Firearms Register</CardTitle>
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
                          <TableHead>Date Received</TableHead>
                          <TableHead>Make</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Caliber</TableHead>
                          <TableHead>Serial No</TableHead>
                          <TableHead>Status</TableHead>
                          {permissions.canEditFirearms && <TableHead className="text-right">Actions</TableHead>}
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
                            <TableCell>{firearm.stockNo}</TableCell>
                            <TableCell>{firearm.dateReceived}</TableCell>
                            <TableCell>{firearm.make}</TableCell>
                            <TableCell>{firearm.type}</TableCell>
                            <TableCell>{firearm.caliber}</TableCell>
                            <TableCell>{firearm.serialNo}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(firearm.status)}>{firearm.status}</Badge>
                            </TableCell>
                            {permissions.canEditFirearms && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditFirearm(firearm)}
                                    disabled={!permissions.canEditFirearms}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteFirearm(firearm.id)}
                                    disabled={!permissions.canDeleteFirearms}
                                  >
                                    Delete
                                  </Button>
                                  {firearm.status !== "collected" && (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleCaptureSignature(firearm)}
                                      disabled={!permissions.canCaptureSignatures}
                                    >
                                      Collect
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            )}
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
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Findings</TableHead>
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
                            <TableCell>{inspection.type}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(inspection.status)}>{inspection.status}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{inspection.findings}</TableCell>
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
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Overview of key metrics and trends in firearms and inspections data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Placeholder for analytics content.</p>
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
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Firearm</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsAddFirearmDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockNo">Stock No *</Label>
                  <Input
                    id="stockNo"
                    type="text"
                    placeholder="Stock No"
                    value={newFirearm.stockNo || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, stockNo: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="dateReceived">Date Received</Label>
                  <Input
                    id="dateReceived"
                    type="date"
                    value={newFirearm.dateReceived || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, dateReceived: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    type="text"
                    placeholder="Make"
                    value={newFirearm.make || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, make: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    type="text"
                    placeholder="Type"
                    value={newFirearm.type || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, type: e.target.value })}
                    className="mb-2"
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
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="serialNo">Serial No *</Label>
                  <Input
                    id="serialNo"
                    type="text"
                    placeholder="Serial No"
                    value={newFirearm.serialNo || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, serialNo: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={newFirearm.fullName || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, fullName: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Surname"
                    value={newFirearm.surname || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, surname: e.target.value })}
                    className="mb-2"
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
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="licenceNo">Licence No</Label>
                  <Input
                    id="licenceNo"
                    type="text"
                    placeholder="Licence No"
                    value={newFirearm.licenceNo || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, licenceNo: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="physicalAddress">Physical Address</Label>
                  <Input
                    id="physicalAddress"
                    type="text"
                    placeholder="Physical Address"
                    value={newFirearm.physicalAddress || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, physicalAddress: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="licenceDate">Licence Date</Label>
                  <Input
                    id="licenceDate"
                    type="date"
                    value={newFirearm.licenceDate || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, licenceDate: e.target.value })}
                    className="mb-2"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={newFirearm.status || "in-stock"}
                    onChange={(e) =>
                      setNewFirearm({
                        ...newFirearm,
                        status: e.target.value as "in-stock" | "dealer-stock" | "safe-keeping" | "collected",
                      })
                    }
                  >
                    <option value="in-stock">In Stock</option>
                    <option value="dealer-stock">Dealer Stock</option>
                    <option value="safe-keeping">Safe Keeping</option>
                    <option value="collected">Collected</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Remarks"
                    value={newFirearm.remarks || ""}
                    onChange={(e) => setNewFirearm({ ...newFirearm, remarks: e.target.value })}
                    className="mb-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setIsAddFirearmDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleAddFirearm}>
                  Add Firearm
                </Button>
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
                      <Label htmlFor="inspector">Inspector Name *</Label>
                      <Input
                        id="inspector"
                        type="text"
                        placeholder="Inspector Name"
                        value={newInspection.inspector || ""}
                        onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspectorId">Inspector ID Number *</Label>
                      <Input
                        id="inspectorId"
                        type="text"
                        placeholder="ID Number"
                        value={newInspection.inspectorId || ""}
                        onChange={(e) => setNewInspection({ ...newInspection, inspectorId: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspectionDate">Inspection Date</Label>
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
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Company Name"
                        value={newInspection.companyName || ""}
                        onChange={(e) => setNewInspection({ ...newInspection, companyName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dealerCode">Dealer Code *</Label>
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
                      <Label htmlFor="pistol">Pistol</Label>
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
                      <Label htmlFor="revolver">Revolver</Label>
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
                      <Label htmlFor="rifle">Rifle</Label>
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
                      <Label htmlFor="selfLoadingRifle">Self-Loading Rifle/Carbine</Label>
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
                      <Label htmlFor="shotgun">Shotgun</Label>
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
                      <Label htmlFor="combination">Combination</Label>
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
                      <Label htmlFor="otherFirearmType">Other</Label>
                    </div>
                  </div>
                  {newInspection.firearmType?.other && (
                    <div className="mt-3">
                      <Label htmlFor="otherFirearmDetails">Other Details</Label>
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
                      <Label htmlFor="caliber">Caliber/Cartridge *</Label>
                      <Input
                        id="caliber"
                        type="text"
                        placeholder="e.g., .308 WIN"
                        value={newInspection.caliber || ""}
                        onChange={(e) => setNewInspection({ ...newInspection, caliber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cartridgeCode">Code</Label>
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
                      <Label className="font-medium">Component</Label>
                      <Label className="font-medium">Serial Number</Label>
                      <Label className="font-medium">Make</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Label>BARREL:</Label>
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
                      <Label>FRAME:</Label>
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
                      <Label>RECEIVER:</Label>
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
                      <Label htmlFor="manual">Manual</Label>
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
                      <Label htmlFor="semiAuto">Semi Auto</Label>
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
                      <Label htmlFor="automatic">Automatic</Label>
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
                      <Label htmlFor="bolt">Bolt</Label>
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
                      <Label htmlFor="breakneck">Breakneck</Label>
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
                      <Label htmlFor="pump">Pump</Label>
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
                      <Label htmlFor="cappingBreechLoader">Capping Breech Loader</Label>
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
                      <Label htmlFor="lever">Lever</Label>
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
                      <Label htmlFor="cylinder">Cylinder</Label>
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
                      <Label htmlFor="fallingBlock">Falling Block</Label>
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
                      <Label htmlFor="otherActionType">Other</Label>
                    </div>
                  </div>
                  {newInspection.actionType?.other && (
                    <div className="mt-3">
                      <Label htmlFor="otherActionDetails">Other Details</Label>
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
                      <Label htmlFor="make">MAKE *</Label>
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
                      <Label htmlFor="countryOfOrigin">COUNTRY OF ORIGIN</Label>
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
                      <Label htmlFor="observations">Observations</Label>
                      <Textarea
                        id="observations"
                        placeholder="According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm."
                        value={newInspection.observations || ""}
                        onChange={(e) => setNewInspection({ ...newInspection, observations: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comments">Comments</Label>
                      <Textarea
                        id="comments"
                        placeholder="Additional comments"
                        value={newInspection.comments || ""}
                        onChange={(e) => setNewInspection({ ...newInspection, comments: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Inspector Details */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">INSPECTOR CERTIFICATION</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inspectorTitle">Inspector Title</Label>
                      <Input
                        id="inspectorTitle"
                        type="text"
                        placeholder="e.g., Head Gunsmith"
                        value={newInspection.inspectorTitle || ""}
                        onChange={(e) => setNewInspection({ ...newInspection, inspectorTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspectionStatus">Status</Label>
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

      {/* Edit Firearm Dialog */}
      {isEditDialogOpen && editingFirearm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Firearm</h3>
              <div className="mt-2">
                <Input
                  type="text"
                  placeholder="Stock No"
                  value={editingFirearm.stockNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, stockNo: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Make"
                  value={editingFirearm.make}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, make: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Type"
                  value={editingFirearm.type}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, type: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Caliber"
                  value={editingFirearm.caliber}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, caliber: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Serial No"
                  value={editingFirearm.serialNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, serialNo: e.target.value })}
                  className="mb-2"
                />
              </div>
              <div className="items-center px-4 py-3">
                <Button variant="default" onClick={handleSaveFirearm} className="mr-2">
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Capture Dialog */}
      {isSignatureDialogOpen && currentFirearmForSignature && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Capture Signature</h3>
              <div className="mt-2">
                {/* Placeholder for signature capture component */}
                <p>Signature capture component will be rendered here.</p>
              </div>
              <div className="items-center px-4 py-3">
                <Button variant="default" onClick={() => handleSaveSignature("signatureData")} className="mr-2">
                  Save Signature
                </Button>
                <Button variant="ghost" onClick={() => setIsSignatureDialogOpen(false)}>
                  Cancel
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
