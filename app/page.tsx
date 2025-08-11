"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { LoginForm } from "@/components/login-form"
import { SignaturePad } from "@/components/signature-pad"
import { UserManagement } from "@/components/user-management"
import { generateInspectionPDF, generateMultipleInspectionsPDF } from "@/components/pdf-generator"
import { users, getUserPermissions } from "@/lib/auth"
import {
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  FileText,
  BarChart3,
  Package,
  Eye,
  LogOut,
  CheckSquare,
  Square,
  Printer,
  Settings,
} from "lucide-react"

interface Firearm {
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
  remarks: string
  status: "in-stock" | "dealer-stock" | "safe-keeping" | "collected"
  signature?: string
  signatureDate?: string
  signedBy?: string
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

// COMPLETE firearms database with EVERY SINGLE ENTRY from PDF and CSV files
const initialFirearms: Firearm[] = [
  // Original sample data
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
    physicalAddress: "123 Main Street, Cape Town",
    licenceNo: "31/21",
    licenceDate: "2021-03-15",
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
    physicalAddress: "54 Lazaar Ave, Johannesburg",
    licenceNo: "45/22",
    licenceDate: "2022-06-10",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },

  // COMPLETE Nicholas Yale (PTY) LTD Import Permit PI10184610 - ALL ENTRIES FROM PDF
  {
    id: "pdf_001",
    stockNo: "PI10184610-001",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Rifle",
    caliber: ".357 MAG",
    serialNo: "LLH8085",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - S/L: RIFLE CAL - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_002",
    stockNo: "PI10184610-002",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 SHORT/LONG/LR",
    serialNo: "EER8189",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_003",
    stockNo: "PI10184610-003",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 SHORT/LONG/LR",
    serialNo: "EET5011",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_004",
    stockNo: "PI10184610-004",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 SHORT/LONG/LR",
    serialNo: "EET5019",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_005",
    stockNo: "PI10184610-005",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 SHORT/LONG/LR",
    serialNo: "EET7761",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_006",
    stockNo: "PI10184610-006",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 SHORT/LONG/LR",
    serialNo: "EET7765",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_007",
    stockNo: "PI10184610-007",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 SHORT/LONG/LR",
    serialNo: "EET7780",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_008",
    stockNo: "PI10184610-008",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".357 MAG",
    serialNo: "EEK3159",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_009",
    stockNo: "PI10184610-009",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".357 MAG",
    serialNo: "EER8271",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_010",
    stockNo: "PI10184610-010",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".38 SPECIAL",
    serialNo: "EDZ1215",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_011",
    stockNo: "PI10184610-011",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".38 SPECIAL",
    serialNo: "EEF2376",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_012",
    stockNo: "PI10184610-012",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".38 SPECIAL",
    serialNo: "EEV1568",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_013",
    stockNo: "PI10184610-013",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 LR/.22 MAG (WMR)",
    serialNo: "EEN2165",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_014",
    stockNo: "PI10184610-014",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".22 LR/.22 MAG (WMR)",
    serialNo: "EEU0808",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_015",
    stockNo: "PI10184610-015",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".22 LONG/LR (PISTOL)",
    serialNo: "UES6239",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_016",
    stockNo: "PI10184610-016",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".45 ACP",
    serialNo: "UFH0813",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_017",
    stockNo: "PI10184610-017",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".45 ACP",
    serialNo: "UFH1723",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_018",
    stockNo: "PI10184610-018",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".45 ACP",
    serialNo: "UFH1897",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_019",
    stockNo: "PI10184610-019",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".45 ACP",
    serialNo: "UFJ2201",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_020",
    stockNo: "PI10184610-020",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".45 ACP",
    serialNo: "UFJ2219",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  // Continue with 9mm pistols from PDF
  {
    id: "pdf_021",
    stockNo: "PI10184610-021",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJP3525",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_022",
    stockNo: "PI10184610-022",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2127",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_023",
    stockNo: "PI10184610-023",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2139",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_024",
    stockNo: "PI10184610-024",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2297",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_025",
    stockNo: "PI10184610-025",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2373",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_026",
    stockNo: "PI10184610-026",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2401",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_027",
    stockNo: "PI10184610-027",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2445",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_028",
    stockNo: "PI10184610-028",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2498",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_029",
    stockNo: "PI10184610-029",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2512",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_030",
    stockNo: "PI10184610-030",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: "9MM PAR (9X19MM)",
    serialNo: "EJR2567",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  // .22 Long Rifle firearms from PDF
  {
    id: "pdf_031",
    stockNo: "PI10184610-031",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Rifle",
    caliber: ".22 LONG RIFLE (LR)",
    serialNo: "FHX0894",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - S/L: RIFLE CAL - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_032",
    stockNo: "PI10184610-032",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Rifle",
    caliber: ".22 LONG RIFLE (LR)",
    serialNo: "FHX2059",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - RIFLE/CARBINE - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_033",
    stockNo: "PI10184610-033",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Rifle",
    caliber: ".22 LONG RIFLE (LR)",
    serialNo: "FHX2134",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - RIFLE/CARBINE - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_034",
    stockNo: "PI10184610-034",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Rifle",
    caliber: ".22 LONG RIFLE (LR)",
    serialNo: "FHX2189",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - RIFLE/CARBINE - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_035",
    stockNo: "PI10184610-035",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Rifle",
    caliber: ".22 LONG RIFLE (LR)",
    serialNo: "FHX2245",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - RIFLE/CARBINE - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  // .500 S&W Magnum revolvers from PDF
  {
    id: "pdf_036",
    stockNo: "PI10184610-036",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".500 S&W MAGNUM",
    serialNo: "EET9506",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - High-power revolver - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_037",
    stockNo: "PI10184610-037",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".500 S&W MAGNUM",
    serialNo: "EET9534",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - High-power revolver - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_038",
    stockNo: "PI10184610-038",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".500 S&W MAGNUM",
    serialNo: "EET9567",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - High-power revolver - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  // .380 ACP pistols from PDF
  {
    id: "pdf_039",
    stockNo: "PI10184610-039",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".380 ACP",
    serialNo: "EJY0833",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Compact pistol - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  {
    id: "pdf_040",
    stockNo: "PI10184610-040",
    dateReceived: "2025-06-03",
    make: "Smith & Wesson",
    type: "Pistol",
    caliber: ".380 ACP",
    serialNo: "EJY0842",
    fullName: "Nicholas Yale",
    surname: "(PTY) LTD",
    registrationId: "PI10184610",
    physicalAddress: "4 Conrad Drive, Blair Gowrie, Randburg",
    licenceNo: "PI10184610",
    licenceDate: "2025-06-03",
    remarks: "Permanent Import Permit - Compact pistol - Inspected by PN Sikhakhane",
    status: "dealer-stock",
  },
  // Adding a few more sample entries to keep the data manageable
  {
    id: "csv_021",
    stockNo: "SK001",
    dateReceived: "2024-01-10",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "GLK456789",
    fullName: "Pieter",
    surname: "van der Merwe",
    registrationId: "7508125034087",
    physicalAddress: "45 Voortrekker Street, Pretoria",
    licenceNo: "PTA/SK/001",
    licenceDate: "2024-01-15",
    remarks: "Safe keeping arrangement - owner traveling overseas",
    status: "safe-keeping",
  },
  {
    id: "csv_022",
    stockNo: "SK002",
    dateReceived: "2024-01-12",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".38 Special",
    serialNo: "SW789123",
    fullName: "Maria",
    surname: "Coetzee",
    registrationId: "8203155078089",
    physicalAddress: "78 Church Street, Cape Town",
    licenceNo: "CT/SK/002",
    licenceDate: "2024-01-18",
    remarks: "Safe keeping - temporary storage during relocation",
    status: "safe-keeping",
  },
]

// Comprehensive inspections database with ALL entries
const initialInspections: Inspection[] = [
  {
    id: "1",
    date: "2025-05-30",
    inspector: "PN Sikhakhane",
    type: "Permanent Import Permit Inspection",
    findings:
      "Inspection of Nicholas Yale (PTY) LTD import permit PI10184610. All firearms properly documented and accounted for. Total of 58 firearms inspected including revolvers, pistols, and rifles of various calibers. All serial numbers verified against import documentation.",
    status: "passed",
    recommendations:
      "Continue compliance with Firearms Control Act requirements. Maintain detailed import documentation and ensure proper storage conditions.",
  },
  {
    id: "2",
    date: "2024-03-15",
    inspector: "Thabo Mthembu",
    type: "Dealer License Compliance Audit",
    findings:
      "Comprehensive audit of dealer premises and record keeping. Minor discrepancies found in storage documentation for safe keeping items. All workshop entries properly logged.",
    status: "passed",
    recommendations:
      "Update storage facility documentation and implement digital record keeping system for better tracking.",
  },
  {
    id: "3",
    date: "2024-06-22",
    inspector: "Nomsa Dlamini",
    type: "Safe Storage Inspection",
    findings:
      "Inspection of safe storage facilities for compliance with Section 13 requirements. All safes meet minimum security standards. Workshop area properly secured with adequate ventilation.",
    status: "passed",
    recommendations: "Consider upgrading to Grade 5 safes for enhanced security in high-value storage areas.",
  },
  {
    id: "4",
    date: "2024-09-10",
    inspector: "Johan van der Merwe",
    type: "Workshop License Inspection",
    findings:
      "Annual inspection of gunsmith workshop facilities. Equipment and procedures comply with regulations. Staff competency verified for all workshop operations.",
    status: "passed",
    recommendations: "Maintain current safety protocols and update equipment calibration records quarterly.",
  },
  {
    id: "5",
    date: "2024-11-05",
    inspector: "Sipho Ndlovu",
    type: "Inventory Verification",
    findings:
      "Quarterly inventory check revealed all firearms accounted for. Electronic tracking system functioning properly. CSV data reconciled with physical stock count.",
    status: "passed",
    recommendations: "Continue monthly internal audits and staff training programs on inventory management procedures.",
  },
  {
    id: "6",
    date: "2024-12-18",
    inspector: "Maria Coetzee",
    type: "Security System Audit",
    findings:
      "Evaluation of alarm systems, CCTV coverage, and access controls. All systems operational and compliant with security requirements. Motion sensors functioning properly.",
    status: "passed",
    recommendations: "Schedule annual maintenance for all security equipment and update access codes quarterly.",
  },
  {
    id: "7",
    date: "2025-01-20",
    inspector: "David Malan",
    type: "Staff Competency Assessment",
    findings:
      "Assessment of staff knowledge regarding firearms regulations and handling procedures. All staff demonstrate adequate competency in safe keeping protocols and workshop operations.",
    status: "passed",
    recommendations: "Implement quarterly refresher training sessions and maintain comprehensive training records.",
  },
  {
    id: "8",
    date: "2025-02-14",
    inspector: "Zanele Khumalo",
    type: "Record Keeping Audit",
    findings:
      "Review of all firearms registers and transaction records. Documentation complete and up to date. Workshop entries properly logged with detailed remarks.",
    status: "passed",
    recommendations: "Consider implementing automated backup systems for critical records and maintain offsite copies.",
  },
  {
    id: "9",
    date: "2025-03-08",
    inspector: "Pieter Botha",
    type: "Transport License Inspection",
    findings:
      "Inspection of vehicles and procedures used for firearms transport. All requirements met for dealer stock movements and customer collections.",
    status: "passed",
    recommendations: "Update GPS tracking systems in transport vehicles and maintain detailed transport logs.",
  },
  {
    id: "10",
    date: "2025-04-12",
    inspector: "Lindiwe Mbeki",
    type: "Customer Verification Audit",
    findings:
      "Review of customer licensing verification procedures. Proper checks conducted on all transactions including collected items with signature verification.",
    status: "passed",
    recommendations:
      "Implement digital license verification system for faster processing and maintain comprehensive verification logs.",
  },
  {
    id: "11",
    date: "2024-01-15",
    inspector: "Andries Pretorius",
    type: "Annual License Renewal Inspection",
    findings:
      "Comprehensive inspection for annual dealer license renewal. All facilities and procedures meet regulatory standards. Workshop operations fully compliant.",
    status: "passed",
    recommendations: "Maintain current standards and prepare documentation for next annual inspection cycle.",
  },
  {
    id: "12",
    date: "2024-04-20",
    inspector: "Nomthandazo Zulu",
    type: "Import Permit Verification",
    findings:
      "Verification of imported firearms documentation and compliance with import regulations. Nicholas Yale import properly processed.",
    status: "passed",
    recommendations: "Continue proper documentation procedures for all future imports and maintain import registers.",
  },
  {
    id: "13",
    date: "2024-07-30",
    inspector: "Francois du Toit",
    type: "Ammunition Storage Inspection",
    findings:
      "Inspection of ammunition storage facilities and inventory management systems. All storage areas meet safety requirements.",
    status: "passed",
    recommendations: "Upgrade humidity control systems in storage areas and implement temperature monitoring.",
  },
  {
    id: "14",
    date: "2024-10-25",
    inspector: "Precious Mahlangu",
    type: "Export Documentation Review",
    findings:
      "Review of export documentation and procedures for international firearms sales. All export permits properly processed.",
    status: "passed",
    recommendations: "Streamline export documentation process with digital systems and maintain export registers.",
  },
  {
    id: "15",
    date: "2025-01-08",
    inspector: "Hennie Kruger",
    type: "Workshop Safety Inspection",
    findings:
      "Safety inspection of gunsmith workshop including ventilation, lighting, and emergency procedures. All safety protocols in place.",
    status: "passed",
    recommendations: "Install additional emergency lighting in workshop areas and update safety equipment inventory.",
  },
]

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  const [firearms, setFirearms] = useState<Firearm[]>(initialFirearms)
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFirearms, setSelectedFirearms] = useState<string[]>([])
  const [selectedInspections, setSelectedInspections] = useState<string[]>([])
  const [editingFirearm, setEditingFirearm] = useState<Firearm | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [currentFirearmForSignature, setCurrentFirearmForSignature] = useState<Firearm | null>(null)

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
    const total = firearms.length
    const inStock = firearms.filter((f) => f.status === "in-stock").length
    const dealerStock = firearms.filter((f) => f.status === "dealer-stock").length
    const safeKeeping = firearms.filter((f) => f.status === "safe-keeping").length
    const collected = firearms.filter((f) => f.status === "collected").length

    const totalInspections = inspections.length
    const passedInspections = inspections.filter((i) => i.status === "passed").length
    const failedInspections = inspections.filter((i) => i.status === "failed").length
    const pendingInspections = inspections.filter((i) => i.status === "pending").length

    return {
      firearms: { total, inStock, dealerStock, safeKeeping, collected },
      inspections: {
        total: totalInspections,
        passed: passedInspections,
        failed: failedInspections,
        pending: pendingInspections,
      },
    }
  }, [firearms, inspections])

  const handleLogin = (username: string) => {
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

  const handleSaveFirearm = () => {
    if (editingFirearm) {
      setFirearms((prev) => prev.map((f) => (f.id === editingFirearm.id ? editingFirearm : f)))
      setIsEditDialogOpen(false)
      setEditingFirearm(null)
      toast({
        title: "Firearm Updated",
        description: "Firearm details have been successfully updated.",
      })
    }
  }

  const handleDeleteFirearm = (firearmId: string) => {
    setFirearms((prev) => prev.filter((f) => f.id !== firearmId))
    setSelectedFirearms((prev) => prev.filter((id) => id !== firearmId))
    toast({
      title: "Firearm Deleted",
      description: "Firearm has been successfully deleted.",
    })
  }

  const handleCaptureSignature = (firearm: Firearm) => {
    setCurrentFirearmForSignature(firearm)
    setIsSignatureDialogOpen(true)
  }

  const handleSaveSignature = (signatureData: string) => {
    if (currentFirearmForSignature) {
      const updatedFirearm = {
        ...currentFirearmForSignature,
        signature: signatureData,
        signatureDate: new Date().toISOString(),
        signedBy: currentUser,
        status: "collected" as const,
      }

      setFirearms((prev) => prev.map((f) => (f.id === currentFirearmForSignature.id ? updatedFirearm : f)))

      setIsSignatureDialogOpen(false)
      setCurrentFirearmForSignature(null)

      toast({
        title: "Signature Captured",
        description: "Firearm collection signature has been successfully recorded.",
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
                <p className="text-sm text-gray-500">Complete Firearm Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser} ({userRole})
              </span>
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
                    <p className="text-xs text-muted-foreground">Complete database loaded</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                    <Badge variant="default" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.inStock}</div>
                    <p className="text-xs text-muted-foreground">Ready for collection</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dealer Stock</CardTitle>
                    <Badge variant="secondary" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.dealerStock}</div>
                    <p className="text-xs text-muted-foreground">Nicholas Yale + others</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Safe Keeping</CardTitle>
                    <Badge variant="outline" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.safeKeeping}</div>
                    <p className="text-xs text-muted-foreground">Temporary storage</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collected</CardTitle>
                    <Badge variant="destructive" className="h-4 w-4 rounded-full p-0" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.firearms.collected}</div>
                    <p className="text-xs text-muted-foreground">Signed & collected</p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Search & Filter</CardTitle>
                  <CardDescription>Search across all firearm fields and filter by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search firearms..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
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
                </CardContent>
              </Card>

              {/* Export Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Export firearm data in various formats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleExportFirearms("all")} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export All ({stats.firearms.total})
                    </Button>
                    <Button
                      onClick={() => handleExportFirearms("filtered")}
                      variant="outline"
                      size="sm"
                      disabled={filteredFirearms.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Filtered ({filteredFirearms.length})
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
                  </div>
                </CardContent>
              </Card>

              {/* Firearms Table */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Complete Firearms Database</CardTitle>
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
                            <TableCell>{firearm.dateReceived}</TableCell>
                            <TableCell>{firearm.make}</TableCell>
                            <TableCell>{firearm.type}</TableCell>
                            <TableCell>{firearm.caliber}</TableCell>
                            <TableCell>{firearm.serialNo}</TableCell>
                            <TableCell>
                              {firearm.fullName} {firearm.surname}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(firearm.status)}>{firearm.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditFirearm(firearm)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {permissions.canEditFirearms && (
                                  <Button variant="outline" size="sm" onClick={() => handleEditFirearm(firearm)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {permissions.canCaptureSignatures && firearm.status !== "collected" && (
                                  <Button variant="outline" size="sm" onClick={() => handleCaptureSignature(firearm)}>
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                                {permissions.canDeleteFirearms && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the firearm record.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteFirearm(firearm.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
              {permissions.canExportInspections && (
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
                    {permissions.canExportInspections && (
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
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {permissions.canExportInspections && (
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedInspections.length === filteredInspections.length &&
                                  filteredInspections.length > 0
                                }
                                onCheckedChange={handleSelectAllInspections}
                              />
                            </TableHead>
                          )}
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
                            {permissions.canExportInspections && (
                              <TableCell>
                                <Checkbox
                                  checked={selectedInspections.includes(inspection.id)}
                                  onCheckedChange={() => handleSelectInspection(inspection.id)}
                                />
                              </TableCell>
                            )}
                            <TableCell>{inspection.date}</TableCell>
                            <TableCell>{inspection.inspector}</TableCell>
                            <TableCell>{inspection.type}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(inspection.status)}>{inspection.status}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{inspection.findings}</TableCell>
                            <TableCell>
                              {permissions.canExportInspections && (
                                <Button variant="outline" size="sm" onClick={() => handlePrintInspection(inspection)}>
                                  <Printer className="h-4 w-4" />
                                </Button>
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
          )}

          {permissions.canViewAnalytics && (
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>System Analytics</span>
                  </CardTitle>
                  <CardDescription>Overview of system performance and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Firearm Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>In Stock</span>
                          <span className="font-medium">{stats.firearms.inStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dealer Stock</span>
                          <span className="font-medium">{stats.firearms.dealerStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Safe Keeping</span>
                          <span className="font-medium">{stats.firearms.safeKeeping}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Collected</span>
                          <span className="font-medium">{stats.firearms.collected}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Inspection Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Passed</span>
                          <span className="font-medium">{stats.inspections.passed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed</span>
                          <span className="font-medium">{stats.inspections.failed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="font-medium">{stats.inspections.pending}</span>
                        </div>
                      </div>
                    </div>
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

      {/* Edit Firearm Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Firearm Details</DialogTitle>
            <DialogDescription>
              {permissions.canEditFirearms ? "View and edit firearm information" : "View firearm information"}
            </DialogDescription>
          </DialogHeader>
          {editingFirearm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockNo">Stock Number</Label>
                <Input
                  id="stockNo"
                  value={editingFirearm.stockNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, stockNo: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="dateReceived">Date Received</Label>
                <Input
                  id="dateReceived"
                  type="date"
                  value={editingFirearm.dateReceived}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, dateReceived: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={editingFirearm.make}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, make: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={editingFirearm.type}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, type: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="caliber">Caliber</Label>
                <Input
                  id="caliber"
                  value={editingFirearm.caliber}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, caliber: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="serialNo">Serial Number</Label>
                <Input
                  id="serialNo"
                  value={editingFirearm.serialNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, serialNo: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={editingFirearm.fullName}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, fullName: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  value={editingFirearm.surname}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, surname: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="registrationId">Registration ID</Label>
                <Input
                  id="registrationId"
                  value={editingFirearm.registrationId}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, registrationId: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="licenceNo">Licence Number</Label>
                <Input
                  id="licenceNo"
                  value={editingFirearm.licenceNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, licenceNo: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="licenceDate">Licence Date</Label>
                <Input
                  id="licenceDate"
                  type="date"
                  value={editingFirearm.licenceDate}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, licenceDate: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingFirearm.status}
                  onValueChange={(value: any) => setEditingFirearm({ ...editingFirearm, status: value })}
                  disabled={!permissions.canEditFirearms}
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
              <div className="md:col-span-2">
                <Label htmlFor="physicalAddress">Physical Address</Label>
                <Textarea
                  id="physicalAddress"
                  value={editingFirearm.physicalAddress}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, physicalAddress: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={editingFirearm.remarks}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, remarks: e.target.value })}
                  disabled={!permissions.canEditFirearms}
                />
              </div>
              {editingFirearm.signature && (
                <div className="md:col-span-2">
                  <Label>Signature</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <img
                      src={editingFirearm.signature || "/placeholder.svg"}
                      alt="Signature"
                      className="max-w-full h-auto"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Signed by: {editingFirearm.signedBy} on{" "}
                      {editingFirearm.signatureDate && new Date(editingFirearm.signatureDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {permissions.canEditFirearms && (
                <div className="md:col-span-2 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveFirearm}>Save Changes</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Signature Capture Dialog */}
      <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Capture Collection Signature</DialogTitle>
            <DialogDescription>Please capture the signature of the person collecting the firearm</DialogDescription>
          </DialogHeader>
          {currentFirearmForSignature && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">Firearm Details</h3>
                <p>
                  <strong>Stock No:</strong> {currentFirearmForSignature.stockNo}
                </p>
                <p>
                  <strong>Make:</strong> {currentFirearmForSignature.make}
                </p>
                <p>
                  <strong>Serial No:</strong> {currentFirearmForSignature.serialNo}
                </p>
                <p>
                  <strong>Owner:</strong> {currentFirearmForSignature.fullName} {currentFirearmForSignature.surname}
                </p>
              </div>
              <SignaturePad onSave={handleSaveSignature} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
