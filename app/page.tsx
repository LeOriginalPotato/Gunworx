"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  Package,
  FileText,
  Users,
  Search,
  Plus,
  Download,
  Printer,
  BarChart3,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoginForm } from "@/components/login-form"
import { UserManagement } from "@/components/user-management"
import { SignaturePad } from "@/components/signature-pad"
import { authService, type User } from "@/lib/auth"
import { formatDate, exportToCSV, generateId } from "@/lib/utils"

interface Firearm {
  id: string
  stockNo: string
  originalStockNo?: string
  dateReceived: string
  make: string
  type: string
  caliber: string
  serialNo: string
  fullName: string
  surname: string
  registrationId: string
  physicalAddress: string
  licenceNo: string
  licenceDate: string
  dateDelivered?: string
  remarks: string
  status: "in-stock" | "dealer-stock" | "safe-keeping" | "collected"
  signature?: string
  signerName?: string
}

interface Inspection {
  id: string
  date: string
  inspector: string
  type: string
  findings: string
  status: "passed" | "failed" | "pending"
  recommendations: string
}

// Initial data
const initialFirearms: Firearm[] = [
  {
    id: "1",
    stockNo: "CO3",
    dateReceived: "2023-11-15",
    make: "Walther",
    type: "Pistol",
    caliber: "7.65",
    serialNo: "223083",
    fullName: "GM",
    surname: "Smuts",
    registrationId: "1/23/1985",
    physicalAddress: "",
    licenceNo: "31/21",
    licenceDate: "",
    remarks: "Mac EPR Dealer Stock",
    status: "dealer-stock",
  },
  {
    id: "2",
    stockNo: "A01",
    dateReceived: "2025-05-07",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "SSN655",
    fullName: "I",
    surname: "Dunn",
    registrationId: "9103035027088",
    physicalAddress: "54 Lazaar Ave",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
]

const initialInspections: Inspection[] = [
  {
    id: "1",
    date: "2024-01-15",
    inspector: "J. Smith",
    type: "Routine Inspection",
    findings: "All firearms properly stored and documented",
    status: "passed",
    recommendations: "Continue current procedures",
  },
  {
    id: "2",
    date: "2024-02-20",
    inspector: "M. Johnson",
    type: "Compliance Audit",
    findings: "Minor documentation discrepancies found",
    status: "passed",
    recommendations: "Update serial number records for 3 items",
  },
]

export default function GunworxTracker() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [firearms, setFirearms] = useState<Firearm[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddFirearmOpen, setIsAddFirearmOpen] = useState(false)
  const [isEditFirearmOpen, setIsEditFirearmOpen] = useState(false)
  const [isAddInspectionOpen, setIsAddInspectionOpen] = useState(false)
  const [isEditInspectionOpen, setIsEditInspectionOpen] = useState(false)
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false)
  const [selectedFirearmId, setSelectedFirearmId] = useState<string | null>(null)
  const [editingFirearm, setEditingFirearm] = useState<Firearm | null>(null)
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  const [deleteFirearmId, setDeleteFirearmId] = useState<string | null>(null)
  const [deleteInspectionId, setDeleteInspectionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("inventory")

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
    type: "",
    findings: "",
    status: "pending",
    recommendations: "",
  })

  // Initialize data
  useEffect(() => {
    const savedFirearms = localStorage.getItem("gunworx_firearms")
    const savedInspections = localStorage.getItem("gunworx_inspections")

    if (savedFirearms) {
      try {
        const parsed = JSON.parse(savedFirearms)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFirearms(parsed)
        } else {
          setFirearms(initialFirearms)
        }
      } catch {
        setFirearms(initialFirearms)
      }
    } else {
      setFirearms(initialFirearms)
    }

    if (savedInspections) {
      try {
        const parsed = JSON.parse(savedInspections)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInspections(parsed)
        } else {
          setInspections(initialInspections)
        }
      } catch {
        setInspections(initialInspections)
      }
    } else {
      setInspections(initialInspections)
    }

    // Check for existing user session
    const user = authService.getCurrentUser()
    if (user) {
      setCurrentUser(user)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (firearms.length > 0) {
      localStorage.setItem("gunworx_firearms", JSON.stringify(firearms))
    }
  }, [firearms])

  useEffect(() => {
    if (inspections.length > 0) {
      localStorage.setItem("gunworx_inspections", JSON.stringify(inspections))
    }
  }, [inspections])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
  }

  const handleAddFirearm = () => {
    if (!newFirearm.stockNo || !newFirearm.make || !newFirearm.serialNo) {
      alert("Please fill in required fields: Stock No, Make, and Serial No")
      return
    }

    const firearm: Firearm = {
      id: generateId(),
      stockNo: newFirearm.stockNo || "",
      dateReceived: newFirearm.dateReceived || new Date().toISOString().split("T")[0],
      make: newFirearm.make || "",
      type: newFirearm.type || "",
      caliber: newFirearm.caliber || "",
      serialNo: newFirearm.serialNo || "",
      fullName: newFirearm.fullName || "",
      surname: newFirearm.surname || "",
      registrationId: newFirearm.registrationId || "",
      physicalAddress: newFirearm.physicalAddress || "",
      licenceNo: newFirearm.licenceNo || "",
      licenceDate: newFirearm.licenceDate || "",
      remarks: newFirearm.remarks || "",
      status: newFirearm.status || "in-stock",
    }

    setFirearms((prev) => [...prev, firearm])
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
    setIsAddFirearmOpen(false)
  }

  const handleEditFirearm = (firearm: Firearm) => {
    setEditingFirearm({ ...firearm })
    setIsEditFirearmOpen(true)
  }

  const handleUpdateFirearm = () => {
    if (!editingFirearm) return

    if (!editingFirearm.stockNo || !editingFirearm.make || !editingFirearm.serialNo) {
      alert("Please fill in required fields: Stock No, Make, and Serial No")
      return
    }

    setFirearms((prev) => prev.map((firearm) => (firearm.id === editingFirearm.id ? editingFirearm : firearm)))
    setEditingFirearm(null)
    setIsEditFirearmOpen(false)
  }

  const handleDeleteFirearm = (firearmId: string) => {
    const firearm = firearms.find((f) => f.id === firearmId)
    if (firearm) {
      setDeleteFirearmId(firearmId)
    }
  }

  const confirmDeleteFirearm = () => {
    if (deleteFirearmId) {
      setFirearms((prev) => prev.filter((firearm) => firearm.id !== deleteFirearmId))
      setDeleteFirearmId(null)
    }
  }

  const handleAddInspection = () => {
    if (!newInspection.inspector || !newInspection.type || !newInspection.findings) {
      alert("Please fill in required fields")
      return
    }

    const inspection: Inspection = {
      id: generateId(),
      date: newInspection.date || new Date().toISOString().split("T")[0],
      inspector: newInspection.inspector || "",
      type: newInspection.type || "",
      findings: newInspection.findings || "",
      status: newInspection.status || "pending",
      recommendations: newInspection.recommendations || "",
    }

    setInspections((prev) => [...prev, inspection])
    setNewInspection({
      date: new Date().toISOString().split("T")[0],
      inspector: "",
      type: "",
      findings: "",
      status: "pending",
      recommendations: "",
    })
    setIsAddInspectionOpen(false)
  }

  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection({ ...inspection })
    setIsEditInspectionOpen(true)
  }

  const handleUpdateInspection = () => {
    if (!editingInspection) return

    if (!editingInspection.inspector || !editingInspection.type || !editingInspection.findings) {
      alert("Please fill in required fields")
      return
    }

    setInspections((prev) =>
      prev.map((inspection) => (inspection.id === editingInspection.id ? editingInspection : inspection)),
    )
    setEditingInspection(null)
    setIsEditInspectionOpen(false)
  }

  const handleDeleteInspection = (inspectionId: string) => {
    const inspection = inspections.find((i) => i.id === inspectionId)
    if (inspection) {
      setDeleteInspectionId(inspectionId)
    }
  }

  const confirmDeleteInspection = () => {
    if (deleteInspectionId) {
      setInspections((prev) => prev.filter((inspection) => inspection.id !== deleteInspectionId))
      setDeleteInspectionId(null)
    }
  }

  const handleStatusChange = (firearmId: string, newStatus: Firearm["status"]) => {
    setFirearms((prev) =>
      prev.map((firearm) => {
        if (firearm.id === firearmId) {
          const updated = { ...firearm, status: newStatus }
          if (newStatus === "collected") {
            updated.originalStockNo = firearm.originalStockNo || firearm.stockNo
            updated.stockNo = "COLLECTED"
            updated.dateDelivered = new Date().toISOString().split("T")[0]
          }
          return updated
        }
        return firearm
      }),
    )
  }

  const handleSignatureCapture = (firearmId: string) => {
    setSelectedFirearmId(firearmId)
    setIsSignaturePadOpen(true)
  }

  const handleSignatureSave = (signatureData: string, signerName: string) => {
    if (selectedFirearmId) {
      setFirearms((prev) =>
        prev.map((firearm) =>
          firearm.id === selectedFirearmId ? { ...firearm, signature: signatureData, signerName } : firearm,
        ),
      )
    }
    setSelectedFirearmId(null)
  }

  const getStatusBadge = (status: Firearm["status"]) => {
    const variants = {
      "in-stock": "bg-blue-100 text-blue-800",
      "dealer-stock": "bg-orange-100 text-orange-800",
      "safe-keeping": "bg-red-100 text-red-800",
      collected: "bg-green-100 text-green-800",
    }

    const labels = {
      "in-stock": "In Stock",
      "dealer-stock": "Dealer Stock",
      "safe-keeping": "Safe Keeping",
      collected: "Collected",
    }

    return <Badge className={variants[status]}>{labels[status]}</Badge>
  }

  const getInspectionStatusBadge = (status: Inspection["status"]) => {
    // Handle undefined or null status
    if (!status) {
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }

    const variants = {
      passed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    }

    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const filteredFirearms = firearms.filter((firearm) => {
    const matchesSearch =
      searchTerm === "" ||
      Object.values(firearm).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || firearm.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeFirearms = filteredFirearms.filter((f) => f.status !== "collected")
  const collectedFirearms = filteredFirearms.filter((f) => f.status === "collected")

  const stats = {
    total: firearms.length,
    inStock: firearms.filter((f) => f.status === "in-stock").length,
    dealerStock: firearms.filter((f) => f.status === "dealer-stock").length,
    safeKeeping: firearms.filter((f) => f.status === "safe-keeping").length,
    collected: firearms.filter((f) => f.status === "collected").length,
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gunworx Management Portal</h1>
                <p className="text-sm text-gray-600">Firearms Control Act Compliance System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser.username}
                {currentUser.isSystemAdmin && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800">System Admin</Badge>
                )}
                {currentUser.role === "admin" && !currentUser.isSystemAdmin && (
                  <Badge className="ml-2 bg-orange-100 text-orange-800">Admin</Badge>
                )}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inStock}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Dealer Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.dealerStock}</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Safe Keeping</p>
                  <p className="text-2xl font-bold text-red-600">{stats.safeKeeping}</p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Collected</p>
                  <p className="text-2xl font-bold text-green-600">{stats.collected}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="inspections">
              <FileText className="w-4 h-4 mr-2" />
              Inspections
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            {(currentUser.role === "admin" || currentUser.isSystemAdmin) && (
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
            )}
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Firearms Inventory</CardTitle>
                    <CardDescription>Manage and track all firearms in the system</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={isAddFirearmOpen} onOpenChange={setIsAddFirearmOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Firearm
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Firearm</DialogTitle>
                          <DialogDescription>Enter the details for the new firearm</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="stockNo">Stock Number *</Label>
                            <Input
                              id="stockNo"
                              value={newFirearm.stockNo || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, stockNo: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="dateReceived">Date Received</Label>
                            <Input
                              id="dateReceived"
                              type="date"
                              value={newFirearm.dateReceived || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, dateReceived: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="make">Make *</Label>
                            <Input
                              id="make"
                              value={newFirearm.make || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, make: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Input
                              id="type"
                              value={newFirearm.type || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, type: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="caliber">Caliber</Label>
                            <Input
                              id="caliber"
                              value={newFirearm.caliber || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, caliber: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="serialNo">Serial Number *</Label>
                            <Input
                              id="serialNo"
                              value={newFirearm.serialNo || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, serialNo: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={newFirearm.fullName || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, fullName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="surname">Surname</Label>
                            <Input
                              id="surname"
                              value={newFirearm.surname || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, surname: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="registrationId">Registration ID</Label>
                            <Input
                              id="registrationId"
                              value={newFirearm.registrationId || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, registrationId: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="licenceNo">Licence Number</Label>
                            <Input
                              id="licenceNo"
                              value={newFirearm.licenceNo || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, licenceNo: e.target.value }))}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="physicalAddress">Physical Address</Label>
                            <Input
                              id="physicalAddress"
                              value={newFirearm.physicalAddress || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, physicalAddress: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="licenceDate">Licence Date</Label>
                            <Input
                              id="licenceDate"
                              type="date"
                              value={newFirearm.licenceDate || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, licenceDate: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={newFirearm.status || "in-stock"}
                              onValueChange={(value: Firearm["status"]) =>
                                setNewFirearm((prev) => ({ ...prev, status: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in-stock">In Stock</SelectItem>
                                <SelectItem value="dealer-stock">Dealer Stock</SelectItem>
                                <SelectItem value="safe-keeping">Safe Keeping</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                              id="remarks"
                              value={newFirearm.remarks || ""}
                              onChange={(e) => setNewFirearm((prev) => ({ ...prev, remarks: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleAddFirearm} className="flex-1">
                            Add Firearm
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddFirearmOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={() => exportToCSV(firearms, "firearms_export.csv")}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search firearms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="dealer-stock">Dealer Stock</SelectItem>
                      <SelectItem value="safe-keeping">Safe Keeping</SelectItem>
                      <SelectItem value="collected">Collected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Firearms */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Active Inventory ({activeFirearms.length})</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Stock No</TableHead>
                            <TableHead>Make/Type</TableHead>
                            <TableHead>Serial No</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeFirearms.map((firearm) => (
                            <TableRow key={firearm.id}>
                              <TableCell className="font-medium">{firearm.stockNo}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{firearm.make}</div>
                                  <div className="text-sm text-gray-500">{firearm.type}</div>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{firearm.serialNo}</TableCell>
                              <TableCell>
                                {firearm.fullName} {firearm.surname}
                              </TableCell>
                              <TableCell>{getStatusBadge(firearm.status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Select
                                    value={firearm.status}
                                    onValueChange={(value: Firearm["status"]) => handleStatusChange(firearm.id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="in-stock">In Stock</SelectItem>
                                      <SelectItem value="dealer-stock">Dealer Stock</SelectItem>
                                      <SelectItem value="safe-keeping">Safe Keeping</SelectItem>
                                      <SelectItem value="collected">Collected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSignatureCapture(firearm.id)}
                                  >
                                    Sign
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleEditFirearm(firearm)}>
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteFirearm(firearm.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Collected Firearms */}
                  {collectedFirearms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Collected Items ({collectedFirearms.length})</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Original Stock No</TableHead>
                              <TableHead>Make/Type</TableHead>
                              <TableHead>Serial No</TableHead>
                              <TableHead>Owner</TableHead>
                              <TableHead>Date Collected</TableHead>
                              <TableHead>Signature</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {collectedFirearms.map((firearm) => (
                              <TableRow key={firearm.id} className="bg-green-50">
                                <TableCell className="font-medium">{firearm.originalStockNo}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{firearm.make}</div>
                                    <div className="text-sm text-gray-500">{firearm.type}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{firearm.serialNo}</TableCell>
                                <TableCell>
                                  {firearm.fullName} {firearm.surname}
                                </TableCell>
                                <TableCell>{formatDate(firearm.dateDelivered || "")}</TableCell>
                                <TableCell>
                                  {firearm.signature ? (
                                    <div className="text-sm">
                                      <div className="font-medium">{firearm.signerName}</div>
                                      <div className="text-gray-500">Signed</div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No signature</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditFirearm(firearm)}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteFirearm(firearm.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inspections Tab */}
          <TabsContent value="inspections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Inspections</CardTitle>
                    <CardDescription>Track compliance inspections and audits</CardDescription>
                  </div>
                  <Dialog open={isAddInspectionOpen} onOpenChange={setIsAddInspectionOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Inspection
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Inspection</DialogTitle>
                        <DialogDescription>Record a new inspection or audit</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="inspectionDate">Date</Label>
                          <Input
                            id="inspectionDate"
                            type="date"
                            value={newInspection.date || ""}
                            onChange={(e) => setNewInspection((prev) => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="inspector">Inspector *</Label>
                          <Input
                            id="inspector"
                            value={newInspection.inspector || ""}
                            onChange={(e) => setNewInspection((prev) => ({ ...prev, inspector: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="inspectionType">Type *</Label>
                          <Input
                            id="inspectionType"
                            value={newInspection.type || ""}
                            onChange={(e) => setNewInspection((prev) => ({ ...prev, type: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="findings">Findings *</Label>
                          <Textarea
                            id="findings"
                            value={newInspection.findings || ""}
                            onChange={(e) => setNewInspection((prev) => ({ ...prev, findings: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="inspectionStatus">Status</Label>
                          <Select
                            value={newInspection.status || "pending"}
                            onValueChange={(value: Inspection["status"]) =>
                              setNewInspection((prev) => ({ ...prev, status: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="passed">Passed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="recommendations">Recommendations</Label>
                          <Textarea
                            id="recommendations"
                            value={newInspection.recommendations || ""}
                            onChange={(e) => setNewInspection((prev) => ({ ...prev, recommendations: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleAddInspection} className="flex-1">
                          Add Inspection
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddInspectionOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Findings</TableHead>
                        <TableHead>Recommendations</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspections.map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell>{formatDate(inspection.date)}</TableCell>
                          <TableCell className="font-medium">{inspection.inspector}</TableCell>
                          <TableCell>{inspection.type}</TableCell>
                          <TableCell>{getInspectionStatusBadge(inspection.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">{inspection.findings}</TableCell>
                          <TableCell className="max-w-xs truncate">{inspection.recommendations}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditInspection(inspection)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteInspection(inspection.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
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

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Summary</CardTitle>
                  <CardDescription>Current status of all firearms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Items:</span>
                      <span className="font-bold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>In Stock:</span>
                      <span className="font-bold text-blue-600">{stats.inStock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dealer Stock:</span>
                      <span className="font-bold text-orange-600">{stats.dealerStock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Safe Keeping:</span>
                      <span className="font-bold text-red-600">{stats.safeKeeping}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Collected:</span>
                      <span className="font-bold text-green-600">{stats.collected}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <div className="font-medium">System initialized</div>
                      <div className="text-gray-500">Today</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{firearms.length} firearms loaded</div>
                      <div className="text-gray-500">Today</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{inspections.length} inspections recorded</div>
                      <div className="text-gray-500">Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          {(currentUser.role === "admin" || currentUser.isSystemAdmin) && (
            <TabsContent value="users">
              <UserManagement currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit Firearm Dialog */}
      <Dialog open={isEditFirearmOpen} onOpenChange={setIsEditFirearmOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Firearm</DialogTitle>
            <DialogDescription>Update the firearm details</DialogDescription>
          </DialogHeader>
          {editingFirearm && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-stockNo">Stock Number *</Label>
                <Input
                  id="edit-stockNo"
                  value={editingFirearm.stockNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, stockNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-dateReceived">Date Received</Label>
                <Input
                  id="edit-dateReceived"
                  type="date"
                  value={editingFirearm.dateReceived}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, dateReceived: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-make">Make *</Label>
                <Input
                  id="edit-make"
                  value={editingFirearm.make}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, make: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Input
                  id="edit-type"
                  value={editingFirearm.type}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-caliber">Caliber</Label>
                <Input
                  id="edit-caliber"
                  value={editingFirearm.caliber}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, caliber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-serialNo">Serial Number *</Label>
                <Input
                  id="edit-serialNo"
                  value={editingFirearm.serialNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, serialNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input
                  id="edit-fullName"
                  value={editingFirearm.fullName}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-surname">Surname</Label>
                <Input
                  id="edit-surname"
                  value={editingFirearm.surname}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, surname: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-registrationId">Registration ID</Label>
                <Input
                  id="edit-registrationId"
                  value={editingFirearm.registrationId}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, registrationId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-licenceNo">Licence Number</Label>
                <Input
                  id="edit-licenceNo"
                  value={editingFirearm.licenceNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, licenceNo: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-physicalAddress">Physical Address</Label>
                <Input
                  id="edit-physicalAddress"
                  value={editingFirearm.physicalAddress}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, physicalAddress: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-licenceDate">Licence Date</Label>
                <Input
                  id="edit-licenceDate"
                  type="date"
                  value={editingFirearm.licenceDate}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, licenceDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingFirearm.status}
                  onValueChange={(value: Firearm["status"]) => setEditingFirearm({ ...editingFirearm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="dealer-stock">Dealer Stock</SelectItem>
                    <SelectItem value="safe-keeping">Safe Keeping</SelectItem>
                    <SelectItem value="collected">Collected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Textarea
                  id="edit-remarks"
                  value={editingFirearm.remarks}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, remarks: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdateFirearm} className="flex-1">
              Update Firearm
            </Button>
            <Button variant="outline" onClick={() => setIsEditFirearmOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Inspection Dialog */}
      <Dialog open={isEditInspectionOpen} onOpenChange={setIsEditInspectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inspection</DialogTitle>
            <DialogDescription>Update the inspection details</DialogDescription>
          </DialogHeader>
          {editingInspection && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-inspectionDate">Date</Label>
                <Input
                  id="edit-inspectionDate"
                  type="date"
                  value={editingInspection.date}
                  onChange={(e) => setEditingInspection({ ...editingInspection, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-inspector">Inspector *</Label>
                <Input
                  id="edit-inspector"
                  value={editingInspection.inspector}
                  onChange={(e) => setEditingInspection({ ...editingInspection, inspector: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-inspectionType">Type *</Label>
                <Input
                  id="edit-inspectionType"
                  value={editingInspection.type}
                  onChange={(e) => setEditingInspection({ ...editingInspection, type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-findings">Findings *</Label>
                <Textarea
                  id="edit-findings"
                  value={editingInspection.findings}
                  onChange={(e) => setEditingInspection({ ...editingInspection, findings: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-inspectionStatus">Status</Label>
                <Select
                  value={editingInspection.status}
                  onValueChange={(value: Inspection["status"]) =>
                    setEditingInspection({ ...editingInspection, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-recommendations">Recommendations</Label>
                <Textarea
                  id="edit-recommendations"
                  value={editingInspection.recommendations}
                  onChange={(e) => setEditingInspection({ ...editingInspection, recommendations: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdateInspection} className="flex-1">
              Update Inspection
            </Button>
            <Button variant="outline" onClick={() => setIsEditInspectionOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Firearm Confirmation */}
      <AlertDialog open={!!deleteFirearmId} onOpenChange={() => setDeleteFirearmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the firearm record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFirearm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Inspection Confirmation */}
      <AlertDialog open={!!deleteInspectionId} onOpenChange={() => setDeleteInspectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inspection record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteInspection}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Signature Pad */}
      <SignaturePad
        isOpen={isSignaturePadOpen}
        onClose={() => setIsSignaturePadOpen(false)}
        onSignatureSave={handleSignatureSave}
        title="Digital Signature for Firearm Collection"
      />
    </div>
  )
}
