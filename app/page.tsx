"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { validateCredentials, getUserPermissions } from "@/lib/auth"

interface Firearm {
  id: string
  stockNo: string
  make: string
  model: string
  type: string
  caliber: string
  serialNo: string
  status: "in-stock" | "dealer-stock" | "safe-keeping" | "collected"
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

const initialFirearms: Firearm[] = [
  {
    id: "1",
    stockNo: "GW001",
    make: "Glock",
    model: "17",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "ABC1234",
    status: "in-stock",
  },
  {
    id: "2",
    stockNo: "GW002",
    make: "Smith & Wesson",
    model: "M&P Shield",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "DEF5678",
    status: "dealer-stock",
  },
  {
    id: "3",
    stockNo: "GW003",
    make: "Sig Sauer",
    model: "P320",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "GHI9012",
    status: "safe-keeping",
  },
  {
    id: "4",
    stockNo: "GW004",
    make: "Colt",
    model: "AR-15",
    type: "Rifle",
    caliber: "5.56mm",
    serialNo: "JKL3456",
    status: "in-stock",
  },
  {
    id: "5",
    stockNo: "GW005",
    make: "Remington",
    model: "870",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "MNO7890",
    status: "dealer-stock",
  },
  {
    id: "6",
    stockNo: "GW006",
    make: "Springfield",
    model: "XD-S",
    type: "Pistol",
    caliber: ".45 ACP",
    serialNo: "PQR1234",
    status: "safe-keeping",
  },
  {
    id: "7",
    stockNo: "GW007",
    make: "Ruger",
    model: "10/22",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "STU5678",
    status: "in-stock",
  },
  {
    id: "8",
    stockNo: "GW008",
    make: "Mossberg",
    model: "500",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "VWX9012",
    status: "dealer-stock",
  },
  {
    id: "9",
    stockNo: "GW009",
    make: "CZ",
    model: "75",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "YZA3456",
    status: "safe-keeping",
  },
  {
    id: "10",
    stockNo: "GW010",
    make: "Daniel Defense",
    model: "M4A1",
    type: "Rifle",
    caliber: "5.56mm",
    serialNo: "BCD7890",
    status: "in-stock",
  },
]

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
    type: "Smith & Wesson .357 MAG Rifle LLH8085 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .357 MAG rifle, serial number LLH8085. Firearm condition verified, all serial numbers match documentation. Proper storage confirmed.",
    status: "passed",
    recommendations: "Continue current storage and handling procedures.",
  },
  {
    id: "4",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Revolver EER8189 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 SHORT/LONG/LR revolver, serial number EER8189. All components verified, cylinder function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "5",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Revolver EET5011 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 SHORT/LONG/LR revolver, serial number EET5011. Trigger mechanism and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "6",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Revolver EET5019 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 SHORT/LONG/LR revolver, serial number EET5019. All components verified, cylinder function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "7",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Revolver EET7761 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 SHORT/LONG/LR revolver, serial number EET7761. Trigger mechanism and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "8",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Revolver EET7765 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 SHORT/LONG/LR revolver, serial number EET7765. All components verified, cylinder function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "9",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Revolver EET7780 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 SHORT/LONG/LR revolver, serial number EET7780. Trigger mechanism and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "10",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .357 MAG Revolver EEK3159 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .357 MAG revolver, serial number EEK3159. All components verified, cylinder function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "11",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .357 MAG Revolver EER8271 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .357 MAG revolver, serial number EER8271. Trigger mechanism and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "12",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .38 Special Revolver EDZ1215 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .38 Special revolver, serial number EDZ1215. All components verified, cylinder function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "13",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .38 Special Revolver EEF2376 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .38 Special revolver, serial number EEF2376. Trigger mechanism and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "14",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .38 Special Revolver EEV1568 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .38 Special revolver, serial number EEV1568. All components verified, cylinder function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "15",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR/.22 MAG Revolver EEN2165 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LR/.22 MAG (WMR) revolver, serial number EEN2165. Dual caliber capability verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "16",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR/.22 MAG Revolver EEU0808 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LR/.22 MAG (WMR) revolver, serial number EEU0808. Dual caliber capability verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "17",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Pistol UES6239 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG/LR pistol, serial number UES6239. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "18",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .45 ACP Pistol UFH0813 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .45 ACP pistol, serial number UFH0813. Semi-automatic function and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "19",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .45 ACP Pistol UFH1723 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .45 ACP pistol, serial number UFH1723. All components verified, trigger mechanism tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "20",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .45 ACP Pistol UFH1897 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .45 ACP pistol, serial number UFH1897. Semi-automatic function and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "21",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .45 ACP Pistol UFJ2201 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .45 ACP pistol, serial number UFJ2201. All components verified, trigger mechanism tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "22",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .45 ACP Pistol UFJ2219 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .45 ACP pistol, serial number UFJ2219. Semi-automatic function and safety features tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "23",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJP3525 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJP3525. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "24",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR2127 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR2127. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "25",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR2139 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR2139. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "26",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR2297 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR2297. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "27",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR2373 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR2373. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "28",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR2375 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR2375. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "29",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR2765 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR2765. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "30",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR2825 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR2825. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "31",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJR3512 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJR3512. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "32",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJS3074 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJS3074. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "33",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW1464 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW1464. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "34",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW1497 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW1497. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "35",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW1525 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW1525. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "36",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW1533 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW1533. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "37",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW4154 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW4154. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "38",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW4161 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW4161. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "39",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW4385 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW4385. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "40",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW5327 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW5327. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "41",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW5636 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW5636. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "42",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW5639 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW5639. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "43",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW7647 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW7647. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "44",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW7659 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW7659. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "45",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW7711 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW7711. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "46",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW8129 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW8129. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "47",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW8163 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW8163. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "48",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJW9944 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJW9944. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "49",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX8064 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX8064. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "50",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX8079 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX8079. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "51",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX8104 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX8104. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "52",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX8172 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX8172. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "53",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX9285 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX9285. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "54",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX9351 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX9351. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "55",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX9352 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX9352. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "56",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX9365 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX9365. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "57",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX9383 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX9383. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "58",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJX9402 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJX9402. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "59",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1880 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1880. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "60",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1888 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1888. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "61",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1917 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1917. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "62",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1927 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1927. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "63",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1936 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1936. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "64",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1945 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1945. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "65",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1955 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1955. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "66",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1965 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1965. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "67",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1971 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1971. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "68",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1973 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1973. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "69",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1974 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1974. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "70",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1979 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1979. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "71",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1980 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1980. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "72",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1985 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1985. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "73",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY1992 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY1992. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "74",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY2008 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY2008. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "75",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY2020 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY2020. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "76",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY9612 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY9612. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "77",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY9617 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY9617. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "78",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY9622 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY9622. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "79",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY9635 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY9635. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "80",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY9639 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY9639. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "81",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY9643 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY9643. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "82",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJY9667 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJY9667. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "83",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0369 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0369. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "84",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0372 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0372. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "85",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0376 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0376. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "86",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0393 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0393. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "87",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0395 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0395. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "88",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0398 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0398. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "89",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0403 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0403. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "90",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0406 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0406. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "91",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0770 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0770. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "92",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0775 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0775. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "93",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0788 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0788. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "94",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ0833 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ0833. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "95",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1461 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1461. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "96",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1470 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1470. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "97",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1482 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1482. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "98",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1495 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1495. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "99",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1498 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1498. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "100",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1501 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1501. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "101",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1505 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1505. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "102",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1519 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1519. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "103",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1523 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1523. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "104",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1525 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1525. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "105",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1565 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1565. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "106",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1575 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1575. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "107",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ1829 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ1829. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "108",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3194 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3194. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "109",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3222 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3222. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "110",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3229 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3229. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "111",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3231 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3231. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "112",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3232 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3232. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "113",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3233 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3233. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "114",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3236 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3236. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "115",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3238 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3238. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "116",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3241 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3241. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "117",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3246 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3246. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "118",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3247 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3247. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "119",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3251 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3251. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "120",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3260 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3260. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "121",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol EJZ3266 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number EJZ3266. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "122",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJB6240 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJB6240. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "123",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1728 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1728. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "124",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1935 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1935. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "125",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1952 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1952. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "126",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1953 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1953. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "127",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1956 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1956. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "128",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1959 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1959. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "129",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1960 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1960. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "130",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE1961 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE1961. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "131",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE5643 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE5643. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "132",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE5649 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE5649. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "133",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE5654 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE5654. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "134",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE5657 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE5657. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "135",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE5664 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE5664. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "136",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJE7476 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJE7476. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "137",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF0482 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF0482. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "138",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF0486 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF0486. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "139",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF2100 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF2100. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "140",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF2101 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF2101. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "141",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF2130 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF2130. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "142",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF7248 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF7248. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "143",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF8216 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF8216. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "144",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF9078 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF9078. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "145",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF9081 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF9081. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "146",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF9082 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF9082. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "147",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJF9412 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJF9412. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "148",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJH1531 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJH1531. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "149",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJH1532 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJH1532. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "150",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJH3107 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJH3107. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "151",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJH3121 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJH3121. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "152",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJH3550 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJH3550. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "153",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL1046 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL1046. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "154",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL1051 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL1051. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "155",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL1055 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL1055. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "156",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL1057 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL1057. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "157",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL1172 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL1172. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "158",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL4180 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL4180. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "159",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL6916 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL6916. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "160",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL9077 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL9077. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "161",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol FJL9458 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number FJL9458. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "162",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol JJD2411 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number JJD2411. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "163",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SBR0594 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SBR0594. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "164",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SBR1398 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SBR1398. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "165",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SBR1459 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SBR1459. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "166",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SCN2435 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SCN2435. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "167",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SCN2482 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SCN2482. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "168",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SCN2551 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SCN2551. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "169",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SCN2570 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SCN2570. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "170",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SCX0957 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SCX0957. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "171",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED7816 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED7816. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "172",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8018 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8018. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "173",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8025 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8025. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "174",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8030 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8030. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "175",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8037 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8037. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "176",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8135 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8135. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "177",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8136 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8136. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "178",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8137 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8137. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "179",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8148 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8148. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "180",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8149 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8149. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "181",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8151 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8151. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "182",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8154 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8154. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "183",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8189 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8189. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "184",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8195 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8195. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "185",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 9MM PAR Pistol SED8196 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 9MM PAR (9X19MM) pistol, serial number SED8196. Semi-automatic function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule and secure storage.",
  },
  {
    id: "186",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .44 MAG Revolver EEH7626 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .44 MAG (.44 REM MAG) revolver, serial number EEH7626. High-caliber revolver function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "187",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX0894 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FHX0894. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "188",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX2059 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle/carbine, serial number FHX2059. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "189",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX2089 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FHX2089. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "190",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX2105 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle/carbine, serial number FHX2105. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "191",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX2130 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FHX2130. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "192",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX2143 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle/carbine, serial number FHX2143. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "193",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX2509 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FHX2509. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "194",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX4723 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle/carbine, serial number FHX4723. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "195",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX4747 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FHX4747. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "196",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FHX4758 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle/carbine, serial number FHX4758. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "197",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH7361 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH7361. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "198",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH7747 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle/carbine, serial number FJH7747. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "199",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH7757 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH7757. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "200",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8293 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle/carbine, serial number FJH8293. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "201",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .380 ACP Pistol EJY0833 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .380 ACP pistol, serial number EJY0833. Compact pistol function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for compact firearms.",
  },
  {
    id: "202",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .380 ACP Pistol EJY0834 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .380 ACP pistol, serial number EJY0834. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "203",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .380 ACP Pistol EJY0835 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .380 ACP pistol, serial number EJY0835. Compact pistol function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for compact firearms.",
  },
  {
    id: "204",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .380 ACP Pistol EJY0836 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .380 ACP pistol, serial number EJY0836. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "205",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .380 ACP Pistol EJY0837 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .380 ACP pistol, serial number EJY0837. Compact pistol function tested.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for compact firearms.",
  },
  {
    id: "206",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .500 S&W MAGNUM Revolver EER5141 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .500 S&W MAGNUM revolver, serial number EER5141. High-power revolver function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "207",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .500 S&W MAGNUM Revolver EES1464 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .500 S&W MAGNUM revolver, serial number EES1464. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "208",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .500 S&W MAGNUM Revolver EES6081 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .500 S&W MAGNUM revolver, serial number EES6081. High-power revolver function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "209",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .500 S&W MAGNUM Revolver EES7603 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .500 S&W MAGNUM revolver, serial number EES7603. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "210",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .500 S&W MAGNUM Revolver EET7683 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .500 S&W MAGNUM revolver, serial number EET7683. High-power revolver function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "211",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .500 S&W MAGNUM Revolver EEU5933 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .500 S&W MAGNUM revolver, serial number EEU5933. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "212",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .460 S&W MAG Revolver EET9506 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .460 S&W MAG revolver, serial number EET9506. High-caliber revolver function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for high-caliber firearms.",
  },
  {
    id: "213",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 5.56X45MM Rifle TV88102 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 5.56X45MM tactical rifle, serial number TV88102. Military-grade rifle function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "214",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 5.56X45MM Rifle TV88265 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 5.56X45MM tactical rifle/carbine, serial number TV88265. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "215",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 5.56X45MM Rifle TV88270 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 5.56X45MM tactical rifle, serial number TV88270. Military-grade rifle function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "216",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 5.56X45MM Rifle TV88366 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 5.56X45MM tactical rifle/carbine, serial number TV88366. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "217",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 5.56X45MM Rifle TV88368 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 5.56X45MM tactical rifle, serial number TV88368. Military-grade rifle function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "218",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson 5.56X45MM Rifle TV88373 Inspection",
    findings:
      "Individual inspection of Smith & Wesson 5.56X45MM tactical rifle/carbine, serial number TV88373. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "219",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .308 WIN Rifle KN87634 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .308 WIN precision rifle/carbine, serial number KN87634. Long-range rifle function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for precision firearms.",
  },
  {
    id: "220",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .308 WIN Rifle KN87637 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .308 WIN precision rifle, serial number KN87637. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for precision firearms.",
  },
  {
    id: "221",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .308 WIN Rifle KN91382 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .308 WIN precision rifle/carbine, serial number KN91382. Long-range rifle function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for precision firearms.",
  },
  {
    id: "222",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .308 WIN Rifle KN91387 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .308 WIN precision rifle, serial number KN91387. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for precision firearms.",
  },
  {
    id: "223",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .350 LEGEND Rifle KN91390 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .350 LEGEND rifle/carbine, serial number KN91390. Hunting rifle function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for hunting firearms.",
  },
  {
    id: "224",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson Revolver EEJ6562 Inspection",
    findings:
      "Individual inspection of Smith & Wesson revolver, serial number EEJ6562. All components verified and function tested.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "225",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series FJH",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers FJH8344 through FJH9082. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "226",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series FJJ",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers FJJ8623 through FJJ9833. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "227",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series FJK",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers FJK2420 through FJK7362. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "228",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series FJL",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers FJL5426 through FJL6558. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "229",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series FJN-FJP",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers FJN1414 through FJP1827. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "230",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series FJR",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers FJR1013 through FJR1107. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "231",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series FJT",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers FJT0652 through FJT1980. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "232",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .22 LR Training Rifles Series LBJ",
    findings:
      "Batch inspection of Smith & Wesson .22 LR training rifles, serial numbers LBJ3694 through LBJ5426. All rifles verified for training use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "233",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .380 ACP Compact Pistols Series EJY",
    findings:
      "Batch inspection of Smith & Wesson .380 ACP compact pistols, serial numbers EJY0838 through EJY9510. All pistols verified for concealed carry use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for compact firearms.",
  },
  {
    id: "234",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - .380 ACP Compact Pistols Series EJZ-EKA",
    findings:
      "Batch inspection of Smith & Wesson .380 ACP compact pistols, serial numbers EJZ0042 through EKA9426. All pistols verified for concealed carry use.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for compact firearms.",
  },
  {
    id: "235",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - 5.56X45MM Tactical Rifles Series TV-TW",
    findings:
      "Batch inspection of Smith & Wesson 5.56X45MM tactical rifles, serial numbers TV88383 through TW84701. All rifles verified for tactical use.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "236",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Batch Inspection - 5.56X45MM Tactical Rifles Series UB",
    findings:
      "Batch inspection of Smith & Wesson 5.56X45MM tactical rifles, serial numbers UB25078 through UB27503. All rifles verified for tactical use.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations for tactical firearms.",
  },
  {
    id: "237",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Final Comprehensive Compliance Review",
    findings:
      "Final comprehensive review of all Smith & Wesson firearms from import permit PI10184610. Total of 500+ firearms across all calibers verified for compliance with South African Firearms Control Act requirements. All documentation complete and firearms properly secured.",
    status: "passed",
    recommendations:
      "Maintain current security protocols and continue regular inventory audits. All firearms properly documented and secured according to South African firearms regulations.",
  },
  {
    id: "238",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8344 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8344. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "239",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8356 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8356. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "240",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8367 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8367. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "241",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8378 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8378. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "242",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8389 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8389. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "243",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8401 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8401. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "244",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8412 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8412. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "245",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8423 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8423. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "246",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8434 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8434. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "247",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8445 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8445. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "248",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8456 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8456. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "249",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8467 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8467. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "250",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8478 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8478. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "251",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8489 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8489. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "252",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8501 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8501. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "253",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8512 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8512. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "254",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8523 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8523. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "255",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8534 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8534. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "256",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8545 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8545. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "257",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8556 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8556. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "258",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8567 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8567. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "259",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8578 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8578. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "260",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8589 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8589. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "261",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8601 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8601. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "262",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8612 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8612. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "263",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8623 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8623. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "264",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8634 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8634. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "265",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8645 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8645. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "266",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8656 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8656. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "267",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8667 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8667. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "268",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8678 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8678. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "269",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8689 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8689. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "270",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8701 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8701. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "271",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8712 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8712. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "272",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8723 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8723. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "273",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8734 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8734. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "274",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8745 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8745. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "275",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8756 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8756. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "276",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8767 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8767. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "277",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8778 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8778. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "278",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8789 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8789. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "279",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8801 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8801. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "280",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8812 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8812. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "281",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8823 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8823. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "282",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8834 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8834. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "283",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8845 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8845. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "284",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8856 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8856. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "285",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8867 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8867. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "286",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8878 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8878. Training rifle function verified.",
    status: "passed",
    recommendations: "Maintain regular cleaning schedule for training rifles.",
  },
  {
    id: "287",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8889 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8889. All components verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "288",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJH8901 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJH8901. Training rifle function verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
  {
    id: "419",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Smith & Wesson .22 LR Rifle FJJ8901 Inspection",
    findings:
      "Individual inspection of Smith & Wesson .22 LONG RIFLE (LR) rifle, serial number FJJ8901. Training rifle function verified.",
    status: "passed",
    recommendations: "Continue compliance with storage regulations.",
  },
]

export default function GunworxPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState<any>({})

  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFirearms, setSelectedFirearms] = useState<string[]>([])
  const [editingFirearm, setEditingFirearm] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleLogin = (username: string) => {
    const user = validateCredentials(username, "")
    if (user) {
      setCurrentUser(username)
      setUserPermissions(getUserPermissions(user.role))
      setIsAuthenticated(true)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setUserPermissions({})
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const filteredFirearms = initialFirearms.filter((firearm) => {
    const matchesSearch =
      firearm.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firearm.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      firearm.serialNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || firearm.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredInspections = initialInspections.filter(
    (inspection) =>
      inspection.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gunworx Portal</h1>
              <p className="text-gray-600">Complete Firearm Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {["dashboard", "firearms", "inspections"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900">Total Firearms</h3>
                  <p className="text-3xl font-bold text-blue-600">{initialFirearms.length}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900">Inspections</h3>
                  <p className="text-3xl font-bold text-green-600">{initialInspections.length}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900">Pending Actions</h3>
                  <p className="text-3xl font-bold text-yellow-600">0</p>
                </div>
              </div>
            )}

            {activeTab === "firearms" && (
              <div>
                <div className="mb-4 flex gap-4">
                  <input
                    type="text"
                    placeholder="Search firearms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="dealer-stock">Dealer Stock</option>
                    <option value="safe-keeping">Safe Keeping</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFirearms.map((firearm) => (
                        <tr key={firearm.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{firearm.make}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{firearm.model}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{firearm.serialNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                firearm.status === "in-stock"
                                  ? "bg-green-100 text-green-800"
                                  : firearm.status === "dealer-stock"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {firearm.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "inspections" && (
              <div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search inspections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInspections.map((inspection) => (
                        <tr key={inspection.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspection.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspection.inspector}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{inspection.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                inspection.status === "passed"
                                  ? "bg-green-100 text-green-800"
                                  : inspection.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {inspection.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
