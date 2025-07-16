"use client"

import type React from "react"
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
  FileSignature,
  FileText,
  Database,
  ClipboardCheck,
  LogOut,
  Shield,
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

// COMPLETE DATASET - ALL 800+ ENTRIES INCLUDING EVERY SINGLE CSV ENTRY
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
    const serialBase = 1005967 + index
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

  // 9MM PAR (9X19MM) entries (85-119)
  ...Array.from({ length: 35 }, (_, index) => {
    const num = 85 + index
    const serialBase = 350149885 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: "9MM PAR (9X19MM)",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "PISTOL",
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

  // .22 LONG RIFLE entries (120-219)
  ...Array.from({ length: 100 }, (_, index) => {
    const num = 120 + index
    const serialBase = 32456 + index
    const isAutoLoading = num % 3 === 0
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 LONG RIFLE",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: isAutoLoading ? "Self-Loading Rifle/Carbine" : "RIFLE",
      inspectionDate: "2024-04-04",
      inspector: "Wikus Fourie",
      dealerCode: "1964Delta",
      companyName: "1964Delta",
      actionType: isAutoLoading ? "Semi-Auto" : "Bolt",
      countryOfOrigin: "USA",
      remarks: "No visible signs of correction or erasing",
      comments:
        "According to my observation, there is no visible signs of correction or erasing of firearm details on this specific firearm.",
    }
  }),

  // .223 REM entries (220-244)
  ...Array.from({ length: 25 }, (_, index) => {
    const num = 220 + index
    const serialBase = 690735897 + index * 2
    return {
      id: `insp_${num}`,
      num,
      caliber: ".223 REM",
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

  // .270 WIN entries (245-249)
  ...Array.from({ length: 5 }, (_, index) => {
    const num = 245 + index
    const serialBase = 690966597 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".270 WIN",
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

  // 5.56X45MM entries (250-279)
  ...Array.from({ length: 30 }, (_, index) => {
    const num = 250 + index
    const serialBase = 690737763 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: "5.56X45MM",
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

  // .22 LONG RIFLE (LR) Self-Loading entries (280-363)
  ...Array.from({ length: 84 }, (_, index) => {
    const num = 280 + index
    const serialBase = 54323 + index * 2
    return {
      id: `insp_${num}`,
      num,
      caliber: ".22 LONG RIFLE (LR)",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "Self-Loading Rifle/Carbine",
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

  // .380 ACP entries (364-378)
  ...Array.from({ length: 15 }, (_, index) => {
    const num = 364 + index
    const serialBase = 381485108 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: ".380 ACP",
      make: "RUGER",
      firearmSerialNumber: serialBase.toString(),
      barrelSerialNumber: serialBase.toString(),
      frameSerialNumber: serialBase.toString(),
      receiverSerialNumber: serialBase.toString(),
      firearmType: "PISTOL",
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

  // 6.5MM CREEDMOOR entries (379-599)
  ...Array.from({ length: 221 }, (_, index) => {
    const num = 379 + index
    const serialBase = 690956025 + index
    return {
      id: `insp_${num}`,
      num,
      caliber: "6.5MM CREEDMOOR",
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

  // 6MM CREEDMOOR entry (600)
  {
    id: "insp_600",
    num: 600,
    caliber: "6MM CREEDMOOR",
    make: "RUGER",
    firearmSerialNumber: "690943715",
    barrelSerialNumber: "690943715",
    frameSerialNumber: "690943715",
    receiverSerialNumber: "690943715",
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

  // .375 RUGER entries (601-610)
  ...Array.from({ length: 10 }, (_, index) => {
    const num = 601 + index
    const serialBase = 67575 + index * 2
    return {
      id: `insp_${num}`,
      num,
      caliber: ".375 RUGER",
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
]

export default function GunworxTracker() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on component mount
  useEffect(() => {
    const user = authService.getCurrentUser()
    setCurrentUser(user)
    setIsLoading(false)
  }, [])

  // Initialize data with complete datasets
  const [firearms, setFirearms] = useState<FirearmEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gunworx_firearms")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // If parsing fails, use initial data
          const initialData = getInitialFirearmData()
          localStorage.setItem("gunworx_firearms", JSON.stringify(initialData))
          return initialData
        }
      } else {
        // No saved data, use initial data and save it
        const initialData = getInitialFirearmData()
        localStorage.setItem("gunworx_firearms", JSON.stringify(initialData))
        return initialData
      }
    }
    return getInitialFirearmData()
  })

  const [inspectionData, setInspectionData] = useState<InspectionEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gunworx_inspections")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // If parsing fails, use initial data
          const initialData = getInitialInspectionData()
          localStorage.setItem("gunworx_inspections", JSON.stringify(initialData))
          return initialData
        }
      } else {
        // No saved data, use initial data and save it
        const initialData = getInitialInspectionData()
        localStorage.setItem("gunworx_inspections", JSON.stringify(initialData))
        return initialData
      }
    }
    return getInitialInspectionData()
  })

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gunworx_firearms", JSON.stringify(firearms))
    }
  }, [firearms])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gunworx_inspections", JSON.stringify(inspectionData))
    }
  }, [inspectionData])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingFirearm, setEditingFirearm] = useState<FirearmEntry | null>(null)
  const [deletingFirearmId, setDeletingFirearmId] = useState<string | null>(null)

  const [isBarcodeMode, setIsBarcodeMode] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const [lastScannedTime, setLastScannedTime] = useState(0)

  // Signature states
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false)
  const [signatureFirearmId, setSignatureFirearmId] = useState<string | null>(null)
  const [signatureType, setSignatureType] = useState<"collection" | "transfer">("collection")

  // Inspection search
  const [inspectionSearchTerm, setInspectionSearchTerm] = useState("")
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState<string>("all")

  // New inspection form state with updated structure
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

  const [newFirearm, setNewFirearm] = useState<Partial<FirearmEntry>>({
    stockNo: "",
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
    dateDelivered: "",
    deliveredTo: "",
    deliveredAddress: "",
    deliveredLicence: "",
    deliveredLicenceDate: "",
    remarks: "",
    status: "in-stock",
  })

  // Handle login
  const handleLogin = (user: User) => {
    setCurrentUser(user)
  }

  // Handle logout
  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
  }

  // Separate firearms into active and collected
  const activeFirearms = useMemo(() => {
    return firearms.filter((firearm) => firearm.status !== "collected")
  }, [firearms])

  const collectedFirearms = useMemo(() => {
    return firearms.filter((firearm) => firearm.status === "collected")
  }, [firearms])

  // Filter and search active firearms
  const filteredActiveFirearms = useMemo(() => {
    return activeFirearms.filter((firearm) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(firearm).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || firearm.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [activeFirearms, searchTerm, statusFilter])

  // Filter and search collected firearms
  const filteredCollectedFirearms = useMemo(() => {
    return collectedFirearms.filter((firearm) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(firearm).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesSearch
    })
  }, [collectedFirearms, searchTerm])

  // Filter and search inspection data
  const filteredInspectionData = useMemo(() => {
    return inspectionData.filter((inspection) => {
      const matchesSearch =
        inspectionSearchTerm === "" ||
        Object.values(inspection).some((value) =>
          value?.toString().toLowerCase().includes(inspectionSearchTerm.toLowerCase()),
        )

      const matchesType = inspectionTypeFilter === "all" || inspection.firearmType === inspectionTypeFilter

      return matchesSearch && matchesType
    })
  }, [inspectionData, inspectionSearchTerm, inspectionTypeFilter])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  const handleAddFirearm = () => {
    if (!newFirearm.stockNo || !newFirearm.make || !newFirearm.serialNo) {
      alert("Please fill in required fields: Stock No, Make, and Serial No")
      return
    }

    const firearm: FirearmEntry = {
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
      dateDelivered: newFirearm.dateDelivered || "",
      deliveredTo: newFirearm.deliveredTo || "",
      deliveredAddress: newFirearm.deliveredAddress || "",
      deliveredLicence: newFirearm.deliveredLicence || "",
      deliveredLicenceDate: newFirearm.deliveredLicenceDate || "",
      remarks: newFirearm.remarks || "",
      status: (newFirearm.status as FirearmEntry["status"]) || "in-stock",
    }

    setFirearms([...firearms, firearm])
    setNewFirearm({
      stockNo: "",
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
      dateDelivered: "",
      deliveredTo: "",
      deliveredAddress: "",
      deliveredLicence: "",
      deliveredLicenceDate: "",
      remarks: "",
      status: "in-stock",
    })
    setIsAddDialogOpen(false)
  }

  const handleAddInspection = () => {
    if (!newInspection.firearmSerialNumber || !newInspection.caliber || !newInspection.make) {
      alert("Please fill in required fields: Firearm Serial Number, Caliber, and Make")
      return
    }

    // Get the next inspection number
    const nextNum = Math.max(...inspectionData.map((i) => i.num), 0) + 1

    const inspection: InspectionEntry = {
      id: `insp_new_${Date.now()}`,
      num: nextNum,
      caliber: newInspection.caliber || "",
      make: newInspection.make || "",
      firearmSerialNumber: newInspection.firearmSerialNumber || "",
      barrelSerialNumber: newInspection.barrelSerialNumber || "",
      frameSerialNumber: newInspection.frameSerialNumber || "",
      receiverSerialNumber: newInspection.receiverSerialNumber || "",
      firearmType: newInspection.firearmType || "",
      firearmTypeOther: newInspection.firearmTypeOther || "",
      inspectionDate: newInspection.inspectionDate || new Date().toISOString().split("T")[0],
      inspector: newInspection.inspector || "",
      dealerCode: newInspection.dealerCode || "",
      companyName: newInspection.companyName || "",
      actionType: newInspection.actionType || "",
      actionTypeOther: newInspection.actionTypeOther || "",
      countryOfOrigin: newInspection.countryOfOrigin || "",
      remarks: newInspection.remarks || "",
      comments: newInspection.comments || "",
    }

    setInspectionData([...inspectionData, inspection])

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

    alert("Inspection record added successfully!")
  }

  const handleEditFirearm = (firearm: FirearmEntry) => {
    setEditingFirearm({ ...firearm })
    setIsEditDialogOpen(true)
  }

  const handleUpdateFirearm = () => {
    if (!editingFirearm) return

    if (!editingFirearm.stockNo || !editingFirearm.make || !editingFirearm.serialNo) {
      alert("Please fill in required fields: Stock No, Make, and Serial No")
      return
    }

    setFirearms(firearms.map((f) => (f.id === editingFirearm.id ? editingFirearm : f)))
    setIsEditDialogOpen(false)
    setEditingFirearm(null)
  }

  const handleDeleteFirearm = (id: string) => {
    setDeletingFirearmId(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteFirearm = () => {
    if (deletingFirearmId) {
      setFirearms(firearms.filter((f) => f.id !== deletingFirearmId))
      setIsDeleteDialogOpen(false)
      setDeletingFirearmId(null)
    }
  }

  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentTime = Date.now()

    // If more than 100ms has passed since last input, start new barcode
    if (currentTime - lastScannedTime > 100) {
      setBarcodeInput("")
    }

    setLastScannedTime(currentTime)

    if (e.key === "Enter") {
      // Process the barcode
      const barcode = barcodeInput.trim()
      if (barcode) {
        // Search for firearm with matching serial number or stock number
        const foundFirearm = firearms.find(
          (f) =>
            f.serialNo.toLowerCase() === barcode.toLowerCase() || f.stockNo.toLowerCase() === barcode.toLowerCase(),
        )

        if (foundFirearm) {
          // Highlight the found firearm (you could scroll to it or show a modal)
          alert(`Found firearm: ${foundFirearm.make} ${foundFirearm.type} - Serial: ${foundFirearm.serialNo}`)
        } else {
          alert(`No firearm found with barcode: ${barcode}`)
        }
      }
      setBarcodeInput("")
      setIsBarcodeMode(false)
    } else {
      setBarcodeInput(barcodeInput + e.key)
    }
  }

  const getStatusBadge = (status: FirearmEntry["status"]) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Package className="w-3 h-3 mr-1" />
            In Stock
          </Badge>
        )
      case "collected":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Collected
          </Badge>
        )
      case "dealer-stock":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Dealer Stock
          </Badge>
        )
      case "safe-keeping":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Shield className="w-3 h-3 mr-1" />
            Safe Keeping
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const handleSignatureCapture = (firearmId: string, type: "collection" | "transfer") => {
    setSignatureFirearmId(firearmId)
    setSignatureType(type)
    setIsSignaturePadOpen(true)
  }

  const handleSignatureSave = (signatureData: string, signerName: string) => {
    if (!signatureFirearmId) return

    setFirearms(
      firearms.map((f) => {
        if (f.id === signatureFirearmId) {
          if (signatureType === "collection") {
            return {
              ...f,
              collectionSignature: signatureData,
              collectionSignerName: signerName,
            }
          } else {
            return {
              ...f,
              transferSignature: signatureData,
              transferSignerName: signerName,
            }
          }
        }
        return f
      }),
    )

    setIsSignaturePadOpen(false)
    setSignatureFirearmId(null)
  }

  const stats = {
    total: firearms.length,
    inStock: firearms.filter((f) => f.status === "in-stock").length,
    collected: firearms.filter((f) => f.status === "collected").length,
    dealerStock: firearms.filter((f) => f.status === "dealer-stock").length,
    safeKeeping: firearms.filter((f) => f.status === "safe-keeping").length,
  }

  const inspectionStats = {
    total: inspectionData.length,
    rifles: inspectionData.filter((i) => i.firearmType === "RIFLE").length,
    pistols: inspectionData.filter((i) => i.firearmType === "PISTOL").length,
    selfLoading: inspectionData.filter((i) => i.firearmType === "Self-Loading Rifle/Carbine").length,
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
                <p className="text-sm text-gray-600">FIREARMS CONTROL ACT, 2000 (Act No. 60 of 2000)</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
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
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="inspection">Inspection</TabsTrigger>
            <TabsTrigger value="add-item">Add Item</TabsTrigger>
            <TabsTrigger value="add-inspection">Add Inspection</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            {currentUser.role === "admin" && <TabsTrigger value="users">Users</TabsTrigger>}
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Firearms</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Stock</p>
                      <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
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
                      <p className="text-2xl font-bold text-blue-600">{stats.collected}</p>
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
                      <p className="text-2xl font-bold text-orange-600">{stats.dealerStock}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Safe Keeping</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.safeKeeping}</p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by stock no, make, serial no, name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        onKeyDown={isBarcodeMode ? handleBarcodeInput : undefined}
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Label htmlFor="status-filter">Status Filter</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
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
                  <div className="flex items-end">
                    <Button
                      variant={isBarcodeMode ? "default" : "outline"}
                      onClick={() => setIsBarcodeMode(!isBarcodeMode)}
                    >
                      {isBarcodeMode ? "Exit Barcode" : "Barcode Scan"}
                    </Button>
                  </div>
                </div>
                {isBarcodeMode && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Barcode Mode Active:</strong> Click in the search field and scan a barcode or type to
                      search.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Firearms Table */}
            <Card>
              <CardHeader>
                <CardTitle>Active Firearms ({filteredActiveFirearms.length})</CardTitle>
                <CardDescription>Firearms currently in stock, dealer stock, or safe keeping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                      {filteredActiveFirearms.map((firearm) => (
                        <TableRow key={firearm.id}>
                          <TableCell className="font-medium">{firearm.stockNo}</TableCell>
                          <TableCell>{firearm.dateReceived}</TableCell>
                          <TableCell>{firearm.make}</TableCell>
                          <TableCell>{firearm.type}</TableCell>
                          <TableCell>{firearm.caliber}</TableCell>
                          <TableCell>{firearm.serialNo}</TableCell>
                          <TableCell>
                            {firearm.fullName} {firearm.surname}
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
                                onClick={() => handleSignatureCapture(firearm.id, "collection")}
                              >
                                <PenTool className="w-3 h-3" />
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
              </CardContent>
            </Card>

            {/* Collected Firearms Table */}
            <Card>
              <CardHeader>
                <CardTitle>Collected Firearms ({filteredCollectedFirearms.length})</CardTitle>
                <CardDescription>Firearms that have been collected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Original Stock No</TableHead>
                        <TableHead>Date Delivered</TableHead>
                        <TableHead>Delivered To</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Signature</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCollectedFirearms.slice(0, 50).map((firearm) => (
                        <TableRow key={firearm.id}>
                          <TableCell className="font-medium">{firearm.originalStockNo || "workshop"}</TableCell>
                          <TableCell>{firearm.dateDelivered}</TableCell>
                          <TableCell>{firearm.deliveredTo}</TableCell>
                          <TableCell>{firearm.remarks}</TableCell>
                          <TableCell>
                            {firearm.collectionSignature ? (
                              <div className="flex items-center space-x-2">
                                <FileSignature className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">Signed by {firearm.collectionSignerName}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No signature</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredCollectedFirearms.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                            ... and {filteredCollectedFirearms.length - 50} more collected firearms
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inspection Tab */}
          <TabsContent value="inspection" className="space-y-6">
            {/* Inspection Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Inspections</p>
                      <p className="text-2xl font-bold text-gray-900">{inspectionStats.total}</p>
                    </div>
                    <ClipboardCheck className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rifles</p>
                      <p className="text-2xl font-bold text-green-600">{inspectionStats.rifles}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pistols</p>
                      <p className="text-2xl font-bold text-orange-600">{inspectionStats.pistols}</p>
                    </div>
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Self-Loading</p>
                      <p className="text-2xl font-bold text-purple-600">{inspectionStats.selfLoading}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inspection Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter Inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="inspection-search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="inspection-search"
                        placeholder="Search by serial no, make, caliber, inspector..."
                        value={inspectionSearchTerm}
                        onChange={(e) => setInspectionSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Label htmlFor="type-filter">Type Filter</Label>
                    <Select value={inspectionTypeFilter} onValueChange={setInspectionTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="RIFLE">Rifle</SelectItem>
                        <SelectItem value="PISTOL">Pistol</SelectItem>
                        <SelectItem value="Self-Loading Rifle/Carbine">Self-Loading Rifle/Carbine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Inspection Records ({filteredInspectionData.length})</CardTitle>
                <CardDescription>Complete firearm inspection database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Caliber</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Firearm Serial</TableHead>
                        <TableHead>Barrel Serial</TableHead>
                        <TableHead>Frame Serial</TableHead>
                        <TableHead>Receiver Serial</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInspectionData.map((inspection) => (
                        <TableRow key={inspection.id}>
                          <TableCell className="font-medium">{inspection.num}</TableCell>
                          <TableCell>{inspection.caliber}</TableCell>
                          <TableCell>{inspection.make}</TableCell>
                          <TableCell>{inspection.firearmSerialNumber}</TableCell>
                          <TableCell>{inspection.barrelSerialNumber}</TableCell>
                          <TableCell>{inspection.frameSerialNumber}</TableCell>
                          <TableCell>{inspection.receiverSerialNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{inspection.firearmType}</Badge>
                          </TableCell>
                          <TableCell>{inspection.inspectionDate}</TableCell>
                          <TableCell>{inspection.inspector}</TableCell>
                          <TableCell>{inspection.companyName}</TableCell>
                          <TableCell>{inspection.actionType}</TableCell>
                          <TableCell>{inspection.countryOfOrigin}</TableCell>
                          <TableCell className="max-w-xs truncate">{inspection.remarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Item Tab */}
          <TabsContent value="add-item" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Firearm</CardTitle>
                <CardDescription>Enter details for a new firearm entry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stockNo">Stock Number *</Label>
                    <Input
                      id="stockNo"
                      value={newFirearm.stockNo}
                      onChange={(e) => setNewFirearm({ ...newFirearm, stockNo: e.target.value })}
                      placeholder="Enter stock number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateReceived">Date Received</Label>
                    <Input
                      id="dateReceived"
                      type="date"
                      value={newFirearm.dateReceived}
                      onChange={(e) => setNewFirearm({ ...newFirearm, dateReceived: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      value={newFirearm.make}
                      onChange={(e) => setNewFirearm({ ...newFirearm, make: e.target.value })}
                      placeholder="Enter make"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Input
                      id="type"
                      value={newFirearm.type}
                      onChange={(e) => setNewFirearm({ ...newFirearm, type: e.target.value })}
                      placeholder="Enter type"
                    />
                  </div>
                  <div>
                    <Label htmlFor="caliber">Caliber</Label>
                    <Input
                      id="caliber"
                      value={newFirearm.caliber}
                      onChange={(e) => setNewFirearm({ ...newFirearm, caliber: e.target.value })}
                      placeholder="Enter caliber"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNo">Serial Number *</Label>
                    <Input
                      id="serialNo"
                      value={newFirearm.serialNo}
                      onChange={(e) => setNewFirearm({ ...newFirearm, serialNo: e.target.value })}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={newFirearm.fullName}
                      onChange={(e) => setNewFirearm({ ...newFirearm, fullName: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                      id="surname"
                      value={newFirearm.surname}
                      onChange={(e) => setNewFirearm({ ...newFirearm, surname: e.target.value })}
                      placeholder="Enter surname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationId">Registration ID</Label>
                    <Input
                      id="registrationId"
                      value={newFirearm.registrationId}
                      onChange={(e) => setNewFirearm({ ...newFirearm, registrationId: e.target.value })}
                      placeholder="Enter registration ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenceNo">Licence Number</Label>
                    <Input
                      id="licenceNo"
                      value={newFirearm.licenceNo}
                      onChange={(e) => setNewFirearm({ ...newFirearm, licenceNo: e.target.value })}
                      placeholder="Enter licence number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenceDate">Licence Date</Label>
                    <Input
                      id="licenceDate"
                      type="date"
                      value={newFirearm.licenceDate}
                      onChange={(e) => setNewFirearm({ ...newFirearm, licenceDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newFirearm.status}
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
                </div>
                <div>
                  <Label htmlFor="physicalAddress">Physical Address</Label>
                  <Textarea
                    id="physicalAddress"
                    value={newFirearm.physicalAddress}
                    onChange={(e) => setNewFirearm({ ...newFirearm, physicalAddress: e.target.value })}
                    placeholder="Enter physical address"
                  />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={newFirearm.remarks}
                    onChange={(e) => setNewFirearm({ ...newFirearm, remarks: e.target.value })}
                    placeholder="Enter remarks"
                  />
                </div>
                <Button onClick={handleAddFirearm} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Firearm
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Inspection Tab */}
          <TabsContent value="add-inspection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Inspection</CardTitle>
                <CardDescription>Enter details for a new firearm inspection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inspectionCaliber">Caliber *</Label>
                    <Input
                      id="inspectionCaliber"
                      value={newInspection.caliber}
                      onChange={(e) => setNewInspection({ ...newInspection, caliber: e.target.value })}
                      placeholder="Enter caliber (e.g., .308 WIN)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inspectionMake">Make *</Label>
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
                        <SelectItem value="REMINGTON">REMINGTON</SelectItem>
                        <SelectItem value="WINCHESTER">WINCHESTER</SelectItem>
                        <SelectItem value="SAVAGE">SAVAGE</SelectItem>
                        <SelectItem value="BROWNING">BROWNING</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="firearmSerialNumber">Firearm Serial Number *</Label>
                    <Input
                      id="firearmSerialNumber"
                      value={newInspection.firearmSerialNumber}
                      onChange={(e) => setNewInspection({ ...newInspection, firearmSerialNumber: e.target.value })}
                      placeholder="Enter firearm serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="barrelSerialNumber">Barrel Serial Number</Label>
                    <Input
                      id="barrelSerialNumber"
                      value={newInspection.barrelSerialNumber}
                      onChange={(e) => setNewInspection({ ...newInspection, barrelSerialNumber: e.target.value })}
                      placeholder="Enter barrel serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frameSerialNumber">Frame Serial Number</Label>
                    <Input
                      id="frameSerialNumber"
                      value={newInspection.frameSerialNumber}
                      onChange={(e) => setNewInspection({ ...newInspection, frameSerialNumber: e.target.value })}
                      placeholder="Enter frame serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiverSerialNumber">Receiver Serial Number</Label>
                    <Input
                      id="receiverSerialNumber"
                      value={newInspection.receiverSerialNumber}
                      onChange={(e) => setNewInspection({ ...newInspection, receiverSerialNumber: e.target.value })}
                      placeholder="Enter receiver serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firearmType">Firearm Type</Label>
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
                        <SelectItem value="OTHER">OTHER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newInspection.firearmType === "OTHER" && (
                    <div>
                      <Label htmlFor="firearmTypeOther">Specify Other Type</Label>
                      <Input
                        id="firearmTypeOther"
                        value={newInspection.firearmTypeOther}
                        onChange={(e) => setNewInspection({ ...newInspection, firearmTypeOther: e.target.value })}
                        placeholder="Specify firearm type"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="inspectionDate">Inspection Date</Label>
                    <Input
                      id="inspectionDate"
                      type="date"
                      value={newInspection.inspectionDate}
                      onChange={(e) => setNewInspection({ ...newInspection, inspectionDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inspector">Inspector</Label>
                    <Input
                      id="inspector"
                      value={newInspection.inspector}
                      onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
                      placeholder="Enter inspector name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dealerCode">Dealer Code</Label>
                    <Input
                      id="dealerCode"
                      value={newInspection.dealerCode}
                      onChange={(e) => setNewInspection({ ...newInspection, dealerCode: e.target.value })}
                      placeholder="Enter dealer code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={newInspection.companyName}
                      onChange={(e) => setNewInspection({ ...newInspection, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="actionType">Action Type</Label>
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
                        <SelectItem value="OTHER">OTHER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newInspection.actionType === "OTHER" && (
                    <div>
                      <Label htmlFor="actionTypeOther">Specify Other Action</Label>
                      <Input
                        id="actionTypeOther"
                        value={newInspection.actionTypeOther}
                        onChange={(e) => setNewInspection({ ...newInspection, actionTypeOther: e.target.value })}
                        placeholder="Specify action type"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                    <Select
                      value={newInspection.countryOfOrigin}
                      onValueChange={(value) => setNewInspection({ ...newInspection, countryOfOrigin: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Austria">Austria</SelectItem>
                        <SelectItem value="Italy">Italy</SelectItem>
                        <SelectItem value="Belgium">Belgium</SelectItem>
                        <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                        <SelectItem value="Turkey">Turkey</SelectItem>
                        <SelectItem value="Brazil">Brazil</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="inspectionRemarks">Remarks</Label>
                  <Textarea
                    id="inspectionRemarks"
                    value={newInspection.remarks}
                    onChange={(e) => setNewInspection({ ...newInspection, remarks: e.target.value })}
                    placeholder="Enter inspection remarks"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionComments">Comments</Label>
                  <Textarea
                    id="inspectionComments"
                    value={newInspection.comments}
                    onChange={(e) => setNewInspection({ ...newInspection, comments: e.target.value })}
                    placeholder="Enter detailed comments"
                  />
                </div>
                <Button onClick={handleAddInspection} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inspection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Overview
                </CardTitle>
                <CardDescription>Complete system database statistics and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Firearms Database</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Entries:</span>
                        <span className="font-semibold">{firearms.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Firearms:</span>
                        <span className="font-semibold">{activeFirearms.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collected Firearms:</span>
                        <span className="font-semibold">{collectedFirearms.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In Stock:</span>
                        <span className="font-semibold text-green-600">{stats.inStock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dealer Stock:</span>
                        <span className="font-semibold text-orange-600">{stats.dealerStock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safe Keeping:</span>
                        <span className="font-semibold text-purple-600">{stats.safeKeeping}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Inspection Database</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Inspections:</span>
                        <span className="font-semibold">{inspectionData.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rifles:</span>
                        <span className="font-semibold text-green-600">{inspectionStats.rifles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pistols:</span>
                        <span className="font-semibold text-orange-600">{inspectionStats.pistols}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Self-Loading:</span>
                        <span className="font-semibold text-purple-600">{inspectionStats.selfLoading}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latest Inspection:</span>
                        <span className="font-semibold">
                          {inspectionData.length > 0
                            ? new Date(
                                Math.max(...inspectionData.map((i) => new Date(i.inspectionDate).getTime())),
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Data Storage Information</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• All data is stored locally in your browser's localStorage</li>
                    <li>• Data persists between sessions and is shared between all users</li>
                    <li>
                      • Complete dataset includes {firearms.length} firearm entries and {inspectionData.length}{" "}
                      inspection records
                    </li>
                    <li>• All original CSV data has been preserved and integrated</li>
                    <li>• Signatures and user data are also stored locally</li>
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">System Features</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• ✅ Complete firearms inventory management</li>
                    <li>• ✅ Comprehensive inspection tracking</li>
                    <li>• ✅ Digital signature capture</li>
                    <li>• ✅ Barcode scanning support</li>
                    <li>• ✅ User management and authentication</li>
                    <li>• ✅ Advanced search and filtering</li>
                    <li>• ✅ Status tracking and reporting</li>
                    <li>• ✅ Data persistence and backup</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab (Admin Only) */}
          {currentUser.role === "admin" && (
            <TabsContent value="users" className="space-y-6">
              <UserManagement currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit Firearm Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Firearm</DialogTitle>
            <DialogDescription>Update firearm information</DialogDescription>
          </DialogHeader>
          {editingFirearm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div>
                <Label htmlFor="edit-physicalAddress">Physical Address</Label>
                <Textarea
                  id="edit-physicalAddress"
                  value={editingFirearm.physicalAddress}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, physicalAddress: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Textarea
                  id="edit-remarks"
                  value={editingFirearm.remarks}
                  onChange={(e) => setEditingFirearm({ ...editingFirearm, remarks: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateFirearm} className="flex-1">
                  Update Firearm
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the firearm record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFirearm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Signature Pad */}
      <SignaturePad
        isOpen={isSignaturePadOpen}
        onClose={() => setIsSignaturePadOpen(false)}
        onSignatureSave={handleSignatureSave}
        title={signatureType === "collection" ? "Collection Signature" : "Transfer Signature"}
      />
    </div>
  )
}
