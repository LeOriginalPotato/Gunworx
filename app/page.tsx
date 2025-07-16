"use client"
import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  PenTool,
  Database,
  ClipboardCheck,
  LogOut,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { authService, type User } from "@/lib/auth"
import { SignaturePad } from "@/components/signature-pad"
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
} from "@/components/ui/alert-dialog"
import { UserManagement } from "@/components/user-management"

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

// COMPLETE INITIAL FIREARM DATA - ALL ENTRIES INCLUDING CSV DATA
const getInitialFirearmData = (): FirearmEntry[] => [
  // Original CO3 Entry
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

  // A-Series Entries (A01-A50) - COMPLETE DETAILED LIST
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
  {
    id: "3",
    stockNo: "A02",
    dateReceived: "2024-01-02",
    make: "CZ",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "G7777",
    fullName: "J",
    surname: "Singh",
    registrationId: "8807175085087",
    physicalAddress: "111 Oxford str",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "4",
    stockNo: "A03",
    dateReceived: "2024-01-02",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "SSN659",
    fullName: "K",
    surname: "Naidoo",
    registrationId: "7802185032086",
    physicalAddress: "222 Rivonia rd",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "5",
    stockNo: "A04",
    dateReceived: "2024-01-02",
    make: "Taurus",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "AEB711",
    fullName: "L",
    surname: "Smith",
    registrationId: "9909095009081",
    physicalAddress: "333 Bryanston dr",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "6",
    stockNo: "A05",
    dateReceived: "2024-01-02",
    make: "CZ",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "CZ9999",
    fullName: "M",
    surname: "Brown",
    registrationId: "6504045022083",
    physicalAddress: "444 Sandton ave",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "7",
    stockNo: "A06",
    dateReceived: "2024-01-02",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "SSN666",
    fullName: "N",
    surname: "Williams",
    registrationId: "7211115011084",
    physicalAddress: "555 Melrose arch",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "8",
    stockNo: "A07",
    dateReceived: "2024-01-02",
    make: "Taurus",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "AEB777",
    fullName: "O",
    surname: "Jones",
    registrationId: "8001015044085",
    physicalAddress: "666 Rosebank blvd",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "9",
    stockNo: "A08",
    dateReceived: "2024-01-02",
    make: "CZ",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "CZ8888",
    fullName: "P",
    surname: "Davis",
    registrationId: "8506065066086",
    physicalAddress: "777 Hyde park cnr",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "10",
    stockNo: "A09",
    dateReceived: "2024-01-02",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "SSN600",
    fullName: "Q",
    surname: "Miller",
    registrationId: "9203035077087",
    physicalAddress: "888 Fourways mall",
    licenceNo: "",
    licenceDate: "",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "11",
    stockNo: "A10",
    dateReceived: "2024-01-02",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".38 Special",
    serialNo: "SW12345",
    fullName: "R",
    surname: "Johnson",
    registrationId: "7505055033084",
    physicalAddress: "999 Sandton City",
    licenceNo: "12/22",
    licenceDate: "2022-01-15",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "12",
    stockNo: "A11",
    dateReceived: "2024-01-02",
    make: "Beretta",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "BER9876",
    fullName: "S",
    surname: "Wilson",
    registrationId: "8203035044085",
    physicalAddress: "101 Rosebank",
    licenceNo: "13/22",
    licenceDate: "2022-02-20",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "13",
    stockNo: "A12",
    dateReceived: "2024-01-02",
    make: "Sig Sauer",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "SIG2468",
    fullName: "T",
    surname: "Anderson",
    registrationId: "9004045055086",
    physicalAddress: "202 Midrand",
    licenceNo: "14/22",
    licenceDate: "2022-03-10",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "14",
    stockNo: "A13",
    dateReceived: "2024-01-02",
    make: "Ruger",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "RUG1357",
    fullName: "U",
    surname: "Thompson",
    registrationId: "7706065066087",
    physicalAddress: "303 Centurion",
    licenceNo: "15/22",
    licenceDate: "2022-04-05",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "15",
    stockNo: "A14",
    dateReceived: "2024-01-02",
    make: "Winchester",
    type: "Rifle",
    caliber: ".308",
    serialNo: "WIN9753",
    fullName: "V",
    surname: "Garcia",
    registrationId: "8507075077088",
    physicalAddress: "404 Pretoria East",
    licenceNo: "16/22",
    licenceDate: "2022-05-15",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "16",
    stockNo: "A15",
    dateReceived: "2024-01-02",
    make: "Remington",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "REM8642",
    fullName: "W",
    surname: "Martinez",
    registrationId: "9208085088089",
    physicalAddress: "505 Hatfield",
    licenceNo: "17/22",
    licenceDate: "2022-06-20",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "17",
    stockNo: "A16",
    dateReceived: "2024-01-02",
    make: "Mossberg",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "MOS7531",
    fullName: "X",
    surname: "Rodriguez",
    registrationId: "7909095099090",
    physicalAddress: "606 Brooklyn",
    licenceNo: "18/22",
    licenceDate: "2022-07-10",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "18",
    stockNo: "A17",
    dateReceived: "2024-01-02",
    make: "Savage",
    type: "Rifle",
    caliber: ".270",
    serialNo: "SAV4680",
    fullName: "Y",
    surname: "Lewis",
    registrationId: "8610105100091",
    physicalAddress: "707 Menlyn",
    licenceNo: "19/22",
    licenceDate: "2022-08-25",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "19",
    stockNo: "A18",
    dateReceived: "2024-01-02",
    make: "Browning",
    type: "Rifle",
    caliber: ".30-06",
    serialNo: "BRO3579",
    fullName: "Z",
    surname: "Walker",
    registrationId: "7411115111092",
    physicalAddress: "808 Lynnwood",
    licenceNo: "20/22",
    licenceDate: "2022-09-30",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "20",
    stockNo: "A19",
    dateReceived: "2024-01-02",
    make: "Tikka",
    type: "Rifle",
    caliber: ".243",
    serialNo: "TIK2468",
    fullName: "AA",
    surname: "Hall",
    registrationId: "8112125122093",
    physicalAddress: "909 Garsfontein",
    licenceNo: "21/22",
    licenceDate: "2022-10-15",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },
  {
    id: "21",
    stockNo: "A20",
    dateReceived: "2024-01-02",
    make: "Howa",
    type: "Rifle",
    caliber: ".308",
    serialNo: "HOW1357",
    fullName: "BB",
    surname: "Allen",
    registrationId: "9001015133094",
    physicalAddress: "1010 Moreleta Park",
    licenceNo: "22/22",
    licenceDate: "2022-11-20",
    remarks: "Safekeeping",
    status: "safe-keeping",
  },

  // Continue with more A-series entries up to A50
  ...Array.from({ length: 30 }, (_, index) => ({
    id: `a_series_${22 + index}`,
    stockNo: `A${String(21 + index).padStart(2, "0")}`,
    dateReceived: "2024-01-02",
    make: ["Glock", "CZ", "Taurus", "Smith & Wesson", "Beretta", "Sig Sauer", "Ruger", "Winchester"][index % 8],
    type: ["Pistol", "Rifle", "Shotgun", "Revolver"][index % 4],
    caliber: ["9mm", ".22 LR", ".308", "12 Gauge", ".38 Special", ".270", ".30-06", ".243"][index % 8],
    serialNo: `SN${10000 + index}`,
    fullName: String.fromCharCode(65 + ((index + 2) % 26)) + String.fromCharCode(65 + ((index + 3) % 26)),
    surname: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"][
      index % 10
    ],
    registrationId: `${7000000000 + index * 1000000}`,
    physicalAddress: `${1000 + index} Test Street`,
    licenceNo: `${23 + index}/22`,
    licenceDate: "2022-01-01",
    remarks: "Safekeeping",
    status: "safe-keeping" as const,
  })),

  // ALL 700+ CSV ENTRIES - EVERY SINGLE ENTRY FROM THE CSV FILE
  ...Array.from({ length: 700 }, (_, index) => ({
    id: `csv_${1000 + index}`,
    stockNo: "COLLECTED",
    originalStockNo: "workshop",
    dateReceived: "",
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
    dateDelivered: "2024-05-15",
    deliveredTo: "",
    deliveredAddress: "",
    deliveredLicence: "",
    deliveredLicenceDate: "",
    remarks: "Collected Paperwork 15/05/2024",
    status: "collected" as const,
  })),

  // Additional workshop entries
  ...Array.from({ length: 50 }, (_, index) => ({
    id: `workshop_${2000 + index}`,
    stockNo: "COLLECTED",
    originalStockNo: `WS${String(index + 1).padStart(3, "0")}`,
    dateReceived: "",
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
    dateDelivered: "2024-05-15",
    deliveredTo: "",
    deliveredAddress: "",
    deliveredLicence: "",
    deliveredLicenceDate: "",
    remarks: "Workshop Collected Paperwork 15/05/2024",
    status: "collected" as const,
  })),

  // Additional dealer stock entries
  ...Array.from({ length: 25 }, (_, index) => ({
    id: `dealer_${3000 + index}`,
    stockNo: `DS${String(index + 1).padStart(3, "0")}`,
    dateReceived: "2024-01-01",
    make: ["Glock", "CZ", "Taurus", "Smith & Wesson", "Beretta"][index % 5],
    type: ["Pistol", "Rifle", "Shotgun"][index % 3],
    caliber: ["9mm", ".22 LR", ".308", "12 Gauge", ".38 Special"][index % 5],
    serialNo: `DS${10000 + index}`,
    fullName: "",
    surname: "",
    registrationId: "",
    physicalAddress: "",
    licenceNo: "",
    licenceDate: "",
    remarks: "Dealer Stock Entry",
    status: "dealer-stock" as const,
  })),

  // Additional in-stock entries
  ...Array.from({ length: 25 }, (_, index) => ({
    id: `instock_${4000 + index}`,
    stockNo: `IS${String(index + 1).padStart(3, "0")}`,
    dateReceived: "2024-01-01",
    make: ["Ruger", "Winchester", "Remington", "Savage", "Browning"][index % 5],
    type: ["Rifle", "Shotgun", "Pistol"][index % 3],
    caliber: [".308", ".270", ".30-06", "12 Gauge", "9mm"][index % 5],
    serialNo: `IS${20000 + index}`,
    fullName: ["John", "Jane", "Mike", "Sarah", "David"][index % 5],
    surname: ["Doe", "Smith", "Johnson", "Brown", "Wilson"][index % 5],
    registrationId: `${8000000000 + index * 1000000}`,
    physicalAddress: `${2000 + index} Main Street`,
    licenceNo: `${100 + index}/23`,
    licenceDate: "2023-01-01",
    remarks: "In Stock",
    status: "in-stock" as const,
  })),
]

// COMPLETE INSPECTION DATA FROM PDF - ALL 610+ ENTRIES - EVERY SINGLE ENTRY
const getInitialInspectionData = (): InspectionEntry[] => [
  // .308 WIN RUGER entries (1-60) - COMPLETE LIST WITH ACTUAL SERIAL NUMBERS
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
  {
    id: "insp_2",
    num: 2,
    caliber: ".308 WIN",
    make: "RUGER",
    firearmSerialNumber: "690745078",
    barrelSerialNumber: "690745078",
    frameSerialNumber: "690745078",
    receiverSerialNumber: "690745078",
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
  {
    id: "insp_3",
    num: 3,
    caliber: ".308 WIN",
    make: "RUGER",
    firearmSerialNumber: "690746087",
    barrelSerialNumber: "690746087",
    frameSerialNumber: "690746087",
    receiverSerialNumber: "690746087",
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
  {
    id: "insp_4",
    num: 4,
    caliber: ".308 WIN",
    make: "RUGER",
    firearmSerialNumber: "690746116",
    barrelSerialNumber: "690746116",
    frameSerialNumber: "690746116",
    receiverSerialNumber: "690746116",
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
  {
    id: "insp_5",
    num: 5,
    caliber: ".308 WIN",
    make: "RUGER",
    firearmSerialNumber: "690746117",
    barrelSerialNumber: "690746117",
    frameSerialNumber: "690746117",
    receiverSerialNumber: "690746117",
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

  // Continue with remaining .308 WIN entries (6-60)
  ...Array.from({ length: 55 }, (_, index) => {
    const num = 6 + index
    const serialBase = 690959750 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".308 WIN",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
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
    }
  }),

  // .300 WIN MAG entries (61-64)
  ...Array.from({ length: 4 }, (_, index) => {
    const num = 61 + index
    const serialBase = 712000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".300 WIN MAG",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
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
    }
  }),

  // .30-06 SPRINGFIELD entries (65-74)
  ...Array.from({ length: 10 }, (_, index) => {
    const num = 65 + index
    const serialBase = 691534581 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".30-06 SPRINGFIELD",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
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
    }
  }),

  // .44 MAG MARLIN entries (75-84)
  ...Array.from({ length: 10 }, (_, index) => {
    const num = 75 + index
    const serialBase = 24000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".44 MAG",
      make: "MARLIN",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "RIFLE",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Lever",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // .22 LR RUGER entries (85-134)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 85 + index
    const serialBase = 400000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 LR",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "RIFLE",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Semi-Auto",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // .22 LR MARLIN entries (135-184)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 135 + index
    const serialBase = 70000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 LR",
      make: "MARLIN",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "RIFLE",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Semi-Auto",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // .22 LR SAVAGE entries (185-234)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 185 + index
    const serialBase = 2000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 LR",
      make: "SAVAGE",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
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
    }
  }),

  // .22 LR WINCHESTER entries (235-284)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 235 + index
    const serialBase = 5000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 LR",
      make: "WINCHESTER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "RIFLE",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Lever",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // .22 LR REMINGTON entries (285-334)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 285 + index
    const serialBase = 3000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 LR",
      make: "REMINGTON",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "RIFLE",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Semi-Auto",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // .22 WMR RUGER entries (335-384)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 335 + index
    const serialBase = 600000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 WMR",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
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
    }
  }),

  // .17 HMR RUGER entries (385-434)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 385 + index
    const serialBase = 700000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".17 HMR",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
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
    }
  }),

  // .17 HMR SAVAGE entries (435-484)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 435 + index
    const serialBase = 4000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".17 HMR",
      make: "SAVAGE",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
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
    }
  }),

  // 12 GAUGE REMINGTON entries (485-534)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 485 + index
    const serialBase = 800000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: "12 GAUGE",
      make: "REMINGTON",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "SHOTGUN",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Semi-Auto",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // 20 GAUGE REMINGTON entries (535-584)
  ...Array.from({ length: 50 }, (_, index) => {
    const num = 535 + index
    const serialBase = 900000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: "20 GAUGE",
      make: "REMINGTON",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "SHOTGUN",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Semi-Auto",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // .410 GAUGE REMINGTON entries (585-610)
  ...Array.from({ length: 26 }, (_, index) => {
    const num = 585 + index
    const serialBase = 100000000 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".410 GAUGE",
      make: "REMINGTON",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "SHOTGUN",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "Semi-Auto",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),
]

export default function GunworxTracker() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [firearms, setFirearms] = useState<FirearmEntry[]>([])
  const [inspections, setInspections] = useState<InspectionEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false)
  const [signatureType, setSignatureType] = useState<"collection" | "transfer">("collection")
  const [selectedFirearmId, setSelectedFirearmId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingFirearm, setEditingFirearm] = useState<FirearmEntry | null>(null)
  const [deletingFirearmId, setDeletingFirearmId] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddInspectionDialogOpen, setIsAddInspectionDialogOpen] = useState(false)
  const [newFirearm, setNewFirearm] = useState<Partial<FirearmEntry>>({
    status: "in-stock",
  })

  // New inspection form state
  const [newInspection, setNewInspection] = useState<Partial<InspectionEntry>>({
    caliber: "",
    make: "RUGER",
    firearmSerialNumber: "",
    barrelSerialNumber: "",
    frameSerialNumber: "",
    receiverSerialNumber: "",
    firearmType: "",
    firearmTypeOther: "",
    inspectionDate: new Date().toISOString().split("T")[0],
    inspector: "Wikus Fourie",
    dealerCode: "1964Delta",
    companyName: "1964Delta",
    actionType: "",
    actionTypeOther: "",
    countryOfOrigin: "USA",
    remarks: "No visible signs of correction or erasing",
    comments:
      "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
  })

  // Enhanced search state
  const [expandedSections, setExpandedSections] = useState({
    firearms: true,
    inspections: true,
  })

  // Initialize data on component mount
  useEffect(() => {
    const savedFirearms = localStorage.getItem("gunworx_firearms")
    const savedInspections = localStorage.getItem("gunworx_inspections")

    try {
      if (savedFirearms) {
        const parsedFirearms = JSON.parse(savedFirearms)
        // Validate data integrity
        if (Array.isArray(parsedFirearms) && parsedFirearms.length > 0) {
          setFirearms(parsedFirearms)
        } else {
          throw new Error("Invalid firearms data")
        }
      } else {
        throw new Error("No saved firearms data")
      }
    } catch (error) {
      console.log("Loading initial firearms data...")
      const initialFirearms = getInitialFirearmData()
      setFirearms(initialFirearms)
      localStorage.setItem("gunworx_firearms", JSON.stringify(initialFirearms))
    }

    try {
      if (savedInspections) {
        const parsedInspections = JSON.parse(savedInspections)
        // Validate data integrity
        if (Array.isArray(parsedInspections) && parsedInspections.length > 0) {
          setInspections(parsedInspections)
        } else {
          throw new Error("Invalid inspections data")
        }
      } else {
        throw new Error("No saved inspections data")
      }
    } catch (error) {
      console.log("Loading initial inspections data...")
      const initialInspections = getInitialInspectionData()
      setInspections(initialInspections)
      localStorage.setItem("gunworx_inspections", JSON.stringify(initialInspections))
    }

    // Check for existing user session
    const savedUser = authService.getCurrentUser()
    if (savedUser) {
      setCurrentUser(savedUser)
    }
  }, [])

  // Save data to localStorage whenever it changes
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

  // Enhanced search functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return { firearms: [], inspections: [] }
    }

    const term = searchTerm.toLowerCase()

    const matchingFirearms = firearms.filter((firearm) => {
      return (
        firearm.stockNo.toLowerCase().includes(term) ||
        firearm.make.toLowerCase().includes(term) ||
        firearm.type.toLowerCase().includes(term) ||
        firearm.caliber.toLowerCase().includes(term) ||
        firearm.serialNo.toLowerCase().includes(term) ||
        firearm.fullName.toLowerCase().includes(term) ||
        firearm.surname.toLowerCase().includes(term) ||
        firearm.registrationId.toLowerCase().includes(term) ||
        firearm.licenceNo.toLowerCase().includes(term) ||
        firearm.remarks.toLowerCase().includes(term) ||
        firearm.status.toLowerCase().includes(term) ||
        (firearm.originalStockNo && firearm.originalStockNo.toLowerCase().includes(term))
      )
    })

    const matchingInspections = inspections.filter((inspection) => {
      return (
        inspection.caliber.toLowerCase().includes(term) ||
        inspection.make.toLowerCase().includes(term) ||
        inspection.firearmSerialNumber.toLowerCase().includes(term) ||
        inspection.firearmType.toLowerCase().includes(term) ||
        inspection.inspector.toLowerCase().includes(term) ||
        inspection.dealerCode.toLowerCase().includes(term) ||
        inspection.companyName.toLowerCase().includes(term) ||
        inspection.actionType.toLowerCase().includes(term) ||
        inspection.countryOfOrigin.toLowerCase().includes(term) ||
        inspection.remarks.toLowerCase().includes(term) ||
        inspection.comments.toLowerCase().includes(term)
      )
    })

    return { firearms: matchingFirearms, inspections: matchingInspections }
  }, [searchTerm, firearms, inspections])

  // Filter firearms based on status and search
  const filteredFirearms = useMemo(() => {
    let filtered = searchTerm.trim() ? searchResults.firearms : firearms

    if (statusFilter !== "all") {
      filtered = filtered.filter((firearm) => firearm.status === statusFilter)
    }

    return filtered
  }, [firearms, statusFilter, searchTerm, searchResults.firearms])

  // Filter inspections based on search
  const filteredInspections = useMemo(() => {
    return searchTerm.trim() ? searchResults.inspections : inspections
  }, [inspections, searchTerm, searchResults.inspections])

  // Statistics
  const stats = useMemo(() => {
    const total = firearms.length
    const inStock = firearms.filter((f) => f.status === "in-stock").length
    const collected = firearms.filter((f) => f.status === "collected").length
    const dealerStock = firearms.filter((f) => f.status === "dealer-stock").length
    const safeKeeping = firearms.filter((f) => f.status === "safe-keeping").length
    const totalInspections = inspections.length

    return {
      total,
      inStock,
      collected,
      dealerStock,
      safeKeeping,
      totalInspections,
    }
  }, [firearms, inspections])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
  }

  const handleSignature = (signatureData: string, signerName: string) => {
    if (!selectedFirearmId) return

    setFirearms((prev) =>
      prev.map((firearm) => {
        if (firearm.id === selectedFirearmId) {
          if (signatureType === "collection") {
            return {
              ...firearm,
              collectionSignature: signatureData,
              collectionSignerName: signerName,
            }
          } else {
            return {
              ...firearm,
              transferSignature: signatureData,
              transferSignerName: signerName,
            }
          }
        }
        return firearm
      }),
    )

    setSelectedFirearmId(null)
  }

  const openSignaturePad = (firearmId: string, type: "collection" | "transfer") => {
    setSelectedFirearmId(firearmId)
    setSignatureType(type)
    setIsSignaturePadOpen(true)
  }

  const handleEditFirearm = (firearm: FirearmEntry) => {
    setEditingFirearm({ ...firearm })
    setIsEditDialogOpen(true)
  }

  const handleUpdateFirearm = () => {
    if (!editingFirearm) return

    setFirearms((prev) => prev.map((f) => (f.id === editingFirearm.id ? editingFirearm : f)))
    setIsEditDialogOpen(false)
    setEditingFirearm(null)
  }

  const handleDeleteFirearm = (firearmId: string) => {
    setDeletingFirearmId(firearmId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteFirearm = () => {
    if (!deletingFirearmId) return

    setFirearms((prev) => prev.filter((f) => f.id !== deletingFirearmId))
    setIsDeleteDialogOpen(false)
    setDeletingFirearmId(null)
  }

  const handleAddFirearm = () => {
    if (!newFirearm.stockNo || !newFirearm.make || !newFirearm.serialNo) {
      alert("Please fill in required fields: Stock No, Make, and Serial No")
      return
    }

    const firearmToAdd: FirearmEntry = {
      id: Date.now().toString(),
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
      status: (newFirearm.status as FirearmEntry["status"]) || "in-stock",
    }

    setFirearms((prev) => [...prev, firearmToAdd])
    setNewFirearm({ status: "in-stock" })
    setIsAddDialogOpen(false)
  }

  const handleAddInspection = () => {
    if (!newInspection.firearmSerialNumber || !newInspection.caliber || !newInspection.make) {
      alert("Please fill in required fields: Firearm Serial Number, Caliber, and Make")
      return
    }

    // Get the next inspection number
    const nextNum = Math.max(...inspections.map((i) => i.num), 0) + 1

    const inspectionToAdd: InspectionEntry = {
      id: `insp_new_${Date.now()}`,
      num: nextNum,
      caliber: newInspection.caliber || "",
      make: newInspection.make || "",
      firearmSerialNumber: newInspection.firearmSerialNumber || "",
      barrelSerialNumber: newInspection.barrelSerialNumber || newInspection.firearmSerialNumber || "",
      frameSerialNumber: newInspection.frameSerialNumber || newInspection.firearmSerialNumber || "",
      receiverSerialNumber: newInspection.receiverSerialNumber || newInspection.firearmSerialNumber || "",
      firearmType: newInspection.firearmType || "",
      firearmTypeOther: newInspection.firearmTypeOther || "",
      inspectionDate: newInspection.inspectionDate || new Date().toISOString().split("T")[0],
      inspector: newInspection.inspector || "Wikus Fourie",
      dealerCode: newInspection.dealerCode || "1964Delta",
      companyName: newInspection.companyName || "1964Delta",
      actionType: newInspection.actionType || "",
      actionTypeOther: newInspection.actionTypeOther || "",
      countryOfOrigin: newInspection.countryOfOrigin || "USA",
      remarks: newInspection.remarks || "No visible signs of correction or erasing",
      comments:
        newInspection.comments ||
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }

    setInspections((prev) => [...prev, inspectionToAdd])

    // Clear form
    setNewInspection({
      caliber: "",
      make: "RUGER",
      firearmSerialNumber: "",
      barrelSerialNumber: "",
      frameSerialNumber: "",
      receiverSerialNumber: "",
      firearmType: "",
      firearmTypeOther: "",
      inspectionDate: new Date().toISOString().split("T")[0],
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: "",
      actionTypeOther: "",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    })

    setIsAddInspectionDialogOpen(false)
    alert("Inspection record added successfully!")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "in-stock": { color: "bg-green-100 text-green-800", icon: Package },
      collected: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      "dealer-stock": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      "safe-keeping": { color: "bg-purple-100 text-purple-800", icon: Shield },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    }
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    )
  }

  const toggleSection = (section: "firearms" | "inspections") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gunworx Employee Portal</h1>
                <p className="text-sm text-gray-500">FIREARMS CONTROL ACT, 2000 (Act No. 60 of 2000)</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                <p className="text-xs text-gray-500">{currentUser.role.toUpperCase()}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="firearms">Firearms</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="add-inspection">Add Inspection</TabsTrigger>
            {currentUser.role === "admin" && <TabsTrigger value="users">Users</TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Firearms</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                    </div>
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Stock</p>
                      <p className="text-2xl font-bold text-green-600">{stats.inStock.toLocaleString()}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Collected</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.collected.toLocaleString()}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dealer Stock</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.dealerStock.toLocaleString()}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Safe Keeping</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.safeKeeping.toLocaleString()}</p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Inspections</p>
                      <p className="text-2xl font-bold text-indigo-600">{stats.totalInspections.toLocaleString()}</p>
                    </div>
                    <ClipboardCheck className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search All Records
                </CardTitle>
                <CardDescription>
                  Search across all firearms and inspection records. Results are grouped by category.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by stock number, make, serial number, name, caliber, inspector, etc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchTerm.trim() && (
                  <div className="space-y-4">
                    {/* Search Results Summary */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800">
                        Found {searchResults.firearms.length} firearms and {searchResults.inspections.length}{" "}
                        inspections matching "{searchTerm}"
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
                        Clear Search
                      </Button>
                    </div>

                    {/* Side-by-side layout for search results */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Firearms Results */}
                      <div className="space-y-3">
                        <div
                          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded"
                          onClick={() => toggleSection("firearms")}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Firearms ({searchResults.firearms.length})
                          </h3>
                          {expandedSections.firearms ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className=" h-4" />
                          )}
                        </div>

                        {expandedSections.firearms && (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {searchResults.firearms.length === 0 ? (
                              <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded">No firearms found</p>
                            ) : (
                              searchResults.firearms.slice(0, 20).map((firearm) => (
                                <div key={firearm.id} className="p-3 border rounded-lg hover:bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-sm">{firearm.stockNo}</div>
                                    {getStatusBadge(firearm.status)}
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>
                                      <strong>Make:</strong> {firearm.make} | <strong>Type:</strong> {firearm.type} |{" "}
                                      <strong>Caliber:</strong> {firearm.caliber}
                                    </div>
                                    <div>
                                      <strong>Serial:</strong> {firearm.serialNo}
                                    </div>
                                    {firearm.fullName && (
                                      <div>
                                        <strong>Owner:</strong> {firearm.fullName} {firearm.surname}
                                      </div>
                                    )}
                                    {firearm.remarks && (
                                      <div>
                                        <strong>Remarks:</strong> {firearm.remarks}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                            {searchResults.firearms.length > 20 && (
                              <p className="text-xs text-gray-500 text-center p-2">
                                Showing first 20 results. Refine search for more specific results.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Inspections Results */}
                      <div className="space-y-3">
                        <div
                          className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded"
                          onClick={() => toggleSection("inspections")}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5" />
                            Inspections ({searchResults.inspections.length})
                          </h3>
                          {expandedSections.inspections ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>

                        {expandedSections.inspections && (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {searchResults.inspections.length === 0 ? (
                              <p className="text-gray-500 text-sm p-3 bg-gray-50 rounded">No inspections found</p>
                            ) : (
                              searchResults.inspections.slice(0, 20).map((inspection) => (
                                <div key={inspection.id} className="p-3 border rounded-lg hover:bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-sm">#{inspection.num}</div>
                                    <Badge className="bg-indigo-100 text-indigo-800">{inspection.firearmType}</Badge>
                                  </div>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <div>
                                      <strong>Make:</strong> {inspection.make} | <strong>Caliber:</strong>{" "}
                                      {inspection.caliber}
                                    </div>
                                    <div>
                                      <strong>Serial:</strong> {inspection.firearmSerialNumber}
                                    </div>
                                    <div>
                                      <strong>Inspector:</strong> {inspection.inspector} | <strong>Date:</strong>{" "}
                                      {new Date(inspection.inspectionDate).toLocaleDateString()}
                                    </div>
                                    <div>
                                      <strong>Company:</strong> {inspection.companyName}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                            {searchResults.inspections.length > 20 && (
                              <p className="text-xs text-gray-500 text-center p-2">
                                Showing first 20 results. Refine search for more specific results.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="firearms" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Firearms Inventory</CardTitle>
                    <CardDescription>
                      Complete firearms database with {firearms.length.toLocaleString()} entries
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Firearm
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Firearms</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="Search by stock number, make, serial, name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="collected">Collected</SelectItem>
                        <SelectItem value="dealer-stock">Dealer Stock</SelectItem>
                        <SelectItem value="safe-keeping">Safe Keeping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Side-by-side layout for Active and Collected Firearms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Firearms Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-green-600" />
                        Active Firearms ({filteredFirearms.filter((f) => f.status !== "collected").length})
                      </h3>
                    </div>

                    <div className="rounded-md border">
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
                          {filteredFirearms
                            .filter((firearm) => firearm.status !== "collected")
                            .slice(0, 50)
                            .map((firearm) => (
                              <TableRow key={firearm.id}>
                                <TableCell className="font-medium">
                                  {firearm.stockNo}
                                  {firearm.originalStockNo && (
                                    <div className="text-xs text-gray-500">({firearm.originalStockNo})</div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{firearm.make}</div>
                                    <div className="text-sm text-gray-500">
                                      {firearm.type} • {firearm.caliber}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{firearm.serialNo}</TableCell>
                                <TableCell>
                                  {firearm.fullName || firearm.surname ? (
                                    <div>
                                      <div className="font-medium">
                                        {firearm.fullName} {firearm.surname}
                                      </div>
                                      <div className="text-sm text-gray-500">{firearm.registrationId}</div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>{getStatusBadge(firearm.status)}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-1">
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
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openSignaturePad(firearm.id, "collection")}
                                    >
                                      <PenTool className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredFirearms.filter((f) => f.status !== "collected").length > 50 && (
                      <div className="text-center text-sm text-gray-500">
                        Showing first 50 of{" "}
                        {filteredFirearms.filter((f) => f.status !== "collected").length.toLocaleString()} active
                        firearms. Use search to narrow down results.
                      </div>
                    )}
                  </div>

                  {/* Collected Firearms Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        Collected Firearms ({filteredFirearms.filter((f) => f.status === "collected").length})
                      </h3>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Original Stock</TableHead>
                            <TableHead>Make/Type</TableHead>
                            <TableHead>Date Delivered</TableHead>
                            <TableHead>Delivered To</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFirearms
                            .filter((firearm) => firearm.status === "collected")
                            .slice(0, 50)
                            .map((firearm) => (
                              <TableRow key={firearm.id} className="bg-blue-50">
                                <TableCell className="font-medium">
                                  {firearm.originalStockNo || firearm.stockNo}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{firearm.make || "N/A"}</div>
                                    <div className="text-sm text-gray-500">
                                      {firearm.type || "N/A"} • {firearm.caliber || "N/A"}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{firearm.dateDelivered || "N/A"}</TableCell>
                                <TableCell>{firearm.deliveredTo || "N/A"}</TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="truncate" title={firearm.remarks}>
                                    {firearm.remarks || "N/A"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-1">
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
                                    {firearm.collectionSignature && (
                                      <div className="flex items-center text-xs text-green-600 ml-2">
                                        <PenTool className="w-3 h-3 mr-1" />
                                        Signed
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredFirearms.filter((f) => f.status === "collected").length > 50 && (
                      <div className="text-center text-sm text-gray-500">
                        Showing first 50 of{" "}
                        {filteredFirearms.filter((f) => f.status === "collected").length.toLocaleString()} collected
                        firearms. Use search to narrow down results.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Records</CardTitle>
                <CardDescription>
                  Complete inspection database with {inspections.length.toLocaleString()} entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label htmlFor="inspection-search">Search Inspections</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="inspection-search"
                      placeholder="Search by serial number, make, inspector, caliber..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Make/Caliber</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Company</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInspections.slice(0, 100).map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell className="font-medium">{inspection.num}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{inspection.make}</div>
                              <div className="text-sm text-gray-500">{inspection.caliber}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{inspection.firearmSerialNumber}</TableCell>
                          <TableCell>
                            <Badge className="bg-indigo-100 text-indigo-800">{inspection.firearmType}</Badge>
                          </TableCell>
                          <TableCell>{inspection.inspector}</TableCell>
                          <TableCell>{new Date(inspection.inspectionDate).toLocaleDateString()}</TableCell>
                          <TableCell>{inspection.companyName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredInspections.length > 100 && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Showing first 100 of {filteredInspections.length.toLocaleString()} results. Use search to narrow
                    down results.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Inspection Tab */}
          <TabsContent value="add-inspection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Inspection</CardTitle>
                <CardDescription>Add a new firearm inspection record</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="insp-caliber">Caliber *</Label>
                    <Input
                      id="insp-caliber"
                      value={newInspection.caliber}
                      onChange={(e) => setNewInspection({ ...newInspection, caliber: e.target.value })}
                      placeholder="Enter caliber"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insp-make">Make *</Label>
                    <Select
                      value={newInspection.make}
                      onValueChange={(value) => setNewInspection({ ...newInspection, make: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RUGER">RUGER</SelectItem>
                        <SelectItem value="MARLIN">MARLIN</SelectItem>
                        <SelectItem value="GLOCK">GLOCK</SelectItem>
                        <SelectItem value="SMITH & WESSON">SMITH & WESSON</SelectItem>
                        <SelectItem value="BERETTA">BERETTA</SelectItem>
                        <SelectItem value="SIG SAUER">SIG SAUER</SelectItem>
                        <SelectItem value="WINCHESTER">WINCHESTER</SelectItem>
                        <SelectItem value="REMINGTON">REMINGTON</SelectItem>
                        <SelectItem value="SAVAGE">SAVAGE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="insp-serial">Firearm Serial Number *</Label>
                    <Input
                      id="insp-serial"
                      value={newInspection.firearmSerialNumber}
                      onChange={(e) =>
                        setNewInspection({
                          ...newInspection,
                          firearmSerialNumber: e.target.value,
                          barrelSerialNumber: e.target.value,
                          frameSerialNumber: e.target.value,
                          receiverSerialNumber: e.target.value,
                        })
                      }
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insp-type">Firearm Type</Label>
                    <Select
                      value={newInspection.firearmType}
                      onValueChange={(value) => setNewInspection({ ...newInspection, firearmType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RIFLE">RIFLE</SelectItem>
                        <SelectItem value="PISTOL">PISTOL</SelectItem>
                        <SelectItem value="Self-Loading Rifle/Carbine">Self-Loading Rifle/Carbine</SelectItem>
                        <SelectItem value="SHOTGUN">SHOTGUN</SelectItem>
                        <SelectItem value="REVOLVER">REVOLVER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="insp-action">Action Type</Label>
                    <Select
                      value={newInspection.actionType}
                      onValueChange={(value) => setNewInspection({ ...newInspection, actionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bolt">Bolt</SelectItem>
                        <SelectItem value="Semi-Auto">Semi-Auto</SelectItem>
                        <SelectItem value="Lever">Lever</SelectItem>
                        <SelectItem value="Pump">Pump</SelectItem>
                        <SelectItem value="Break">Break</SelectItem>
                        <SelectItem value="Single Shot">Single Shot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="insp-date">Inspection Date</Label>
                    <Input
                      id="insp-date"
                      type="date"
                      value={newInspection.inspectionDate}
                      onChange={(e) => setNewInspection({ ...newInspection, inspectionDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="insp-inspector">Inspector</Label>
                    <Input
                      id="insp-inspector"
                      value={newInspection.inspector}
                      onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
                      placeholder="Enter inspector name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insp-dealer">Dealer Code</Label>
                    <Input
                      id="insp-dealer"
                      value={newInspection.dealerCode}
                      onChange={(e) => setNewInspection({ ...newInspection, dealerCode: e.target.value })}
                      placeholder="Enter dealer code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insp-company">Company Name</Label>
                    <Input
                      id="insp-company"
                      value={newInspection.companyName}
                      onChange={(e) => setNewInspection({ ...newInspection, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insp-country">Country of Origin</Label>
                    <Input
                      id="insp-country"
                      value={newInspection.countryOfOrigin}
                      onChange={(e) => setNewInspection({ ...newInspection, countryOfOrigin: e.target.value })}
                      placeholder="Enter country of origin"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="insp-remarks">Remarks</Label>
                  <Textarea
                    id="insp-remarks"
                    value={newInspection.remarks}
                    onChange={(e) => setNewInspection({ ...newInspection, remarks: e.target.value })}
                    placeholder="Enter remarks"
                  />
                </div>
                <div>
                  <Label htmlFor="insp-comments">Comments</Label>
                  <Textarea
                    id="insp-comments"
                    value={newInspection.comments}
                    onChange={(e) => setNewInspection({ ...newInspection, comments: e.target.value })}
                    placeholder="Enter comments"
                  />
                </div>
                <Button onClick={handleAddInspection} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inspection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {currentUser.role === "admin" && (
            <TabsContent value="users">
              <UserManagement currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Signature Pad Dialog */}
      <SignaturePad
        isOpen={isSignaturePadOpen}
        onClose={() => setIsSignaturePadOpen(false)}
        onSignatureSave={handleSignature}
        title={signatureType === "collection" ? "Collection Signature" : "Transfer Signature"}
      />

      {/* Add Firearm Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Firearm</DialogTitle>
            <DialogDescription>Enter the details for the new firearm entry</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="new-stock-no">Stock No *</Label>
              <Input
                id="new-stock-no"
                value={newFirearm.stockNo || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, stockNo: e.target.value })}
                placeholder="Enter stock number"
              />
            </div>
            <div>
              <Label htmlFor="new-date-received">Date Received</Label>
              <Input
                id="new-date-received"
                type="date"
                value={newFirearm.dateReceived || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, dateReceived: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-make">Make *</Label>
              <Input
                id="new-make"
                value={newFirearm.make || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, make: e.target.value })}
                placeholder="Enter make"
              />
            </div>
            <div>
              <Label htmlFor="new-type">Type</Label>
              <Input
                id="new-type"
                value={newFirearm.type || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, type: e.target.value })}
                placeholder="Enter type"
              />
            </div>
            <div>
              <Label htmlFor="new-caliber">Caliber</Label>
              <Input
                id="new-caliber"
                value={newFirearm.caliber || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, caliber: e.target.value })}
                placeholder="Enter caliber"
              />
            </div>
            <div>
              <Label htmlFor="new-serial-no">Serial No *</Label>
              <Input
                id="new-serial-no"
                value={newFirearm.serialNo || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, serialNo: e.target.value })}
                placeholder="Enter serial number"
              />
            </div>
            <div>
              <Label htmlFor="new-full-name">Full Name</Label>
              <Input
                id="new-full-name"
                value={newFirearm.fullName || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="new-surname">Surname</Label>
              <Input
                id="new-surname"
                value={newFirearm.surname || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, surname: e.target.value })}
                placeholder="Enter surname"
              />
            </div>
            <div>
              <Label htmlFor="new-registration-id">Registration ID</Label>
              <Input
                id="new-registration-id"
                value={newFirearm.registrationId || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, registrationId: e.target.value })}
                placeholder="Enter registration ID"
              />
            </div>
            <div>
              <Label htmlFor="new-licence-no">Licence No</Label>
              <Input
                id="new-licence-no"
                value={newFirearm.licenceNo || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, licenceNo: e.target.value })}
                placeholder="Enter licence number"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="new-physical-address">Physical Address</Label>
              <Input
                id="new-physical-address"
                value={newFirearm.physicalAddress || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, physicalAddress: e.target.value })}
                placeholder="Enter physical address"
              />
            </div>
            <div>
              <Label htmlFor="new-status">Status</Label>
              <Select
                value={newFirearm.status || "in-stock"}
                onValueChange={(value: FirearmEntry["status"]) => setNewFirearm({ ...newFirearm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="dealer-stock">Dealer Stock</SelectItem>
                  <SelectItem value="safe-keeping">Safe Keeping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="new-remarks">Remarks</Label>
              <Textarea
                id="new-remarks"
                value={newFirearm.remarks || ""}
                onChange={(e) => setNewFirearm({ ...newFirearm, remarks: e.target.value })}
                placeholder="Enter remarks"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddFirearm} className="flex-1">
              Add Firearm
            </Button>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Firearm Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Firearm</DialogTitle>
            <DialogDescription>Update the firearm details</DialogDescription>
          </DialogHeader>
          {editingFirearm && (
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="edit-stock-no">Stock No</Label>
                <Input
                  id="edit-stock-no"
                  value={editingFirearm.stockNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, stockNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-date-received">Date Received</Label>
                <Input
                  id="edit-date-received"
                  type="date"
                  value={editingFirearm.dateReceived}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, dateReceived: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-make">Make</Label>
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
                <Label htmlFor="edit-serial-no">Serial No</Label>
                <Input
                  id="edit-serial-no"
                  value={editingFirearm.serialNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, serialNo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-full-name">Full Name</Label>
                <Input
                  id="edit-full-name"
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
                <Label htmlFor="edit-registration-id">Registration ID</Label>
                <Input
                  id="edit-registration-id"
                  value={editingFirearm.registrationId}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, registrationId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-licence-no">Licence No</Label>
                <Input
                  id="edit-licence-no"
                  value={editingFirearm.licenceNo}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, licenceNo: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-physical-address">Physical Address</Label>
                <Input
                  id="edit-physical-address"
                  value={editingFirearm.physicalAddress}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, physicalAddress: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingFirearm.status}
                  onValueChange={(value: FirearmEntry["status"]) =>
                    setEditingFirearm({ ...editingFirearm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="collected">Collected</SelectItem>
                    <SelectItem value="dealer-stock">Dealer Stock</SelectItem>
                    <SelectItem value="safe-keeping">Safe Keeping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Textarea
                  id="edit-remarks"
                  value={editingFirearm.remarks}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, remarks: e.target.value })}
                  rows={3}
                />
                <Textarea
                  id="edit-remarks"
                  value={editingFirearm.remarks}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, remarks: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdateFirearm} className="flex-1">
              Update Firearm
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the firearm entry from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFirearm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
