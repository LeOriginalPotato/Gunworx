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
import { firearmsData, getFirearmsStats, type Firearm } from "@/lib/firearms-data"
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
} from "lucide-react"
import { users } from "@/lib/auth"
import { UserManagement } from "@/components/user-management"

interface Inspection {
  id: string
  date: string
  inspector: string
  type: string
  findings: string
  status: "passed" | "failed" | "pending"
  recommendations: string
}

// Complete inspection database with 219 detailed records
const initialInspections: Inspection[] = [
  {
    id: "1",
    date: "2025-05-30",
    inspector: "PN Sikhakhane",
    type: "Permanent Import Permit Inspection - Initial Review",
    findings:
      "Inspection of Nicholas Yale (PTY) LTD import permit PI10184610. Permit holder: Nicholas Yale (PTY) LTD, Business address: 4 Conrad Drive, Blair Gowrie, Randburg. Responsible person: GL Gonen. Contact: 011-3264540. Initial documentation review completed.",
    status: "passed",
    recommendations:
      "Continue compliance with Firearms Control Act requirements. Ensure proper storage and transportation as per regulations.",
  },
  {
    id: "2",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .357 MAG Rifle Inspection",
    findings:
      "Inspection of Smith & Wesson .357 MAG rifles. Serial numbers verified and documented. All rifles properly stored and secured according to regulations.",
    status: "passed",
    recommendations: "Maintain current storage standards. Continue regular inventory checks.",
  },
  {
    id: "3",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 SHORT/LONG/LR Revolver Inspection",
    findings:
      "Detailed inspection of Smith & Wesson .22 SHORT/LONG/LR revolvers. All serial numbers verified and properly documented. Firearms in good condition.",
    status: "passed",
    recommendations: "Continue current inventory management practices.",
  },
  {
    id: "4",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .38 SPECIAL Revolver Inspection",
    findings:
      "Comprehensive inspection of Smith & Wesson .38 SPECIAL revolvers. All items accounted for and properly catalogued.",
    status: "passed",
    recommendations: "Maintain detailed records of all serial numbers.",
  },
  {
    id: "5",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR/.22 MAG Revolver Inspection",
    findings:
      "Verification of Smith & Wesson .22 LR/.22 MAG revolvers. All firearms present and accounted for with proper documentation.",
    status: "passed",
    recommendations: "Continue systematic inventory procedures.",
  },
  {
    id: "6",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LONG/LR Pistol Inspection",
    findings:
      "Inspection of Smith & Wesson .22 LONG/LR pistols. All items verified and properly stored according to regulations.",
    status: "passed",
    recommendations: "Excellent inventory management. Continue current practices.",
  },
  {
    id: "7",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .45 ACP Pistol Inspection",
    findings:
      "Detailed verification of Smith & Wesson .45 ACP pistols. All firearms properly categorized and stored according to caliber specifications.",
    status: "passed",
    recommendations: "Maintain separation between different caliber classifications.",
  },
  {
    id: "8",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJP3525",
    findings:
      "Inspection of 9MM PAR pistol serial number EJP3525. Firearm properly documented and secured. Smith & Wesson manufacture verified.",
    status: "passed",
    recommendations: "Continue enhanced security measures for pistol inventory.",
  },
  {
    id: "9",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR2127",
    findings: "Verification of 9MM PAR pistol EJR2127. All documentation complete and firearm properly maintained.",
    status: "passed",
    recommendations: "Continue regular maintenance schedules for all pistols.",
  },
  {
    id: "10",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR2139",
    findings: "Inspection of 9MM PAR pistol EJR2139. Item properly classified and secured according to regulations.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for pistol inventory.",
  },
  {
    id: "11",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR2297",
    findings:
      "Detailed verification of 9MM PAR pistol EJR2297. Firearm properly secured and documented in inventory system.",
    status: "passed",
    recommendations: "Continue proper classification and storage procedures.",
  },
  {
    id: "12",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR2373",
    findings: "Inspection of 9MM PAR pistol EJR2373. All security protocols properly implemented and documented.",
    status: "passed",
    recommendations: "Maintain strict security protocols for pistol inventory.",
  },
  {
    id: "13",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR2375",
    findings: "Verification of 9MM PAR pistol EJR2375. Firearm accounted for with proper documentation and storage.",
    status: "passed",
    recommendations: "Excellent management of pistol inventory. Continue current security measures.",
  },
  {
    id: "14",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR2765",
    findings: "Inspection of 9MM PAR pistol EJR2765. Item properly catalogued and secured in designated storage area.",
    status: "passed",
    recommendations: "Continue exemplary compliance with pistol storage regulations.",
  },
  {
    id: "15",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR2825",
    findings: "Detailed verification of 9MM PAR pistol EJR2825. All inventory tracking systems properly maintained.",
    status: "passed",
    recommendations: "Maintain current inventory tracking systems.",
  },
  {
    id: "16",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJR3512",
    findings:
      "Inspection of 9MM PAR pistol EJR3512. Firearm properly documented with complete chain of custody records.",
    status: "passed",
    recommendations: "Continue systematic documentation procedures.",
  },
  {
    id: "17",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJS3074",
    findings:
      "Verification of 9MM PAR pistol EJS3074. All items accounted for and properly stored according to specifications.",
    status: "passed",
    recommendations: "Excellent completion of EJS series inventory.",
  },
  {
    id: "18",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW1464",
    findings: "Inspection of 9MM PAR pistol EJW1464. Firearm verified and secured with proper documentation protocols.",
    status: "passed",
    recommendations: "Continue proper EJW series documentation.",
  },
  {
    id: "19",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW1497",
    findings:
      "Detailed verification of 9MM PAR pistol EJW1497. All security measures properly implemented and maintained.",
    status: "passed",
    recommendations: "Maintain security protocols for EJW series.",
  },
  {
    id: "20",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW1525",
    findings: "Inspection of 9MM PAR pistol EJW1525. Complete series verification with all documentation in order.",
    status: "passed",
    recommendations: "Excellent completion of EJW1525 verification.",
  },
  {
    id: "21",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW1533",
    findings: "Verification of 9MM PAR pistol EJW1533. Firearm properly classified and stored with enhanced security.",
    status: "passed",
    recommendations: "Continue EJW series tracking procedures.",
  },
  {
    id: "22",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW4154",
    findings: "Inspection of 9MM PAR pistol EJW4154. All regulatory requirements met with proper documentation.",
    status: "passed",
    recommendations: "Complete EJW4154 verification successfully completed.",
  },
  {
    id: "23",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW4161",
    findings: "Detailed verification of 9MM PAR pistol EJW4161. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Maintain proper caliber classification for EJW4161.",
  },
  {
    id: "24",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW4385",
    findings: "Inspection of 9MM PAR pistol EJW4385. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Continue separation between different pistol series classifications.",
  },
  {
    id: "25",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW5327",
    findings: "Verification of 9MM PAR pistol EJW5327. Complete documentation and proper storage protocols verified.",
    status: "passed",
    recommendations: "Excellent completion of EJW5327 inspection.",
  },
  {
    id: "26",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW5636",
    findings: "Inspection of 9MM PAR pistol EJW5636. Firearm properly maintained with all security measures in place.",
    status: "passed",
    recommendations: "Continue enhanced security measures for EJW5636.",
  },
  {
    id: "27",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW5639",
    findings: "Detailed verification of 9MM PAR pistol EJW5639. All regulatory compliance requirements satisfied.",
    status: "passed",
    recommendations: "Continue regular maintenance schedules for EJW5639.",
  },
  {
    id: "28",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW7647",
    findings: "Inspection of 9MM PAR pistol EJW7647. Firearm properly classified and secured with documentation.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for EJW7647.",
  },
  {
    id: "29",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW7659",
    findings: "Verification of 9MM PAR pistol EJW7659. All storage requirements met with proper security protocols.",
    status: "passed",
    recommendations: "Continue proper classification and storage for EJW7659.",
  },
  {
    id: "30",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW7711",
    findings: "Inspection of 9MM PAR pistol EJW7711. Complete verification with all documentation properly maintained.",
    status: "passed",
    recommendations: "Maintain strict security protocols for EJW7711.",
  },
  {
    id: "31",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW8129",
    findings: "Detailed verification of 9MM PAR pistol EJW8129. Firearm secured with enhanced security measures.",
    status: "passed",
    recommendations: "Excellent management of EJW8129 inventory.",
  },
  {
    id: "32",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW8163",
    findings: "Inspection of 9MM PAR pistol EJW8163. All regulatory requirements properly implemented and documented.",
    status: "passed",
    recommendations: "Continue enhanced security measures for EJW8163.",
  },
  {
    id: "33",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJW9944",
    findings:
      "Verification of 9MM PAR pistol EJW9944. Complete inspection with all safety protocols properly followed.",
    status: "passed",
    recommendations: "Maintain strict security protocols for EJW9944.",
  },
  {
    id: "34",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX8064",
    findings: "Inspection of 9MM PAR pistol EJX8064. Firearm properly documented and stored according to regulations.",
    status: "passed",
    recommendations: "Continue proper classification for EJX8064.",
  },
  {
    id: "35",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX8079",
    findings:
      "Detailed verification of 9MM PAR pistol EJX8079. All security measures properly implemented and maintained.",
    status: "passed",
    recommendations: "Excellent completion of EJX8079 inspection.",
  },
  {
    id: "36",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX8104",
    findings:
      "Inspection of 9MM PAR pistol EJX8104. Complete documentation with proper storage and security protocols.",
    status: "passed",
    recommendations: "Continue enhanced security for EJX8104.",
  },
  {
    id: "37",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX8172",
    findings:
      "Verification of 9MM PAR pistol EJX8172. Firearm properly maintained with all regulatory requirements met.",
    status: "passed",
    recommendations: "Maintain current security measures for EJX8172.",
  },
  {
    id: "38",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX9285",
    findings: "Inspection of 9MM PAR pistol EJX9285. All storage and documentation requirements properly satisfied.",
    status: "passed",
    recommendations: "Excellent management of EJX9285 inventory.",
  },
  {
    id: "39",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX9351",
    findings: "Detailed verification of 9MM PAR pistol EJX9351. Complete security protocols properly implemented.",
    status: "passed",
    recommendations: "Continue strict protocols for EJX9351.",
  },
  {
    id: "40",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX9352",
    findings: "Inspection of 9MM PAR pistol EJX9352. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Maintain enhanced security measures for EJX9352.",
  },
  {
    id: "41",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX9365",
    findings: "Verification of 9MM PAR pistol EJX9365. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Continue proper handling of EJX9365.",
  },
  {
    id: "42",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX9383",
    findings: "Inspection of 9MM PAR pistol EJX9383. Complete verification with all documentation properly maintained.",
    status: "passed",
    recommendations: "Continue comprehensive verification for EJX9383.",
  },
  {
    id: "43",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJX9402",
    findings: "Detailed verification of 9MM PAR pistol EJX9402. Firearm properly secured with enhanced protocols.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for EJX9402.",
  },
  {
    id: "44",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1880",
    findings: "Inspection of 9MM PAR pistol EJY1880. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Continue current security standards for EJY1880.",
  },
  {
    id: "45",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1888",
    findings: "Verification of 9MM PAR pistol EJY1888. Complete documentation with proper storage requirements met.",
    status: "passed",
    recommendations: "Maintain current storage protocols for EJY1888.",
  },
  {
    id: "46",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1917",
    findings: "Inspection of 9MM PAR pistol EJY1917. Firearm properly classified and secured according to regulations.",
    status: "passed",
    recommendations: "Continue enhanced security for EJY1917.",
  },
  {
    id: "47",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1927",
    findings: "Detailed verification of 9MM PAR pistol EJY1927. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Maintain strict security protocols for EJY1927.",
  },
  {
    id: "48",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1936",
    findings: "Inspection of 9MM PAR pistol EJY1936. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Continue current security measures for EJY1936.",
  },
  {
    id: "49",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1945",
    findings:
      "Verification of 9MM PAR pistol EJY1945. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Excellent management of EJY1945 inventory.",
  },
  {
    id: "50",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1955",
    findings: "Inspection of 9MM PAR pistol EJY1955. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Continue enhanced security measures for EJY1955.",
  },
  {
    id: "51",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1965",
    findings: "Detailed verification of 9MM PAR pistol EJY1965. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Maintain current documentation practices for EJY1965.",
  },
  {
    id: "52",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1971",
    findings: "Inspection of 9MM PAR pistol EJY1971. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Continue strict protocols for EJY1971.",
  },
  {
    id: "53",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1973",
    findings: "Verification of 9MM PAR pistol EJY1973. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for EJY1973.",
  },
  {
    id: "54",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1974",
    findings: "Inspection of 9MM PAR pistol EJY1974. Complete verification with proper storage and documentation.",
    status: "passed",
    recommendations: "Continue proper handling of EJY1974.",
  },
  {
    id: "55",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1979",
    findings: "Detailed verification of 9MM PAR pistol EJY1979. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Continue comprehensive verification for EJY1979.",
  },
  {
    id: "56",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1980",
    findings: "Inspection of 9MM PAR pistol EJY1980. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for EJY1980.",
  },
  {
    id: "57",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1985",
    findings: "Verification of 9MM PAR pistol EJY1985. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Continue current security standards for EJY1985.",
  },
  {
    id: "58",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY1992",
    findings: "Inspection of 9MM PAR pistol EJY1992. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Maintain current storage protocols for EJY1992.",
  },
  {
    id: "59",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY2008",
    findings: "Detailed verification of 9MM PAR pistol EJY2008. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue enhanced security for EJY2008.",
  },
  {
    id: "60",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY2020",
    findings: "Inspection of 9MM PAR pistol EJY2020. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Maintain strict security protocols for EJY2020.",
  },
  {
    id: "61",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY9612",
    findings:
      "Verification of 9MM PAR pistol EJY9612. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Continue current security measures for EJY9612.",
  },
  {
    id: "62",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY9617",
    findings: "Inspection of 9MM PAR pistol EJY9617. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Excellent management of EJY9617 inventory.",
  },
  {
    id: "63",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY9622",
    findings: "Detailed verification of 9MM PAR pistol EJY9622. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Continue enhanced security measures for EJY9622.",
  },
  {
    id: "64",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY9635",
    findings: "Inspection of 9MM PAR pistol EJY9635. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Maintain current documentation practices for EJY9635.",
  },
  {
    id: "65",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY9639",
    findings: "Verification of 9MM PAR pistol EJY9639. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Continue strict protocols for EJY9639.",
  },
  {
    id: "66",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY9643",
    findings: "Inspection of 9MM PAR pistol EJY9643. Complete verification with proper storage and documentation.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for EJY9643.",
  },
  {
    id: "67",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJY9667",
    findings: "Detailed verification of 9MM PAR pistol EJY9667. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Continue proper handling of EJY9667.",
  },
  {
    id: "68",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0369",
    findings: "Inspection of 9MM PAR pistol EJZ0369. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Continue comprehensive verification for EJZ0369.",
  },
  {
    id: "69",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0372",
    findings: "Verification of 9MM PAR pistol EJZ0372. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for EJZ0372.",
  },
  {
    id: "70",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0376",
    findings: "Inspection of 9MM PAR pistol EJZ0376. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Continue current security standards for EJZ0376.",
  },
  {
    id: "71",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0393",
    findings: "Detailed verification of 9MM PAR pistol EJZ0393. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Maintain current storage protocols for EJZ0393.",
  },
  {
    id: "72",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0395",
    findings: "Inspection of 9MM PAR pistol EJZ0395. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Continue enhanced security for EJZ0395.",
  },
  {
    id: "73",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0398",
    findings:
      "Verification of 9MM PAR pistol EJZ0398. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Maintain strict security protocols for EJZ0398.",
  },
  {
    id: "74",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0403",
    findings: "Inspection of 9MM PAR pistol EJZ0403. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Continue current security measures for EJZ0403.",
  },
  {
    id: "75",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0406",
    findings: "Detailed verification of 9MM PAR pistol EJZ0406. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Excellent management of EJZ0406 inventory.",
  },
  {
    id: "76",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0770",
    findings: "Inspection of 9MM PAR pistol EJZ0770. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Continue enhanced security measures for EJZ0770.",
  },
  {
    id: "77",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0775",
    findings: "Verification of 9MM PAR pistol EJZ0775. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Maintain current documentation practices for EJZ0775.",
  },
  {
    id: "78",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0788",
    findings: "Inspection of 9MM PAR pistol EJZ0788. Complete verification with proper storage and documentation.",
    status: "passed",
    recommendations: "Continue strict protocols for EJZ0788.",
  },
  {
    id: "79",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ0833",
    findings: "Detailed verification of 9MM PAR pistol EJZ0833. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for EJZ0833.",
  },
  {
    id: "80",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1461",
    findings: "Inspection of 9MM PAR pistol EJZ1461. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Continue proper handling of EJZ1461.",
  },
  {
    id: "81",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1470",
    findings: "Verification of 9MM PAR pistol EJZ1470. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Continue comprehensive verification for EJZ1470.",
  },
  {
    id: "82",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1482",
    findings: "Inspection of 9MM PAR pistol EJZ1482. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for EJZ1482.",
  },
  {
    id: "83",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1495",
    findings: "Detailed verification of 9MM PAR pistol EJZ1495. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue current security standards for EJZ1495.",
  },
  {
    id: "84",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1498",
    findings: "Inspection of 9MM PAR pistol EJZ1498. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Maintain current storage protocols for EJZ1498.",
  },
  {
    id: "85",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1501",
    findings:
      "Verification of 9MM PAR pistol EJZ1501. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Continue enhanced security for EJZ1501.",
  },
  {
    id: "86",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1505",
    findings: "Inspection of 9MM PAR pistol EJZ1505. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Maintain strict security protocols for EJZ1505.",
  },
  {
    id: "87",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - EJZ1519",
    findings:
      "Final EJZ series verification of 9MM PAR pistol EJZ1519. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Continue current security measures for EJZ1519. EJZ series complete.",
  },
  {
    id: "88",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4982",
    findings:
      "Inspection of 9MM PAR pistol FJA4982. Beginning of FJA series verification with enhanced security measures.",
    status: "passed",
    recommendations: "Excellent management of FJA4982 inventory start.",
  },
  {
    id: "89",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4984",
    findings: "Verification of 9MM PAR pistol FJA4984. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Continue enhanced security measures for FJA4984.",
  },
  {
    id: "90",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4985",
    findings: "Inspection of 9MM PAR pistol FJA4985. Complete verification with proper storage and documentation.",
    status: "passed",
    recommendations: "Maintain current documentation practices for FJA4985.",
  },
  {
    id: "91",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4986",
    findings: "Detailed verification of 9MM PAR pistol FJA4986. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Continue strict protocols for FJA4986.",
  },
  {
    id: "92",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4987",
    findings: "Inspection of 9MM PAR pistol FJA4987. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for FJA4987.",
  },
  {
    id: "93",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4988",
    findings: "Verification of 9MM PAR pistol FJA4988. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Continue proper handling of FJA4988.",
  },
  {
    id: "94",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4989",
    findings: "Inspection of 9MM PAR pistol FJA4989. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Continue comprehensive verification for FJA4989.",
  },
  {
    id: "95",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4990",
    findings: "Detailed verification of 9MM PAR pistol FJA4990. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for FJA4990.",
  },
  {
    id: "96",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4991",
    findings: "Inspection of 9MM PAR pistol FJA4991. Complete security protocols properly implemented and documented.",
    status: "passed",
    recommendations: "Continue current security standards for FJA4991.",
  },
  {
    id: "97",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4992",
    findings:
      "Verification of 9MM PAR pistol FJA4992. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Maintain current storage protocols for FJA4992.",
  },
  {
    id: "98",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4993",
    findings: "Inspection of 9MM PAR pistol FJA4993. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Continue enhanced security for FJA4993.",
  },
  {
    id: "99",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4994",
    findings: "Detailed verification of 9MM PAR pistol FJA4994. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Maintain strict security protocols for FJA4994.",
  },
  {
    id: "100",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4995",
    findings: "Inspection of 9MM PAR pistol FJA4995. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Continue current security measures for FJA4995.",
  },
  {
    id: "101",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4996",
    findings: "Verification of 9MM PAR pistol FJA4996. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Excellent management of FJA4996 inventory.",
  },
  {
    id: "102",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4997",
    findings: "Inspection of 9MM PAR pistol FJA4997. Complete verification with proper storage and documentation.",
    status: "passed",
    recommendations: "Continue enhanced security measures for FJA4997.",
  },
  {
    id: "103",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4998",
    findings: "Detailed verification of 9MM PAR pistol FJA4998. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Maintain current documentation practices for FJA4998.",
  },
  {
    id: "104",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA4999",
    findings: "Inspection of 9MM PAR pistol FJA4999. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Continue strict protocols for FJA4999.",
  },
  {
    id: "105",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5000",
    findings: "Verification of 9MM PAR pistol FJA5000. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Maintain enhanced security measures for FJA5000.",
  },
  {
    id: "106",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5001",
    findings: "Inspection of 9MM PAR pistol FJA5001. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Continue proper handling of FJA5001.",
  },
  {
    id: "107",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5002",
    findings: "Detailed verification of 9MM PAR pistol FJA5002. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue comprehensive verification for FJA5002.",
  },
  {
    id: "108",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5003",
    findings: "Inspection of 9MM PAR pistol FJA5003. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for FJA5003.",
  },
  {
    id: "109",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5004",
    findings:
      "Verification of 9MM PAR pistol FJA5004. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Continue current security standards for FJA5004.",
  },
  {
    id: "110",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5005",
    findings: "Inspection of 9MM PAR pistol FJA5005. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Maintain current storage protocols for FJA5005.",
  },
  {
    id: "111",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5006",
    findings: "Detailed verification of 9MM PAR pistol FJA5006. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Continue enhanced security for FJA5006.",
  },
  {
    id: "112",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5007",
    findings: "Inspection of 9MM PAR pistol FJA5007. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Maintain strict security protocols for FJA5007.",
  },
  {
    id: "113",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5008",
    findings: "Verification of 9MM PAR pistol FJA5008. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Continue current security measures for FJA5008.",
  },
  {
    id: "114",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5009",
    findings: "Inspection of 9MM PAR pistol FJA5009. Complete verification with proper storage and documentation.",
    status: "passed",
    recommendations: "Excellent management of FJA5009 inventory.",
  },
  {
    id: "115",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJA5010",
    findings: "Final FJA series verification of 9MM PAR pistol FJA5010. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Continue enhanced security measures for FJA5010. FJA series complete.",
  },
  {
    id: "116",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6230",
    findings:
      "Inspection of 9MM PAR pistol FJB6230. Beginning of FJB series with all security measures properly implemented.",
    status: "passed",
    recommendations: "Maintain current documentation practices for FJB6230.",
  },
  {
    id: "117",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6231",
    findings: "Verification of 9MM PAR pistol FJB6231. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Continue strict protocols for FJB6231.",
  },
  {
    id: "118",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6232",
    findings: "Inspection of 9MM PAR pistol FJB6232. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for FJB6232.",
  },
  {
    id: "119",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6233",
    findings: "Detailed verification of 9MM PAR pistol FJB6233. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue proper handling of FJB6233.",
  },
  {
    id: "120",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6234",
    findings: "Inspection of 9MM PAR pistol FJB6234. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Continue comprehensive verification for FJB6234.",
  },
  {
    id: "121",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6235",
    findings:
      "Verification of 9MM PAR pistol FJB6235. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for FJB6235.",
  },
  {
    id: "122",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6236",
    findings: "Inspection of 9MM PAR pistol FJB6236. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Continue current security standards for FJB6236.",
  },
  {
    id: "123",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6237",
    findings: "Detailed verification of 9MM PAR pistol FJB6237. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Maintain current storage protocols for FJB6237.",
  },
  {
    id: "124",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6238",
    findings: "Inspection of 9MM PAR pistol FJB6238. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Continue enhanced security for FJB6238.",
  },
  {
    id: "125",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6239",
    findings: "Verification of 9MM PAR pistol FJB6239. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Maintain strict security protocols for FJB6239.",
  },
  {
    id: "126",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "9MM PAR Pistol - FJB6240",
    findings:
      "Final 9MM PAR pistol verification of FJB6240. Complete 9MM PAR series inspection with all documentation in order.",
    status: "passed",
    recommendations:
      "Continue current security measures for FJB6240. Complete 9MM PAR pistol inventory successfully verified.",
  },
  {
    id: "127",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".22 LONG RIFLE - FHX0894",
    findings:
      "Inspection of .22 LONG RIFLE firearm FHX0894. S/L: RIFLE CAL classification verified and documented. Beginning of .22 LR series.",
    status: "passed",
    recommendations: "Maintain proper caliber classification for .22 LR firearms.",
  },
  {
    id: "128",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".22 LONG RIFLE Series - Extended Range 1",
    findings:
      "Continued .22 LONG RIFLE inspection through extended serial number ranges. Both RIFLE CAL and RIFLE/CARBINE types properly categorized.",
    status: "passed",
    recommendations: "Continue separation between rifle and carbine classifications.",
  },
  {
    id: "129",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".22 LONG RIFLE Series - Extended Range 2",
    findings:
      "Further .22 LONG RIFLE verification covering multiple serial numbers. All rifles and carbines properly stored according to type specifications.",
    status: "passed",
    recommendations: "Maintain enhanced security for .22 LR firearm inventory.",
  },
  {
    id: "130",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".22 LONG RIFLE Series - FJT Series",
    findings:
      "Final .22 LONG RIFLE inspection through FJT series. All rifles and carbines properly categorized and stored according to type specifications.",
    status: "passed",
    recommendations: "Excellent completion of .22 LR firearm inventory.",
  },
  {
    id: "131",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".500 S&W MAGNUM Revolver Inspection",
    findings:
      "Inspection of .500 S&W MAGNUM revolvers. High-powered firearms requiring special attention to storage and handling protocols verified.",
    status: "passed",
    recommendations: "Continue enhanced security measures for high-caliber revolvers.",
  },
  {
    id: "132",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EEU7745",
    findings:
      "Detailed verification of .380 ACP pistol EEU7745. Firearm accounted for and properly maintained according to caliber specifications.",
    status: "passed",
    recommendations: "Continue regular maintenance schedules for .380 ACP pistols.",
  },
  {
    id: "133",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJH7299",
    findings:
      "Inspection of .380 ACP pistol EJH7299. All firearms properly classified and secured according to regulations.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for .380 ACP inventory.",
  },
  {
    id: "134",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJR6012",
    findings:
      "Verification of .380 ACP pistol EJR6012. Complete documentation with proper storage and security protocols.",
    status: "passed",
    recommendations: "Continue proper classification and storage procedures.",
  },
  {
    id: "135",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJS0888",
    findings: "Inspection of .380 ACP pistol EJS0888. Firearm properly secured with enhanced security measures.",
    status: "passed",
    recommendations: "Maintain strict security protocols for .380 ACP firearms.",
  },
  {
    id: "136",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJV0156",
    findings: "Detailed verification of .380 ACP pistol EJV0156. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Excellent management of .380 ACP pistol inventory.",
  },
  {
    id: "137",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJV0804",
    findings: "Inspection of .380 ACP pistol EJV0804. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Continue enhanced security measures for .380 ACP firearms.",
  },
  {
    id: "138",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJV5351",
    findings:
      "Verification of .380 ACP pistol EJV5351. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Maintain current documentation practices for .380 ACP inventory.",
  },
  {
    id: "139",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJV9641",
    findings: "Inspection of .380 ACP pistol EJV9641. All storage and security requirements properly implemented.",
    status: "passed",
    recommendations: "Continue strict protocols for .380 ACP firearms.",
  },
  {
    id: "140",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJW9766",
    findings: "Detailed verification of .380 ACP pistol EJW9766. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for .380 ACP inventory.",
  },
  {
    id: "141",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJX4565",
    findings: "Inspection of .380 ACP pistol EJX4565. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Continue proper handling of .380 ACP firearms.",
  },
  {
    id: "142",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJX4933",
    findings: "Verification of .380 ACP pistol EJX4933. All regulatory compliance requirements properly met.",
    status: "passed",
    recommendations: "Continue comprehensive verification for .380 ACP inventory.",
  },
  {
    id: "143",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJX8629",
    findings: "Detailed verification of .380 ACP pistol EJX8629. Firearm secured according to safety protocols.",
    status: "passed",
    recommendations: "Continue current security standards for .380 ACP inventory.",
  },
  {
    id: "145",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJX8836",
    findings: "Inspection of .380 ACP pistol EJX8836. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Maintain current storage protocols for .380 ACP firearms.",
  },
  {
    id: "146",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJY0403",
    findings: "Verification of .380 ACP pistol EJY0403. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Continue enhanced security for .380 ACP firearms.",
  },
  {
    id: "147",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJY0792",
    findings:
      "Inspection of .380 ACP pistol EJY0792. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Maintain strict security protocols for .380 ACP inventory.",
  },
  {
    id: "148",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJY0801",
    findings: "Detailed verification of .380 ACP pistol EJY0801. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue current security measures for .380 ACP firearms.",
  },
  {
    id: "149",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJY0804",
    findings: "Inspection of .380 ACP pistol EJY0804. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Excellent management of .380 ACP pistol inventory.",
  },
  {
    id: "150",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJY0808",
    findings:
      "Verification of .380 ACP pistol EJY0808. Firearm secured with proper documentation and storage protocols.",
    status: "passed",
    recommendations: "Continue enhanced security measures for .380 ACP firearms.",
  },
  {
    id: "151",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".380 ACP Pistol - EJY0830",
    findings:
      "Final .380 ACP verification of pistol EJY0830. All .380 ACP pistols accounted for with complete documentation.",
    status: "passed",
    recommendations: "Excellent completion of .380 ACP pistol inventory verification.",
  },
  {
    id: "152",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".460 S&W MAG Revolver - EET9506",
    findings:
      "Inspection of .460 S&W MAG revolver EET9506. High-powered revolver properly secured with enhanced protocols.",
    status: "passed",
    recommendations: "Continue enhanced security measures for magnum caliber revolvers.",
  },
  {
    id: "153",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88102",
    findings:
      "Comprehensive inspection of 5.56X45MM rifle TV88102. Tactical rifle verified and secured with proper documentation.",
    status: "passed",
    recommendations: "Maintain strict security protocols for tactical rifles.",
  },
  {
    id: "154",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88265",
    findings:
      "Inspection of 5.56X45MM rifle TV88265. All tactical rifle requirements properly implemented and documented.",
    status: "passed",
    recommendations: "Continue enhanced security for tactical rifle inventory.",
  },
  {
    id: "155",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88270",
    findings: "Detailed verification of 5.56X45MM rifle TV88270. Firearm properly classified as S/L: RIFLE CAL.",
    status: "passed",
    recommendations: "Continue proper classification as S/L: RIFLE CAL or RIFLE/CARBINE.",
  },
  {
    id: "156",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88366",
    findings: "Inspection of 5.56X45MM rifle TV88366. Complete security protocols for tactical firearms verified.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for TV88 series.",
  },
  {
    id: "157",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88368",
    findings: "Verification of 5.56X45MM rifle TV88368. All storage and documentation requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue strict security measures for tactical rifles.",
  },
  {
    id: "158",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88373",
    findings: "Inspection of 5.56X45MM rifle TV88373. Tactical rifle properly secured according to regulations.",
    status: "passed",
    recommendations: "Excellent completion of TV88373 verification.",
  },
  {
    id: "159",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88383",
    findings: "Detailed verification of 5.56X45MM rifle TV88383. All regulatory requirements for tactical rifles met.",
    status: "passed",
    recommendations: "Continue enhanced security for TV88 series tactical rifles.",
  },
  {
    id: "160",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88387",
    findings: "Inspection of 5.56X45MM rifle TV88387. Complete documentation and proper storage protocols verified.",
    status: "passed",
    recommendations: "Maintain current security measures for tactical firearms.",
  },
  {
    id: "161",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88389",
    findings: "Verification of 5.56X45MM rifle TV88389. Firearm properly maintained with enhanced security measures.",
    status: "passed",
    recommendations: "Continue strict protocols for TV88 series.",
  },
  {
    id: "162",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88395",
    findings: "Inspection of 5.56X45MM rifle TV88395. All security measures for tactical rifles properly implemented.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for tactical rifle inventory.",
  },
  {
    id: "163",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88397",
    findings: "Detailed verification of 5.56X45MM rifle TV88397. Complete compliance with tactical rifle regulations.",
    status: "passed",
    recommendations: "Continue proper classification and storage for TV88 series.",
  },
  {
    id: "164",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88407",
    findings: "Inspection of 5.56X45MM rifle TV88407. Tactical rifle secured with proper documentation protocols.",
    status: "passed",
    recommendations: "Maintain strict security protocols for TV88407.",
  },
  {
    id: "165",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88408",
    findings: "Verification of 5.56X45MM rifle TV88408. All storage requirements for tactical rifles properly met.",
    status: "passed",
    recommendations: "Excellent management of TV88408 inventory.",
  },
  {
    id: "166",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88451",
    findings: "Inspection of 5.56X45MM rifle TV88451. Complete verification with enhanced security protocols.",
    status: "passed",
    recommendations: "Continue enhanced security measures for TV88451.",
  },
  {
    id: "167",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88469",
    findings: "Detailed verification of 5.56X45MM rifle TV88469. Firearm properly classified and secured.",
    status: "passed",
    recommendations: "Maintain current documentation practices for TV88469.",
  },
  {
    id: "168",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88470",
    findings: "Inspection of 5.56X45MM rifle TV88470. All regulatory requirements for tactical rifles satisfied.",
    status: "passed",
    recommendations: "Continue strict protocols for TV88470.",
  },
  {
    id: "169",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88476",
    findings: "Verification of 5.56X45MM rifle TV88476. Complete security protocols properly implemented.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for TV88476.",
  },
  {
    id: "170",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88479",
    findings: "Inspection of 5.56X45MM rifle TV88479. Tactical rifle secured with proper storage protocols.",
    status: "passed",
    recommendations: "Continue proper handling of TV88479.",
  },
  {
    id: "171",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88481",
    findings: "Detailed verification of 5.56X45MM rifle TV88481. All documentation properly maintained.",
    status: "passed",
    recommendations: "Continue comprehensive verification for TV88481.",
  },
  {
    id: "172",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TV88541",
    findings:
      "Final TV88 series verification of 5.56X45MM rifle TV88541. All tactical rifles properly secured and documented.",
    status: "passed",
    recommendations: "Excellent completion of TV88 series inventory.",
  },
  {
    id: "173",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84272",
    findings:
      "Inspection of 5.56X45MM rifle TW84272. Beginning of TW84 series with enhanced security for tactical rifles.",
    status: "passed",
    recommendations: "Continue enhanced security for TW84 series tactical rifles.",
  },
  {
    id: "174",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84275",
    findings:
      "Verification of 5.56X45MM rifle TW84275. All security measures for tactical rifles properly implemented.",
    status: "passed",
    recommendations: "Maintain current security measures for tactical firearms.",
  },
  {
    id: "175",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84276",
    findings: "Inspection of 5.56X45MM rifle TW84276. Complete documentation and proper storage protocols verified.",
    status: "passed",
    recommendations: "Continue strict protocols for TW84 series.",
  },
  {
    id: "176",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84313",
    findings: "Detailed verification of 5.56X45MM rifle TW84313. Tactical rifle secured according to regulations.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for TW84313.",
  },
  {
    id: "177",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84314",
    findings: "Inspection of 5.56X45MM rifle TW84314. All regulatory requirements for tactical rifles properly met.",
    status: "passed",
    recommendations: "Continue proper handling of TW84314.",
  },
  {
    id: "178",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84316",
    findings:
      "Verification of 5.56X45MM rifle TW84316. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Continue comprehensive verification for TW84316.",
  },
  {
    id: "179",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84317",
    findings: "Inspection of 5.56X45MM rifle TW84317. Firearm properly classified and stored with documentation.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for TW84317.",
  },
  {
    id: "180",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84318",
    findings: "Detailed verification of 5.56X45MM rifle TW84318. All storage requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue current security standards for TW84318.",
  },
  {
    id: "181",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84319",
    findings: "Inspection of 5.56X45MM rifle TW84319. Complete verification with enhanced security measures.",
    status: "passed",
    recommendations: "Maintain current storage protocols for TW84319.",
  },
  {
    id: "182",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84320",
    findings: "Verification of 5.56X45MM rifle TW84320. Tactical rifle secured with proper protocols.",
    status: "passed",
    recommendations: "Continue enhanced security for TW84320.",
  },
  {
    id: "183",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84321",
    findings: "Inspection of 5.56X45MM rifle TW84321. All security measures properly implemented and documented.",
    status: "passed",
    recommendations: "Maintain strict security protocols for TW84321.",
  },
  {
    id: "184",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84322",
    findings: "Detailed verification of 5.56X45MM rifle TW84322. Complete documentation with all protocols followed.",
    status: "passed",
    recommendations: "Continue current security measures for TW84322.",
  },
  {
    id: "185",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84329",
    findings: "Inspection of 5.56X45MM rifle TW84329. Firearm properly maintained with enhanced security protocols.",
    status: "passed",
    recommendations: "Excellent management of TW84329 inventory.",
  },
  {
    id: "186",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84388",
    findings: "Verification of 5.56X45MM rifle TW84388. All regulatory compliance requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue enhanced security measures for TW84388.",
  },
  {
    id: "187",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84389",
    findings: "Inspection of 5.56X45MM rifle TW84389. Complete verification with proper storage and documentation.",
    status: "passed",
    recommendations: "Maintain current documentation practices for TW84389.",
  },
  {
    id: "188",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84392",
    findings: "Detailed verification of 5.56X45MM rifle TW84392. Tactical rifle secured according to safety protocols.",
    status: "passed",
    recommendations: "Continue strict protocols for TW84392.",
  },
  {
    id: "189",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84393",
    findings: "Inspection of 5.56X45MM rifle TW84393. All security measures for tactical rifles properly implemented.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for TW84393.",
  },
  {
    id: "190",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84394",
    findings: "Verification of 5.56X45MM rifle TW84394. Complete documentation with enhanced security protocols.",
    status: "passed",
    recommendations: "Continue proper handling of TW84394.",
  },
  {
    id: "191",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84395",
    findings:
      "Inspection of 5.56X45MM rifle TW84395. Firearm properly classified and stored with proper documentation.",
    status: "passed",
    recommendations: "Continue comprehensive verification for TW84395.",
  },
  {
    id: "192",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84434",
    findings: "Detailed verification of 5.56X45MM rifle TW84434. All regulatory requirements properly satisfied.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for TW84434.",
  },
  {
    id: "193",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84463",
    findings: "Inspection of 5.56X45MM rifle TW84463. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Continue current security standards for TW84463.",
  },
  {
    id: "194",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - TW84478",
    findings:
      "Final TW84 series verification of 5.56X45MM rifle TW84478. All tactical rifles properly secured and documented.",
    status: "passed",
    recommendations: "Excellent management of TW84 tactical rifle inventory.",
  },
  {
    id: "195",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27495",
    findings:
      "Inspection of 5.56X45MM rifle UB27495. Beginning of UB27 series with strict protocols for tactical rifles.",
    status: "passed",
    recommendations: "Continue strict protocols for UB27 series tactical rifles.",
  },
  {
    id: "196",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27496",
    findings:
      "Verification of 5.56X45MM rifle UB27496. All security measures for tactical rifles properly implemented.",
    status: "passed",
    recommendations: "Maintain enhanced security protocols for UB27496.",
  },
  {
    id: "197",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27497",
    findings: "Inspection of 5.56X45MM rifle UB27497. Complete documentation and proper storage protocols verified.",
    status: "passed",
    recommendations: "Continue proper handling of UB27497.",
  },
  {
    id: "198",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27498",
    findings: "Detailed verification of 5.56X45MM rifle UB27498. Tactical rifle secured according to regulations.",
    status: "passed",
    recommendations: "Continue comprehensive verification for UB27498.",
  },
  {
    id: "199",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27499",
    findings: "Inspection of 5.56X45MM rifle UB27499. All regulatory requirements for tactical rifles properly met.",
    status: "passed",
    recommendations: "Maintain exemplary documentation for UB27499.",
  },
  {
    id: "200",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27500",
    findings:
      "Verification of 5.56X45MM rifle UB27500. Complete security protocols properly implemented and maintained.",
    status: "passed",
    recommendations: "Continue current security standards for UB27500.",
  },
  {
    id: "201",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27501",
    findings: "Inspection of 5.56X45MM rifle UB27501. Firearm properly classified and stored with documentation.",
    status: "passed",
    recommendations: "Maintain current storage protocols for UB27501.",
  },
  {
    id: "202",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27502",
    findings: "Detailed verification of 5.56X45MM rifle UB27502. All storage requirements properly satisfied.",
    status: "passed",
    recommendations: "Continue enhanced security for UB27502.",
  },
  {
    id: "203",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "5.56X45MM Rifle - UB27503",
    findings:
      "Final UB27 series verification of 5.56X45MM rifle UB27503. All tactical rifles properly secured and documented.",
    status: "passed",
    recommendations: "Maintain strict security protocols for UB27503. UB27 series complete.",
  },
  {
    id: "204",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".308 WIN Rifle - KN87634",
    findings:
      "Inspection of .308 WIN rifle KN87634. High-powered rifle properly secured with enhanced protocols for precision firearms.",
    status: "passed",
    recommendations: "Maintain enhanced security measures for .308 WIN rifles.",
  },
  {
    id: "205",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".308 WIN Rifle - KN87637",
    findings:
      "Verification of .308 WIN rifle KN87637. All security measures for high-powered rifles properly implemented.",
    status: "passed",
    recommendations: "Continue enhanced security protocols for high-powered rifles.",
  },
  {
    id: "206",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".308 WIN Rifle - KN91382",
    findings:
      "Inspection of .308 WIN rifle KN91382. Complete documentation and proper storage for precision rifles verified.",
    status: "passed",
    recommendations: "Maintain strict security protocols for .308 WIN inventory.",
  },
  {
    id: "207",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".308 WIN Rifle - KN91387",
    findings: "Detailed verification of .308 WIN rifle KN91387. High-powered rifle secured according to regulations.",
    status: "passed",
    recommendations: "Continue enhanced security measures for precision rifles.",
  },
  {
    id: "208",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".308 WIN Rifle - KN91390",
    findings: "Final .308 WIN rifle verification of KN91390. All high-powered rifles properly secured and documented.",
    status: "passed",
    recommendations: "Excellent completion of .308 WIN rifle inventory verification.",
  },
  {
    id: "209",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: ".350 LEGEND Revolver - EEJ6562",
    findings:
      "Verification of .350 LEGEND revolver EEJ6562. Specialty caliber revolver properly classified and secured.",
    status: "passed",
    recommendations: "Continue proper handling of specialty caliber firearms.",
  },
  {
    id: "210",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Storage Facility Inspection - Primary Vault",
    findings:
      "Comprehensive inspection of primary storage vault. All security measures, locks, and access controls functioning properly. Temperature and humidity controls within acceptable ranges.",
    status: "passed",
    recommendations: "Continue regular maintenance of vault security systems.",
  },
  {
    id: "211",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Storage Facility Inspection - Secondary Storage",
    findings:
      "Inspection of secondary storage areas. All firearms properly segregated by type and caliber. Security protocols fully implemented.",
    status: "passed",
    recommendations: "Maintain current segregation and security protocols.",
  },
  {
    id: "212",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Transportation Documentation Review",
    findings:
      "Review of all transportation documentation and procedures. All transport permits, routes, and security measures comply with regulations.",
    status: "passed",
    recommendations: "Continue current transportation compliance measures.",
  },
  {
    id: "213",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Personnel Security Clearance Verification",
    findings:
      "Verification of all personnel security clearances and access authorizations. All staff members have current and valid clearances.",
    status: "passed",
    recommendations: "Maintain regular updates of personnel security clearances.",
  },
  {
    id: "214",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Record Keeping System Audit",
    findings:
      "Comprehensive audit of record keeping systems and procedures. All documentation properly maintained and easily accessible for inspection.",
    status: "passed",
    recommendations: "Continue exemplary record keeping practices.",
  },
  {
    id: "215",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Compliance with Firearms Control Act - Section 76",
    findings:
      "Detailed review of compliance with Firearms Control Act, 2000 (Act No 60 of 2000) Section 76 requirements. All provisions fully met.",
    status: "passed",
    recommendations: "Continue full compliance with Section 76 requirements.",
  },
  {
    id: "216",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Compliance with Firearms Control Act - Section 77",
    findings:
      "Review of compliance with Firearms Control Act, 2000 (Act No 60 of 2000) Section 77 requirements. All regulatory obligations satisfied.",
    status: "passed",
    recommendations: "Maintain current compliance with Section 77 obligations.",
  },
  {
    id: "217",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Final Documentation Verification",
    findings:
      "Final comprehensive review of all permit documentation for PI10184610. All paperwork complete, accurate, and properly filed.",
    status: "passed",
    recommendations: "Continue exemplary documentation practices.",
  },
  {
    id: "218",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Final Security Assessment",
    findings:
      "Final assessment of all security measures and protocols. Physical security, access controls, and monitoring systems all functioning optimally.",
    status: "passed",
    recommendations: "Maintain current security standards and protocols.",
  },
  {
    id: "219",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Final Compliance Verification - Overall Assessment",
    findings:
      "Final comprehensive assessment of Nicholas Yale (PTY) LTD operations under permit PI10184610. Permit holder maintains excellent standards across all areas of compliance. All firearms properly accounted for, stored, and documented according to Firearms Control Act, 2000 (Act No 60 of 2000) requirements. Complete inventory verification successful with all serial numbers confirmed and cross-referenced.",
    status: "passed",
    recommendations:
      "Continue exemplary compliance with all firearms regulations. Nicholas Yale (PTY) LTD serves as a model for proper firearms handling, storage, security, and documentation. Maintain current storage, security, transportation, and documentation protocols. Recommend continued regular internal audits to maintain these high standards.",
  },
]

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  const [firearms, setFirearms] = useState<Firearm[]>(firearmsData)
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFirearms, setSelectedFirearms] = useState<string[]>([])
  const [selectedInspections, setSelectedInspections] = useState<string[]>([])
  const [editingFirearm, setEditingFirearm] = useState<Firearm | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [currentFirearmForSignature, setCurrentFirearmForSignature] = useState<Firearm | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize firearms data on component mount
  useEffect(() => {
    console.log(`🎉 Loaded ${firearmsData.length} firearms from hardcoded data`)
    setIsLoading(false)
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
    const firearmsStats = getFirearmsStats()

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
              {/* Success Alert */}

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

      {/* Edit Firearm Dialog */}
      {isEditDialogOpen && editingFirearm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
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
