"use client"
import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, FileText, LogOut, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { authService, type User } from "@/lib/auth"
import { UserManagement } from "@/components/user-management"

/* -------------------------------------------------------------------------- */
/*  FirearmEntry and InspectionEntry types                                    */
/* -------------------------------------------------------------------------- */

interface FirearmEntry {
  id: string
  stockNo: string
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
  deliveredTo?: string
  deliveredAddress?: string
  deliveredLicence?: string
  deliveredLicenceDate?: string
  remarks: string
  status: "in-stock" | "collected" | "dealer-stock" | "safe-keeping"
  originalStockNo?: string
  collectionSignature?: string
  collectionSignerName?: string
  transferSignature?: string
  transferSignerName?: string
}

interface InspectionEntry {
  id: string
  num: number
  caliber: string
  make: string
  firearmSerialNumber: string
  barrelSerialNumber: string
  frameSerialNumber: string
  receiverSerialNumber: string
  firearmType: string
  firearmTypeOther?: string
  inspectionDate: string
  inspector: string
  dealerCode: string
  companyName: string
  actionType: string
  actionTypeOther?: string
  countryOfOrigin: string
  remarks: string
  comments: string
}

/* -------------------------------------------------------------------------- */
/*  DATA LOAD / SAVE HELPERS (localStorage)                                   */
/* -------------------------------------------------------------------------- */

const LS_KEYS = {
  FIREARMS: "gunworx_firearms",
  INSPECTIONS: "gunworx_inspections",
  USERS: "gunworx_users",
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

/* -------------------------------------------------------------------------- */
/*  INITIAL DATA (static seed trimmed here for brevity)                       */
/* -------------------------------------------------------------------------- */

const seedFirearms: FirearmEntry[] = [
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
]

const seedInspections: InspectionEntry[] = [
  {
    id: "insp_1",
    num: 1,
    caliber: ".308 WIN",
    make: "RUGER",
    firearmSerialNumber: "690745661",
    barrelSerialNumber: "690745661",
    frameSerialNumber: "690745661",
    receiverSerialNumber: "690745661",
    firearmType: "RIFLE",
    inspectionDate: "2024-04-04",
    inspector: "Wikus Fourie",
    dealerCode: "1964Delta",
    companyName: "1964Delta",
    actionType: "Bolt",
    countryOfOrigin: "USA",
    remarks: "No visible signs of correction or erasing",
    comments:
      "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
  },
]

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */

export default function GunworxTracker() {
  /* --------------------------- AUTHENTICATION ---------------------------- */

  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser())
  const [loadingAuth, setLoadingAuth] = useState(false)

  const handleLogin = (u: User) => {
    setCurrentUser(u)
    authService.setCurrentUser(u)
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
  }

  /* ----------------------------- FIREARMS -------------------------------- */

  const [firearms, setFirearms] = useState<FirearmEntry[]>(() =>
    loadJSON<FirearmEntry[]>(LS_KEYS.FIREARMS, seedFirearms),
  )

  useEffect(() => saveJSON(LS_KEYS.FIREARMS, firearms), [firearms])

  /* ---------------------------- INSPECTIONS ------------------------------ */

  const [inspections, setInspections] = useState<InspectionEntry[]>(() =>
    loadJSON<InspectionEntry[]>(LS_KEYS.INSPECTIONS, seedInspections),
  )

  useEffect(() => saveJSON(LS_KEYS.INSPECTIONS, inspections), [inspections])

  /* -------------------------- UI STATE ETC. ------------------------------ */

  const [search, setSearch] = useState("")
  const filteredFirearms = useMemo(() => {
    if (!search) return firearms
    return firearms.filter((f) =>
      Object.values(f).some((v) => v?.toString().toLowerCase().includes(search.toLowerCase())),
    )
  }, [firearms, search])

  /* ----------------------------- RENDER ---------------------------------- */

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gunworx Firearms Tracker</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm flex items-center gap-1">
              <Shield className="w-4 h-4 text-blue-600" /> {currentUser.username}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-1" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="inspection">
              <FileText className="w-4 h-4 mr-1" /> Inspection
            </TabsTrigger>
            {currentUser.role === "admin" && (
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-1" /> Users
              </TabsTrigger>
            )}
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Search and manage all firearms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search…"
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock&nbsp;No</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Serial</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFirearms.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>{f.stockNo}</TableCell>
                          <TableCell>{f.make}</TableCell>
                          <TableCell>{f.type}</TableCell>
                          <TableCell className="font-mono">{f.serialNo}</TableCell>
                          <TableCell>
                            {f.status === "collected" ? (
                              <Badge className="bg-green-600">Collected</Badge>
                            ) : f.status === "in-stock" ? (
                              <Badge>In Stock</Badge>
                            ) : f.status === "dealer-stock" ? (
                              <Badge variant="outline">Dealer Stock</Badge>
                            ) : (
                              <Badge variant="destructive">Safe Keeping</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inspection Tab */}
          <TabsContent value="inspection">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Serial</TableHead>
                        <TableHead>Caliber</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspections.map((i) => (
                        <TableRow key={i.id}>
                          <TableCell>{i.num}</TableCell>
                          <TableCell className="font-mono">{i.firearmSerialNumber}</TableCell>
                          <TableCell>{i.caliber}</TableCell>
                          <TableCell>{i.firearmType}</TableCell>
                          <TableCell>{i.inspectionDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users (admin only) */}
          {currentUser.role === "admin" && (
            <TabsContent value="users">
              <UserManagement currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
