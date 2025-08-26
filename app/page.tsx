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
    type: "Permanent Import Permit Inspection",
    findings:
      "Inspection of Nicholas Yale (PTY) LTD import permit PI10184610. All firearms properly documented and accounted for.",
    status: "passed",
    recommendations: "Continue compliance with Firearms Control Act requirements.",
  },
  // 2025-06-03 Inspections - First 37 (corrected)
  {
    id: "2",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Storage Facility Inspection",
    findings:
      "Inspection of main storage facility vault security systems. All electronic locks functioning properly, temperature and humidity controls within specifications.",
    status: "passed",
    recommendations: "Schedule quarterly security system maintenance.",
  },
  {
    id: "3",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Documentation Compliance Review",
    findings:
      "Review of all permit documentation for PI10184610. All required forms completed and filed correctly according to Firearms Control Act requirements.",
    status: "passed",
    recommendations: "Continue current documentation procedures.",
  },
  {
    id: "4",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Staff Training Assessment",
    findings:
      "Assessment of staff knowledge regarding proper firearm handling procedures. All personnel demonstrated competency in safety protocols.",
    status: "passed",
    recommendations: "Schedule refresher training in 6 months.",
  },
  {
    id: "5",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Inventory Reconciliation",
    findings:
      "Complete inventory count of all firearms in facility. Physical count matches database records with 100% accuracy.",
    status: "passed",
    recommendations: "Continue monthly inventory reconciliation procedures.",
  },
  {
    id: "6",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Security Protocol Review",
    findings:
      "Review of access control procedures and visitor management systems. All protocols being followed correctly.",
    status: "passed",
    recommendations: "Update visitor log format for better tracking.",
  },
  {
    id: "7",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Environmental Controls Check",
    findings:
      "Inspection of climate control systems in storage areas. Temperature maintained at 68-72°F, humidity at 45-50% RH.",
    status: "passed",
    recommendations: "Replace air filtration system in 3 months.",
  },
  {
    id: "8",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Fire Safety Inspection",
    findings:
      "Inspection of fire suppression systems and emergency exits. All systems operational, exits clearly marked and unobstructed.",
    status: "passed",
    recommendations: "Schedule annual fire suppression system service.",
  },
  {
    id: "9",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Record Keeping Audit",
    findings:
      "Audit of all transaction records and movement logs. All entries properly documented with required signatures and dates.",
    status: "passed",
    recommendations: "Implement digital backup system for paper records.",
  },
  {
    id: "10",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Permit Compliance Verification",
    findings:
      "Verification that all activities comply with permit PI10184610 conditions. All requirements being met satisfactorily.",
    status: "passed",
    recommendations: "Continue current compliance monitoring procedures.",
  },
  {
    id: "11",
    date: "2025-06-03",
    inspector: "A White",
    type: "Transportation Security Review",
    findings:
      "Review of procedures for secure transportation of firearms. All vehicles properly equipped with security systems.",
    status: "passed",
    recommendations: "Update GPS tracking system software.",
  },
  {
    id: "12",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Personnel Background Check Review",
    findings:
      "Review of all staff background checks and security clearances. All personnel maintain current valid clearances.",
    status: "passed",
    recommendations: "Schedule renewal of clearances expiring in next 6 months.",
  },
  {
    id: "13",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Quality Control Inspection",
    findings:
      "Inspection of quality control procedures for incoming firearms. All inspection protocols being followed correctly.",
    status: "passed",
    recommendations: "Standardize inspection checklist format.",
  },
  {
    id: "14",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Customer Service Review",
    findings:
      "Review of customer interaction procedures and complaint handling. All customer inquiries handled professionally and promptly.",
    status: "passed",
    recommendations: "Implement customer satisfaction survey system.",
  },
  {
    id: "15",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Technology Systems Audit",
    findings:
      "Audit of all computer systems and software used for firearm tracking. All systems functioning properly with current backups.",
    status: "passed",
    recommendations: "Schedule system upgrade in next quarter.",
  },
  {
    id: "16",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Legal Compliance Review",
    findings:
      "Review of compliance with all applicable firearms laws and regulations. All legal requirements being met.",
    status: "passed",
    recommendations: "Monitor for upcoming regulatory changes.",
  },
  {
    id: "17",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Emergency Procedures Drill",
    findings:
      "Conducted emergency response drill for security breach scenario. All staff responded appropriately within required timeframes.",
    status: "passed",
    recommendations: "Schedule quarterly emergency drills.",
  },
  {
    id: "18",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Maintenance Schedule Review",
    findings:
      "Review of preventive maintenance schedules for all equipment. All maintenance tasks completed on schedule.",
    status: "passed",
    recommendations: "Extend maintenance intervals for newer equipment.",
  },
  {
    id: "19",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Vendor Management Audit",
    findings:
      "Audit of all vendor relationships and service contracts. All vendors maintain required certifications and insurance.",
    status: "passed",
    recommendations: "Renegotiate service contracts due for renewal.",
  },
  {
    id: "20",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Financial Controls Review",
    findings:
      "Review of financial controls and cash handling procedures. All transactions properly documented and reconciled.",
    status: "passed",
    recommendations: "Implement additional segregation of duties.",
  },
  {
    id: "21",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Insurance Coverage Verification",
    findings:
      "Verification of all insurance policies and coverage limits. All policies current with adequate coverage levels.",
    status: "passed",
    recommendations: "Review coverage limits annually for adequacy.",
  },
  {
    id: "22",
    date: "2025-06-03",
    inspector: "A White",
    type: "Communication Systems Test",
    findings:
      "Test of all communication systems including radios and emergency phones. All systems operational with clear reception.",
    status: "passed",
    recommendations: "Replace backup batteries in emergency phones.",
  },
  {
    id: "23",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Waste Management Review",
    findings:
      "Review of procedures for disposal of packaging materials and waste. All disposal methods comply with environmental regulations.",
    status: "passed",
    recommendations: "Increase recycling program participation.",
  },
  {
    id: "24",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Access Control Audit",
    findings: "Audit of all access control systems and key management. All access properly controlled and documented.",
    status: "passed",
    recommendations: "Upgrade to biometric access control system.",
  },
  {
    id: "25",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Shipping and Receiving Review",
    findings:
      "Review of all shipping and receiving procedures. All packages properly inspected and documented upon arrival.",
    status: "passed",
    recommendations: "Install additional security cameras in loading dock area.",
  },
  {
    id: "26",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Data Security Assessment",
    findings:
      "Assessment of data security measures and backup procedures. All sensitive data properly encrypted and backed up.",
    status: "passed",
    recommendations: "Implement additional cybersecurity training for staff.",
  },
  {
    id: "27",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Regulatory Reporting Review",
    findings:
      "Review of all required regulatory reports and submissions. All reports submitted on time with accurate information.",
    status: "passed",
    recommendations: "Automate report generation where possible.",
  },
  {
    id: "28",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Customer Privacy Audit",
    findings:
      "Audit of customer privacy protection measures and data handling. All customer information properly protected.",
    status: "passed",
    recommendations: "Update privacy policy to reflect current practices.",
  },
  {
    id: "29",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Equipment Calibration Check",
    findings:
      "Check of all measuring and testing equipment calibration status. All equipment within calibration specifications.",
    status: "passed",
    recommendations: "Schedule recalibration for equipment due in next 3 months.",
  },
  {
    id: "30",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Workplace Safety Inspection",
    findings:
      "Inspection of workplace safety conditions and hazard identification. All safety equipment in place and functional.",
    status: "passed",
    recommendations: "Update safety training materials with latest best practices.",
  },
  {
    id: "31",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Contract Compliance Review",
    findings:
      "Review of compliance with all contractual obligations and service agreements. All contract terms being met.",
    status: "passed",
    recommendations: "Prepare for upcoming contract renewals.",
  },
  {
    id: "32",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Performance Metrics Analysis",
    findings:
      "Analysis of key performance indicators and operational metrics. All metrics meeting or exceeding targets.",
    status: "passed",
    recommendations: "Establish additional metrics for customer satisfaction.",
  },
  {
    id: "33",
    date: "2025-06-03",
    inspector: "A White",
    type: "Supply Chain Security Review",
    findings:
      "Review of supply chain security measures and vendor vetting procedures. All suppliers properly vetted and monitored.",
    status: "passed",
    recommendations: "Implement additional supplier audit procedures.",
  },
  {
    id: "34",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Business Continuity Planning",
    findings:
      "Review of business continuity plans and disaster recovery procedures. All plans current and tested within last year.",
    status: "passed",
    recommendations: "Schedule annual business continuity drill.",
  },
  {
    id: "35",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Operational Efficiency Review",
    findings:
      "Review of operational procedures for efficiency and effectiveness. All processes operating smoothly with minimal delays.",
    status: "passed",
    recommendations: "Implement process automation where beneficial.",
  },
  {
    id: "36",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Customer Communication Review",
    findings:
      "Review of customer communication procedures and response times. All customer inquiries handled within established timeframes.",
    status: "passed",
    recommendations: "Implement automated acknowledgment system for inquiries.",
  },
  {
    id: "37",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Comprehensive Facility Assessment",
    findings:
      "Complete assessment of all facility operations, security, and compliance measures. All areas operating at satisfactory levels.",
    status: "passed",
    recommendations: "Continue current operational standards and schedule next comprehensive review in 6 months.",
  },
  // Additional 100 inspections for 2025-06-03
  {
    id: "38",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Ammunition Storage Inspection",
    findings:
      "Inspection of ammunition storage areas and segregation procedures. All ammunition properly stored by caliber and type.",
    status: "passed",
    recommendations: "Install additional humidity monitoring in ammunition storage areas.",
  },
  {
    id: "39",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Cleaning Equipment Audit",
    findings:
      "Audit of all firearm cleaning equipment and supplies. All cleaning materials properly stored and inventoried.",
    status: "passed",
    recommendations: "Reorder cleaning solvents and establish automatic reorder points.",
  },
  {
    id: "40",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Display Case Security Check",
    findings: "Security check of all display cases and locks. All display cases secure with functioning alarm systems.",
    status: "passed",
    recommendations: "Upgrade display case lighting to LED for better visibility.",
  },
  {
    id: "41",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Parking Lot Security Review",
    findings:
      "Review of parking lot security measures and lighting. All areas well-lit with functioning security cameras.",
    status: "passed",
    recommendations: "Add motion-activated lighting in darker corners.",
  },
  {
    id: "42",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Reception Area Assessment",
    findings: "Assessment of reception area security and customer flow. All security measures functioning properly.",
    status: "passed",
    recommendations: "Install additional seating for customer comfort.",
  },
  {
    id: "43",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Office Equipment Inspection",
    findings:
      "Inspection of all office equipment and computer systems. All equipment functioning properly with current software.",
    status: "passed",
    recommendations: "Schedule software updates for next maintenance window.",
  },
  {
    id: "44",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Restroom Facilities Check",
    findings:
      "Check of restroom facilities for cleanliness and functionality. All facilities clean and well-maintained.",
    status: "passed",
    recommendations: "Install automatic soap dispensers for improved hygiene.",
  },
  {
    id: "45",
    date: "2025-06-03",
    inspector: "A White",
    type: "Break Room Inspection",
    findings: "Inspection of employee break room facilities and equipment. All appliances functioning and area clean.",
    status: "passed",
    recommendations: "Replace microwave with newer energy-efficient model.",
  },
  {
    id: "46",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Electrical Systems Check",
    findings:
      "Check of all electrical systems and emergency power backup. All systems operating within specifications.",
    status: "passed",
    recommendations: "Test backup generator under full load conditions.",
  },
  {
    id: "47",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Plumbing Systems Inspection",
    findings:
      "Inspection of all plumbing systems and water pressure. All systems functioning properly with no leaks detected.",
    status: "passed",
    recommendations: "Schedule annual water quality testing.",
  },
  {
    id: "48",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "HVAC System Performance",
    findings:
      "Performance check of heating, ventilation, and air conditioning systems. All systems maintaining proper temperature and airflow.",
    status: "passed",
    recommendations: "Replace HVAC filters and schedule duct cleaning.",
  },
  {
    id: "49",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Exterior Building Inspection",
    findings:
      "Inspection of exterior building condition including roof, walls, and windows. All structures in good condition.",
    status: "passed",
    recommendations: "Schedule roof inspection after next major storm.",
  },
  {
    id: "50",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Landscaping and Grounds",
    findings: "Review of landscaping and grounds maintenance. All areas well-maintained with proper drainage.",
    status: "passed",
    recommendations: "Trim bushes near security cameras for better visibility.",
  },
  {
    id: "51",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Signage Compliance Check",
    findings: "Check of all required signage for compliance with regulations. All signs properly posted and visible.",
    status: "passed",
    recommendations: "Replace faded warning signs with new reflective versions.",
  },
  {
    id: "52",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "First Aid Equipment Audit",
    findings:
      "Audit of all first aid equipment and emergency medical supplies. All supplies current and properly stocked.",
    status: "passed",
    recommendations: "Add automated external defibrillator to emergency equipment.",
  },
  {
    id: "53",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Tool and Equipment Inventory",
    findings:
      "Inventory of all tools and maintenance equipment. All tools accounted for and in good working condition.",
    status: "passed",
    recommendations: "Implement tool checkout system for better tracking.",
  },
  {
    id: "54",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Chemical Storage Review",
    findings:
      "Review of chemical storage procedures and safety data sheets. All chemicals properly labeled and stored.",
    status: "passed",
    recommendations: "Update safety data sheet binder with latest versions.",
  },
  {
    id: "55",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Personal Protective Equipment",
    findings:
      "Inspection of personal protective equipment availability and condition. All PPE properly maintained and available.",
    status: "passed",
    recommendations: "Order additional safety glasses for visitor use.",
  },
  {
    id: "56",
    date: "2025-06-03",
    inspector: "A White",
    type: "Vehicle Fleet Inspection",
    findings:
      "Inspection of all company vehicles and maintenance records. All vehicles properly maintained with current registrations.",
    status: "passed",
    recommendations: "Schedule oil changes for vehicles due for service.",
  },
  {
    id: "57",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Loading Dock Safety",
    findings: "Safety inspection of loading dock area and equipment. All safety equipment in place and functioning.",
    status: "passed",
    recommendations: "Install additional safety barriers around dock area.",
  },
  {
    id: "58",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Warehouse Organization",
    findings: "Review of warehouse organization and inventory management. All items properly organized and labeled.",
    status: "passed",
    recommendations: "Implement barcode system for improved inventory tracking.",
  },
  {
    id: "59",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Quality Assurance Procedures",
    findings: "Review of quality assurance procedures and documentation. All QA processes being followed correctly.",
    status: "passed",
    recommendations: "Develop standardized QA checklists for all processes.",
  },
  {
    id: "60",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Training Records Audit",
    findings:
      "Audit of all employee training records and certifications. All training current and properly documented.",
    status: "passed",
    recommendations: "Implement online training tracking system.",
  },
  {
    id: "61",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Incident Reporting Review",
    findings:
      "Review of incident reporting procedures and documentation. All incidents properly reported and investigated.",
    status: "passed",
    recommendations: "Develop trending analysis for incident prevention.",
  },
  {
    id: "62",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Customer Feedback Analysis",
    findings: "Analysis of customer feedback and complaint resolution. All feedback properly addressed and documented.",
    status: "passed",
    recommendations: "Implement customer satisfaction survey program.",
  },
  {
    id: "63",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Supplier Performance Review",
    findings: "Review of supplier performance and delivery metrics. All suppliers meeting performance standards.",
    status: "passed",
    recommendations: "Develop supplier scorecard system for better tracking.",
  },
  {
    id: "64",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Cost Control Analysis",
    findings: "Analysis of cost control measures and budget performance. All expenses within approved budget limits.",
    status: "passed",
    recommendations: "Identify additional cost reduction opportunities.",
  },
  {
    id: "65",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Energy Efficiency Review",
    findings: "Review of energy usage and efficiency measures. All systems operating efficiently with minimal waste.",
    status: "passed",
    recommendations: "Consider LED lighting upgrade for additional energy savings.",
  },
  {
    id: "66",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Water Conservation Audit",
    findings:
      "Audit of water usage and conservation measures. All fixtures operating efficiently with no waste detected.",
    status: "passed",
    recommendations: "Install low-flow fixtures in remaining areas.",
  },
  {
    id: "67",
    date: "2025-06-03",
    inspector: "A White",
    type: "Recycling Program Review",
    findings:
      "Review of recycling program effectiveness and participation. All recyclable materials properly sorted and collected.",
    status: "passed",
    recommendations: "Expand recycling program to include additional materials.",
  },
  {
    id: "68",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Noise Level Assessment",
    findings: "Assessment of workplace noise levels and hearing protection. All noise levels within acceptable limits.",
    status: "passed",
    recommendations: "Provide additional hearing protection options for employees.",
  },
  {
    id: "69",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Air Quality Monitoring",
    findings:
      "Monitoring of indoor air quality and ventilation effectiveness. All air quality parameters within healthy ranges.",
    status: "passed",
    recommendations: "Install additional air purification units in high-traffic areas.",
  },
  {
    id: "70",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Ergonomics Assessment",
    findings:
      "Assessment of workplace ergonomics and employee comfort. All workstations properly configured for employee health.",
    status: "passed",
    recommendations: "Provide ergonomic training for all employees.",
  },
  {
    id: "71",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Technology Security Audit",
    findings:
      "Audit of technology security measures and data protection. All systems properly secured with current security patches.",
    status: "passed",
    recommendations: "Implement multi-factor authentication for all user accounts.",
  },
  {
    id: "72",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Backup System Testing",
    findings: "Testing of all backup systems and data recovery procedures. All backup systems functioning properly.",
    status: "passed",
    recommendations: "Perform quarterly disaster recovery drills.",
  },
  {
    id: "73",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Network Performance Review",
    findings:
      "Review of network performance and connectivity. All network systems operating at optimal performance levels.",
    status: "passed",
    recommendations: "Upgrade network switches to support higher bandwidth.",
  },
  {
    id: "74",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Software License Audit",
    findings:
      "Audit of all software licenses and compliance. All software properly licensed with current maintenance agreements.",
    status: "passed",
    recommendations: "Consolidate software licenses for better cost management.",
  },
  {
    id: "75",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Mobile Device Security",
    findings:
      "Review of mobile device security policies and implementation. All mobile devices properly secured and managed.",
    status: "passed",
    recommendations: "Implement mobile device management solution.",
  },
  {
    id: "76",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Email Security Assessment",
    findings:
      "Assessment of email security measures and spam filtering. All email systems properly protected against threats.",
    status: "passed",
    recommendations: "Implement advanced threat protection for email.",
  },
  {
    id: "77",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Physical Security Perimeter",
    findings:
      "Inspection of physical security perimeter and access controls. All perimeter security measures functioning properly.",
    status: "passed",
    recommendations: "Install additional security cameras at perimeter points.",
  },
  {
    id: "78",
    date: "2025-06-03",
    inspector: "A White",
    type: "Visitor Management System",
    findings: "Review of visitor management procedures and tracking. All visitors properly registered and escorted.",
    status: "passed",
    recommendations: "Upgrade visitor management system to include photo ID capture.",
  },
  {
    id: "79",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Key Management Audit",
    findings: "Audit of key management procedures and access control. All keys properly controlled and accounted for.",
    status: "passed",
    recommendations: "Transition to electronic key management system.",
  },
  {
    id: "80",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Alarm System Testing",
    findings:
      "Testing of all alarm systems and response procedures. All alarm systems functioning properly with appropriate response times.",
    status: "passed",
    recommendations: "Update alarm system contact information with monitoring company.",
  },
  {
    id: "81",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Surveillance System Review",
    findings:
      "Review of surveillance system coverage and recording quality. All cameras functioning with clear image quality.",
    status: "passed",
    recommendations: "Upgrade storage capacity for longer video retention.",
  },
  {
    id: "82",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Emergency Lighting Test",
    findings:
      "Test of emergency lighting systems and battery backup. All emergency lights functioning with adequate battery life.",
    status: "passed",
    recommendations: "Replace batteries in emergency lights over 3 years old.",
  },
  {
    id: "83",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Exit Sign Inspection",
    findings:
      "Inspection of all exit signs and emergency egress routes. All exit signs illuminated and egress routes clear.",
    status: "passed",
    recommendations: "Install additional exit signs in newly configured areas.",
  },
  {
    id: "84",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Fire Extinguisher Check",
    findings:
      "Check of all fire extinguishers and inspection tags. All extinguishers properly charged with current inspection dates.",
    status: "passed",
    recommendations: "Schedule annual fire extinguisher training for all employees.",
  },
  {
    id: "85",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Smoke Detector Testing",
    findings:
      "Testing of all smoke detectors and fire alarm systems. All detectors functioning properly with clear alarm signals.",
    status: "passed",
    recommendations: "Replace smoke detector batteries in units over 5 years old.",
  },
  {
    id: "86",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Sprinkler System Inspection",
    findings:
      "Inspection of fire sprinkler system and water pressure. All sprinkler heads clear and system maintaining proper pressure.",
    status: "passed",
    recommendations: "Schedule annual sprinkler system flow test.",
  },
  {
    id: "87",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Emergency Assembly Point",
    findings:
      "Review of emergency assembly points and evacuation procedures. All assembly points clearly marked and accessible.",
    status: "passed",
    recommendations: "Conduct quarterly evacuation drills with all staff.",
  },
  {
    id: "88",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Safety Equipment Inventory",
    findings:
      "Inventory of all safety equipment and emergency supplies. All equipment properly maintained and readily accessible.",
    status: "passed",
    recommendations: "Add emergency communication equipment to safety inventory.",
  },
  {
    id: "89",
    date: "2025-06-03",
    inspector: "A White",
    type: "Hazardous Material Storage",
    findings:
      "Inspection of hazardous material storage and handling procedures. All materials properly stored with appropriate labeling.",
    status: "passed",
    recommendations: "Update hazardous material inventory and safety data sheets.",
  },
  {
    id: "90",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Spill Response Procedures",
    findings:
      "Review of spill response procedures and cleanup materials. All spill kits properly stocked and accessible.",
    status: "passed",
    recommendations: "Provide spill response training for all employees.",
  },
  {
    id: "91",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Lock-out Tag-out Procedures",
    findings:
      "Review of lock-out tag-out procedures for equipment maintenance. All procedures properly documented and followed.",
    status: "passed",
    recommendations: "Provide refresher training on LOTO procedures.",
  },
  {
    id: "92",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Confined Space Assessment",
    findings:
      "Assessment of confined space entry procedures and safety measures. All confined spaces properly identified and secured.",
    status: "passed",
    recommendations: "Update confined space entry permits and procedures.",
  },
  {
    id: "93",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Fall Protection Review",
    findings:
      "Review of fall protection equipment and procedures. All fall protection equipment in good condition and properly used.",
    status: "passed",
    recommendations: "Inspect fall protection equipment quarterly.",
  },
  {
    id: "94",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Ladder Safety Inspection",
    findings:
      "Inspection of all ladders and elevated work platforms. All equipment in safe working condition with proper inspection tags.",
    status: "passed",
    recommendations: "Replace wooden ladders with fiberglass for improved safety.",
  },
  {
    id: "95",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Machine Guarding Check",
    findings:
      "Check of machine guarding and safety interlocks. All machinery properly guarded with functioning safety systems.",
    status: "passed",
    recommendations: "Upgrade older machines with modern safety interlocks.",
  },
  {
    id: "96",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Electrical Safety Audit",
    findings:
      "Audit of electrical safety procedures and equipment. All electrical work performed by qualified personnel with proper procedures.",
    status: "passed",
    recommendations: "Schedule electrical system inspection by certified electrician.",
  },
  {
    id: "97",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Compressed Air Safety",
    findings:
      "Review of compressed air system safety and maintenance. All compressed air equipment properly maintained and operated.",
    status: "passed",
    recommendations: "Install additional pressure relief valves on air system.",
  },
  {
    id: "98",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Forklift Operation Review",
    findings:
      "Review of forklift operation procedures and operator certification. All operators properly certified with current training.",
    status: "passed",
    recommendations: "Schedule annual forklift safety refresher training.",
  },
  {
    id: "99",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Material Handling Assessment",
    findings:
      "Assessment of material handling procedures and equipment. All material handling performed safely with proper equipment.",
    status: "passed",
    recommendations: "Provide ergonomic lifting training for all employees.",
  },
  {
    id: "100",
    date: "2025-06-03",
    inspector: "A White",
    type: "Workplace Housekeeping",
    findings:
      "Review of workplace housekeeping standards and cleanliness. All work areas maintained in clean and orderly condition.",
    status: "passed",
    recommendations: "Implement 5S workplace organization methodology.",
  },
  {
    id: "101",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Tool Safety Inspection",
    findings:
      "Inspection of all hand tools and power tools for safety. All tools in safe working condition with proper guards and safety features.",
    status: "passed",
    recommendations: "Replace worn tools and implement tool inspection checklist.",
  },
  {
    id: "102",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Ventilation System Check",
    findings:
      "Check of ventilation systems and air circulation. All ventilation systems providing adequate air exchange and circulation.",
    status: "passed",
    recommendations: "Clean ventilation ducts and replace filters quarterly.",
  },
  {
    id: "103",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Lighting Level Assessment",
    findings:
      "Assessment of lighting levels throughout facility. All work areas have adequate lighting for safe operations.",
    status: "passed",
    recommendations: "Upgrade to LED lighting for improved illumination and energy efficiency.",
  },
  {
    id: "104",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Temperature Control Review",
    findings:
      "Review of temperature control systems and comfort levels. All areas maintained at comfortable working temperatures.",
    status: "passed",
    recommendations: "Install programmable thermostats for better temperature control.",
  },
  {
    id: "105",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Humidity Control Check",
    findings:
      "Check of humidity control systems and moisture levels. All areas maintained at appropriate humidity levels for equipment and comfort.",
    status: "passed",
    recommendations: "Install additional dehumidifiers in high-moisture areas.",
  },
  {
    id: "106",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Pest Control Inspection",
    findings:
      "Inspection for pest activity and control measures. No pest activity detected and all control measures effective.",
    status: "passed",
    recommendations: "Continue quarterly pest control service and monitoring.",
  },
  {
    id: "107",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Water Quality Testing",
    findings:
      "Testing of water quality and safety for consumption. All water sources meet safety standards for drinking and use.",
    status: "passed",
    recommendations: "Install water filtration system for improved taste and quality.",
  },
  {
    id: "108",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Restroom Supply Check",
    findings:
      "Check of restroom supplies and sanitation. All restrooms properly supplied with soap, towels, and sanitation products.",
    status: "passed",
    recommendations: "Install automatic dispensers for improved hygiene and cost control.",
  },
  {
    id: "109",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Kitchen Facility Inspection",
    findings:
      "Inspection of kitchen facilities and food safety. All kitchen equipment clean and functioning with proper food storage.",
    status: "passed",
    recommendations: "Update food safety training for all employees using kitchen facilities.",
  },
  {
    id: "110",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Meeting Room Assessment",
    findings:
      "Assessment of meeting room facilities and equipment. All meeting rooms properly equipped with functioning AV equipment.",
    status: "passed",
    recommendations: "Upgrade projectors to higher resolution models for better presentations.",
  },
  {
    id: "111",
    date: "2025-06-03",
    inspector: "A White",
    type: "Reception Area Security",
    findings:
      "Review of reception area security measures and visitor control. All security measures functioning properly with good visitor oversight.",
    status: "passed",
    recommendations: "Install panic button at reception desk for emergency situations.",
  },
  {
    id: "112",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Mail Room Operations",
    findings:
      "Review of mail room operations and package handling. All mail and packages processed efficiently with proper security screening.",
    status: "passed",
    recommendations: "Implement package tracking system for better accountability.",
  },
  {
    id: "113",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Copy Center Inspection",
    findings:
      "Inspection of copy center equipment and supplies. All equipment functioning properly with adequate supply inventory.",
    status: "passed",
    recommendations: "Negotiate service contract for copy equipment maintenance.",
  },
  {
    id: "114",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "File Storage Review",
    findings:
      "Review of file storage systems and organization. All files properly organized with appropriate access controls.",
    status: "passed",
    recommendations: "Implement document management system for improved efficiency.",
  },
  {
    id: "115",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Archive Storage Audit",
    findings:
      "Audit of archive storage conditions and organization. All archived materials properly stored in climate-controlled environment.",
    status: "passed",
    recommendations: "Digitize older archives for better preservation and access.",
  },
  {
    id: "116",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Supply Room Inventory",
    findings:
      "Inventory of supply room stock and organization. All supplies properly organized with adequate inventory levels.",
    status: "passed",
    recommendations: "Implement automated reorder system for frequently used supplies.",
  },
  {
    id: "117",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Maintenance Shop Review",
    findings:
      "Review of maintenance shop organization and tool inventory. All tools properly organized and maintained in good condition.",
    status: "passed",
    recommendations: "Install tool shadow boards for better organization and accountability.",
  },
  {
    id: "118",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Uniform and PPE Storage",
    findings:
      "Inspection of uniform and PPE storage areas. All uniforms and PPE properly stored and readily available.",
    status: "passed",
    recommendations: "Implement size tracking system for uniform inventory management.",
  },
  {
    id: "119",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Locker Room Facilities",
    findings:
      "Inspection of locker room facilities and cleanliness. All locker rooms clean and well-maintained with functioning locks.",
    status: "passed",
    recommendations: "Install ventilation fans for improved air circulation.",
  },
  {
    id: "120",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Shower Facility Check",
    findings:
      "Check of shower facilities and water temperature. All shower facilities clean with proper water temperature and pressure.",
    status: "passed",
    recommendations: "Install water-saving shower heads for conservation.",
  },
  {
    id: "121",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Exercise Equipment Review",
    findings:
      "Review of exercise equipment condition and safety. All exercise equipment properly maintained and safe for use.",
    status: "passed",
    recommendations: "Schedule professional equipment inspection and calibration.",
  },
  {
    id: "122",
    date: "2025-06-03",
    inspector: "A White",
    type: "Outdoor Area Inspection",
    findings:
      "Inspection of outdoor areas and recreational facilities. All outdoor areas well-maintained with proper drainage.",
    status: "passed",
    recommendations: "Install additional outdoor lighting for evening use.",
  },
  {
    id: "123",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Fence and Gate Security",
    findings:
      "Inspection of perimeter fencing and gate security. All fencing intact with functioning gate locks and access controls.",
    status: "passed",
    recommendations: "Repair minor fence damage and upgrade gate hardware.",
  },
  {
    id: "124",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Dumpster Area Review",
    findings: "Review of dumpster area cleanliness and security. All waste disposal areas clean and properly secured.",
    status: "passed",
    recommendations: "Install additional lighting and security cameras in waste disposal area.",
  },
  {
    id: "125",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Storm Drain Inspection",
    findings:
      "Inspection of storm drains and water management. All storm drains clear and functioning properly for water drainage.",
    status: "passed",
    recommendations: "Schedule annual storm drain cleaning and inspection.",
  },
  {
    id: "126",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Sidewalk and Walkway Safety",
    findings:
      "Safety inspection of sidewalks and walkways. All walkways in good condition with proper lighting and no trip hazards.",
    status: "passed",
    recommendations: "Apply anti-slip coating to walkways in high-traffic areas.",
  },
  {
    id: "127",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Parking Lot Maintenance",
    findings:
      "Review of parking lot condition and maintenance. All parking areas properly maintained with clear line markings.",
    status: "passed",
    recommendations: "Schedule parking lot resealing and line repainting.",
  },
  {
    id: "128",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Loading Dock Equipment",
    findings:
      "Inspection of loading dock equipment and safety features. All dock equipment functioning properly with appropriate safety measures.",
    status: "passed",
    recommendations: "Install dock levelers for improved safety and efficiency.",
  },
  {
    id: "129",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Delivery Vehicle Access",
    findings:
      "Review of delivery vehicle access and maneuvering space. All access routes clear with adequate space for vehicle operations.",
    status: "passed",
    recommendations: "Install mirrors at blind corners for improved visibility.",
  },
  {
    id: "130",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Emergency Vehicle Access",
    findings: "Assessment of emergency vehicle access routes. All emergency access routes clear and properly marked.",
    status: "passed",
    recommendations: "Coordinate with local fire department for access route review.",
  },
  {
    id: "131",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Utility Service Review",
    findings:
      "Review of all utility services and connections. All utility services functioning properly with appropriate backup systems.",
    status: "passed",
    recommendations: "Schedule utility service inspections with service providers.",
  },
  {
    id: "132",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Telecommunications Systems",
    findings:
      "Inspection of telecommunications systems and connectivity. All phone and internet systems functioning with good connectivity.",
    status: "passed",
    recommendations: "Upgrade internet bandwidth for improved performance.",
  },
  {
    id: "133",
    date: "2025-06-03",
    inspector: "A White",
    type: "Security System Integration",
    findings:
      "Review of security system integration and coordination. All security systems properly integrated and coordinated.",
    status: "passed",
    recommendations: "Implement centralized security management system.",
  },
  {
    id: "134",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Access Control Integration",
    findings:
      "Assessment of access control system integration. All access control systems properly integrated with security monitoring.",
    status: "passed",
    recommendations: "Upgrade access control software for better reporting capabilities.",
  },
  {
    id: "135",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Monitoring System Review",
    findings:
      "Review of all monitoring systems and alert procedures. All monitoring systems functioning with appropriate alert mechanisms.",
    status: "passed",
    recommendations: "Implement mobile alerts for critical system notifications.",
  },
  {
    id: "136",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Backup Power Systems",
    findings:
      "Inspection of backup power systems and battery maintenance. All backup systems functioning with adequate battery capacity.",
    status: "passed",
    recommendations: "Schedule load testing of backup generators quarterly.",
  },
  {
    id: "137",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Final Daily Operations Review",
    findings:
      "Comprehensive review of all daily operations and inspection results for June 3, 2025. All 136 inspections completed successfully with all systems and procedures operating satisfactorily.",
    status: "passed",
    recommendations:
      "Continue current operational excellence standards. Schedule follow-up on all recommendations within specified timeframes.",
  },
  // Additional 100 inspections for 2025-06-03 (IDs 138-237)
  {
    id: "138",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Chemical Inventory Audit",
    findings:
      "Audit of all chemical inventory and material safety data sheets. All chemicals properly catalogued with current MSDS documentation.",
    status: "passed",
    recommendations: "Update chemical inventory database with new supplier information.",
  },
  {
    id: "139",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Calibration Equipment Check",
    findings:
      "Check of all calibration equipment and certification status. All equipment within calibration specifications and properly certified.",
    status: "passed",
    recommendations: "Schedule recalibration for equipment due within next 60 days.",
  },
  {
    id: "140",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Compressed Gas Storage",
    findings:
      "Inspection of compressed gas storage areas and safety procedures. All gas cylinders properly secured and labeled.",
    status: "passed",
    recommendations: "Install additional gas leak detection equipment in storage areas.",
  },
  {
    id: "141",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Laboratory Equipment Review",
    findings:
      "Review of laboratory equipment condition and maintenance schedules. All equipment functioning properly with current maintenance records.",
    status: "passed",
    recommendations: "Upgrade older microscopes to digital imaging systems.",
  },
  {
    id: "142",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Testing Facility Inspection",
    findings:
      "Inspection of testing facility procedures and equipment calibration. All testing procedures properly documented and followed.",
    status: "passed",
    recommendations: "Implement automated data logging for test results.",
  },
  {
    id: "143",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Sample Storage Review",
    findings:
      "Review of sample storage procedures and chain of custody. All samples properly stored with complete documentation.",
    status: "passed",
    recommendations: "Install additional refrigeration units for sample preservation.",
  },
  {
    id: "144",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Quality Control Documentation",
    findings:
      "Review of quality control documentation and procedures. All QC processes properly documented with complete records.",
    status: "passed",
    recommendations: "Digitize QC records for improved searchability and backup.",
  },
  {
    id: "145",
    date: "2025-06-03",
    inspector: "A White",
    type: "Measurement Standards Audit",
    findings:
      "Audit of measurement standards and traceability. All measurement standards traceable to national standards.",
    status: "passed",
    recommendations: "Update measurement uncertainty calculations for all procedures.",
  },
  {
    id: "146",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Environmental Monitoring",
    findings:
      "Monitoring of environmental conditions in all work areas. All environmental parameters within specified limits.",
    status: "passed",
    recommendations: "Install continuous monitoring systems for critical parameters.",
  },
  {
    id: "147",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Waste Stream Analysis",
    findings:
      "Analysis of waste streams and disposal procedures. All waste properly categorized and disposed according to regulations.",
    status: "passed",
    recommendations: "Implement waste reduction program to minimize disposal costs.",
  },
  {
    id: "148",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Energy Management Review",
    findings:
      "Review of energy management systems and consumption patterns. All systems operating efficiently with good energy management.",
    status: "passed",
    recommendations: "Install smart meters for better energy usage tracking.",
  },
  {
    id: "149",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Water Usage Assessment",
    findings:
      "Assessment of water usage and conservation measures. All water systems operating efficiently with minimal waste.",
    status: "passed",
    recommendations: "Install water recycling system for non-potable uses.",
  },
  {
    id: "150",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Air Quality Monitoring",
    findings:
      "Monitoring of indoor air quality and ventilation effectiveness. All air quality parameters within healthy ranges.",
    status: "passed",
    recommendations: "Upgrade air filtration systems to HEPA grade filters.",
  },
  {
    id: "151",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Noise Level Compliance",
    findings:
      "Assessment of noise levels for OSHA compliance. All noise levels within acceptable limits for worker safety.",
    status: "passed",
    recommendations: "Install sound dampening materials in high-noise areas.",
  },
  {
    id: "152",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Radiation Safety Check",
    findings:
      "Check of radiation safety procedures and monitoring equipment. All radiation sources properly controlled and monitored.",
    status: "passed",
    recommendations: "Update radiation safety training for all personnel.",
  },
  {
    id: "153",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Biological Safety Review",
    findings:
      "Review of biological safety procedures and containment measures. All biological materials properly contained and handled.",
    status: "passed",
    recommendations: "Upgrade biosafety cabinets to latest certification standards.",
  },
  {
    id: "154",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Chemical Fume Hood Testing",
    findings:
      "Testing of chemical fume hoods and ventilation systems. All fume hoods operating within specified airflow parameters.",
    status: "passed",
    recommendations: "Schedule annual fume hood certification and testing.",
  },
  {
    id: "155",
    date: "2025-06-03",
    inspector: "A White",
    type: "Emergency Shower Testing",
    findings:
      "Testing of emergency showers and eyewash stations. All emergency equipment functioning properly with adequate water flow.",
    status: "passed",
    recommendations: "Install additional eyewash stations in remote work areas.",
  },
  {
    id: "156",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Safety Equipment Calibration",
    findings:
      "Calibration check of all safety monitoring equipment. All safety equipment properly calibrated and functioning.",
    status: "passed",
    recommendations: "Implement automated calibration reminder system.",
  },
  {
    id: "157",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Personal Dosimetry Review",
    findings:
      "Review of personal dosimetry program and exposure records. All personnel exposure levels within acceptable limits.",
    status: "passed",
    recommendations: "Upgrade to electronic dosimetry for real-time monitoring.",
  },
  {
    id: "158",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Confined Space Entry Audit",
    findings:
      "Audit of confined space entry procedures and permits. All confined space entries properly authorized and monitored.",
    status: "passed",
    recommendations: "Install continuous atmospheric monitoring in confined spaces.",
  },
  {
    id: "159",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Hot Work Permit Review",
    findings:
      "Review of hot work permit procedures and fire watch protocols. All hot work properly authorized with fire safety measures.",
    status: "passed",
    recommendations: "Implement digital hot work permit system for better tracking.",
  },
  {
    id: "160",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Crane and Lifting Equipment",
    findings:
      "Inspection of crane and lifting equipment safety and certification. All lifting equipment properly certified and inspected.",
    status: "passed",
    recommendations: "Schedule load testing for overhead cranes due for inspection.",
  },
  {
    id: "161",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Pressure Vessel Inspection",
    findings:
      "Inspection of pressure vessels and safety relief systems. All pressure vessels within inspection dates with functioning relief valves.",
    status: "passed",
    recommendations: "Schedule hydrostatic testing for vessels due for inspection.",
  },
  {
    id: "162",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Boiler Safety Review",
    findings:
      "Review of boiler safety systems and operating procedures. All boiler systems operating safely with proper controls.",
    status: "passed",
    recommendations: "Update boiler operator training and certification.",
  },
  {
    id: "163",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Electrical Panel Inspection",
    findings:
      "Inspection of electrical panels and circuit protection. All electrical panels properly labeled with functioning protection devices.",
    status: "passed",
    recommendations: "Upgrade older circuit breakers to arc-fault protection.",
  },
  {
    id: "164",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Grounding System Check",
    findings:
      "Check of electrical grounding systems and continuity. All grounding systems properly installed and tested.",
    status: "passed",
    recommendations: "Install additional grounding points for sensitive equipment.",
  },
  {
    id: "165",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Lightning Protection Review",
    findings:
      "Review of lightning protection systems and grounding. All lightning protection systems properly installed and maintained.",
    status: "passed",
    recommendations: "Schedule annual lightning protection system inspection.",
  },
  {
    id: "166",
    date: "2025-06-03",
    inspector: "A White",
    type: "Emergency Generator Testing",
    findings:
      "Testing of emergency generators and automatic transfer switches. All emergency power systems functioning properly.",
    status: "passed",
    recommendations: "Perform monthly load testing of emergency generators.",
  },
  {
    id: "167",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "UPS System Review",
    findings:
      "Review of uninterruptible power supply systems and battery backup. All UPS systems functioning with adequate battery capacity.",
    status: "passed",
    recommendations: "Replace UPS batteries over 3 years old for reliability.",
  },
  {
    id: "168",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Motor Control Center Inspection",
    findings:
      "Inspection of motor control centers and variable frequency drives. All motor controls operating properly with good maintenance.",
    status: "passed",
    recommendations: "Implement predictive maintenance program for motor systems.",
  },
  {
    id: "169",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Instrumentation Calibration",
    findings:
      "Calibration check of process instrumentation and control systems. All instruments within calibration specifications.",
    status: "passed",
    recommendations: "Upgrade to smart instrumentation for remote monitoring.",
  },
  {
    id: "170",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Control System Security",
    findings:
      "Review of control system cybersecurity and access controls. All control systems properly secured against cyber threats.",
    status: "passed",
    recommendations: "Implement network segmentation for control system isolation.",
  },
  {
    id: "171",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Data Acquisition Review",
    findings:
      "Review of data acquisition systems and data integrity. All data systems collecting accurate data with proper backup.",
    status: "passed",
    recommendations: "Implement real-time data validation and error checking.",
  },
  {
    id: "172",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Process Control Audit",
    findings:
      "Audit of process control procedures and alarm management. All process controls functioning properly with appropriate alarms.",
    status: "passed",
    recommendations: "Rationalize alarm systems to reduce nuisance alarms.",
  },
  {
    id: "173",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Safety Interlock Testing",
    findings:
      "Testing of safety interlocks and emergency shutdown systems. All safety systems functioning properly and tested regularly.",
    status: "passed",
    recommendations: "Document all safety system tests for regulatory compliance.",
  },
  {
    id: "174",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Fire Detection System Check",
    findings:
      "Check of fire detection systems and alarm notification. All fire detection systems functioning with clear alarm signals.",
    status: "passed",
    recommendations: "Upgrade to addressable fire alarm system for better location identification.",
  },
  {
    id: "175",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Gas Detection System Review",
    findings:
      "Review of gas detection systems and calibration status. All gas detectors properly calibrated and functioning.",
    status: "passed",
    recommendations: "Install wireless gas detection system for remote monitoring.",
  },
  {
    id: "176",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Ventilation System Performance",
    findings:
      "Performance testing of ventilation systems and air changes. All ventilation systems providing adequate air exchange rates.",
    status: "passed",
    recommendations: "Install variable speed drives on ventilation fans for energy savings.",
  },
  {
    id: "177",
    date: "2025-06-03",
    inspector: "A White",
    type: "Dust Collection System Audit",
    findings:
      "Audit of dust collection systems and filter maintenance. All dust collection systems operating efficiently with clean filters.",
    status: "passed",
    recommendations: "Implement automated filter change indicators for maintenance scheduling.",
  },
  {
    id: "178",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Compressed Air Quality Check",
    findings:
      "Check of compressed air quality and filtration systems. All compressed air meeting quality standards for intended use.",
    status: "passed",
    recommendations: "Install oil-free compressors for critical applications.",
  },
  {
    id: "179",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Cooling System Inspection",
    findings:
      "Inspection of cooling systems and heat exchangers. All cooling systems operating efficiently with proper heat transfer.",
    status: "passed",
    recommendations: "Schedule cooling tower cleaning and water treatment analysis.",
  },
  {
    id: "180",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Steam System Review",
    findings:
      "Review of steam systems and condensate return. All steam systems operating efficiently with proper condensate recovery.",
    status: "passed",
    recommendations: "Install steam traps monitoring system for energy optimization.",
  },
  {
    id: "181",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Hydraulic System Check",
    findings:
      "Check of hydraulic systems and fluid condition. All hydraulic systems operating properly with clean fluid.",
    status: "passed",
    recommendations: "Implement hydraulic fluid analysis program for predictive maintenance.",
  },
  {
    id: "182",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Pneumatic System Audit",
    findings:
      "Audit of pneumatic systems and air leakage. All pneumatic systems functioning properly with minimal air leakage.",
    status: "passed",
    recommendations: "Conduct quarterly air leak surveys for energy conservation.",
  },
  {
    id: "183",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Lubrication Program Review",
    findings:
      "Review of lubrication program and oil analysis results. All equipment properly lubricated with good oil condition.",
    status: "passed",
    recommendations: "Expand oil analysis program to include more equipment.",
  },
  {
    id: "184",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Vibration Analysis Check",
    findings:
      "Vibration analysis of rotating equipment and machinery. All equipment operating within acceptable vibration limits.",
    status: "passed",
    recommendations: "Install permanent vibration monitoring on critical equipment.",
  },
  {
    id: "185",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Thermography Inspection",
    findings:
      "Thermographic inspection of electrical and mechanical equipment. No abnormal heat patterns detected in equipment.",
    status: "passed",
    recommendations: "Schedule quarterly thermographic inspections for preventive maintenance.",
  },
  {
    id: "186",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Ultrasonic Testing Review",
    findings:
      "Ultrasonic testing of pressure vessels and piping. All tested components showing no signs of wall thinning or defects.",
    status: "passed",
    recommendations: "Expand ultrasonic testing program to include more piping systems.",
  },
  {
    id: "187",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Magnetic Particle Testing",
    findings:
      "Magnetic particle testing of critical welds and components. All tested welds and components free from surface defects.",
    status: "passed",
    recommendations: "Document all NDT results in computerized maintenance management system.",
  },
  {
    id: "188",
    date: "2025-06-03",
    inspector: "A White",
    type: "Dye Penetrant Inspection",
    findings:
      "Dye penetrant inspection of non-magnetic components. All inspected components free from surface cracks or defects.",
    status: "passed",
    recommendations: "Train additional personnel in dye penetrant testing methods.",
  },
  {
    id: "189",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Radiographic Testing Review",
    findings:
      "Review of radiographic testing procedures and film quality. All radiographic testing performed to code requirements.",
    status: "passed",
    recommendations: "Transition to digital radiography for improved image quality and storage.",
  },
  {
    id: "190",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Eddy Current Testing Check",
    findings:
      "Eddy current testing of heat exchanger tubes and conductors. All tested tubes showing good wall thickness and integrity.",
    status: "passed",
    recommendations: "Implement automated eddy current testing for improved efficiency.",
  },
  {
    id: "191",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Acoustic Emission Monitoring",
    findings:
      "Acoustic emission monitoring of pressure vessels during operation. No abnormal acoustic emissions detected during testing.",
    status: "passed",
    recommendations: "Install permanent acoustic emission monitoring on critical vessels.",
  },
  {
    id: "192",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Leak Detection Survey",
    findings:
      "Comprehensive leak detection survey of all piping systems. Minor leaks identified and scheduled for repair.",
    status: "passed",
    recommendations: "Implement monthly leak detection surveys for early problem identification.",
  },
  {
    id: "193",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Corrosion Monitoring Review",
    findings:
      "Review of corrosion monitoring program and coupon analysis. All corrosion rates within acceptable limits for equipment life.",
    status: "passed",
    recommendations: "Expand corrosion monitoring to include more locations and equipment.",
  },
  {
    id: "194",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Cathodic Protection Check",
    findings:
      "Check of cathodic protection systems for underground piping. All cathodic protection systems functioning properly.",
    status: "passed",
    recommendations: "Install remote monitoring for cathodic protection systems.",
  },
  {
    id: "195",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Coating Inspection Review",
    findings:
      "Review of protective coating condition and maintenance schedules. All coatings in good condition with scheduled maintenance current.",
    status: "passed",
    recommendations: "Develop coating maintenance database for better lifecycle management.",
  },
  {
    id: "196",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Insulation System Audit",
    findings:
      "Audit of thermal insulation systems and energy efficiency. All insulation systems intact and providing good thermal efficiency.",
    status: "passed",
    recommendations: "Upgrade insulation in older areas to improve energy efficiency.",
  },
  {
    id: "197",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Fireproofing Inspection",
    findings:
      "Inspection of fireproofing materials and application integrity. All fireproofing materials in good condition and properly applied.",
    status: "passed",
    recommendations: "Schedule fireproofing inspection by certified fire protection engineer.",
  },
  {
    id: "198",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Structural Steel Review",
    findings:
      "Review of structural steel condition and load capacity. All structural steel in good condition with no signs of fatigue or overload.",
    status: "passed",
    recommendations: "Perform detailed structural analysis of older building sections.",
  },
  {
    id: "199",
    date: "2025-06-03",
    inspector: "A White",
    type: "Foundation Settlement Check",
    findings:
      "Check for foundation settlement and structural movement. No signs of foundation settlement or structural movement detected.",
    status: "passed",
    recommendations: "Install settlement monitoring points for long-term tracking.",
  },
  {
    id: "200",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Seismic Restraint Inspection",
    findings:
      "Inspection of seismic restraints and earthquake preparedness. All seismic restraints properly installed and maintained.",
    status: "passed",
    recommendations: "Update seismic restraint design to current building codes.",
  },
  {
    id: "201",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Wind Load Assessment",
    findings:
      "Assessment of wind load resistance and structural adequacy. All structures adequate for design wind loads.",
    status: "passed",
    recommendations: "Review wind load calculations for any building modifications.",
  },
  {
    id: "202",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Snow Load Evaluation",
    findings:
      "Evaluation of snow load capacity and roof structure. All roof structures adequate for design snow loads.",
    status: "passed",
    recommendations: "Install snow load monitoring system for winter weather events.",
  },
  {
    id: "203",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Drainage System Check",
    findings: "Check of roof and site drainage systems. All drainage systems functioning properly with no blockages.",
    status: "passed",
    recommendations: "Install additional roof drains in areas prone to ponding.",
  },
  {
    id: "204",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Waterproofing Inspection",
    findings:
      "Inspection of waterproofing systems and moisture barriers. All waterproofing systems intact with no signs of water intrusion.",
    status: "passed",
    recommendations: "Schedule waterproofing renewal for systems over 10 years old.",
  },
  {
    id: "205",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Roofing System Review",
    findings:
      "Review of roofing system condition and maintenance needs. All roofing systems in good condition with minor maintenance items noted.",
    status: "passed",
    recommendations: "Schedule roof membrane inspection after next major storm event.",
  },
  {
    id: "206",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Exterior Wall Assessment",
    findings:
      "Assessment of exterior wall systems and weather sealing. All exterior walls in good condition with effective weather sealing.",
    status: "passed",
    recommendations: "Recaulk window and door penetrations as part of annual maintenance.",
  },
  {
    id: "207",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Window and Door Inspection",
    findings:
      "Inspection of windows and doors for operation and sealing. All windows and doors operating properly with good weather sealing.",
    status: "passed",
    recommendations: "Replace weather stripping on older doors and windows.",
  },
  {
    id: "208",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Interior Finish Review",
    findings:
      "Review of interior finishes and maintenance requirements. All interior finishes in good condition with normal wear patterns.",
    status: "passed",
    recommendations: "Schedule interior painting for high-traffic areas showing wear.",
  },
  {
    id: "209",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Flooring System Check",
    findings:
      "Check of flooring systems and slip resistance. All flooring systems in good condition with adequate slip resistance.",
    status: "passed",
    recommendations: "Apply anti-slip coating to floors in wet areas for improved safety.",
  },
  {
    id: "210",
    date: "2025-06-03",
    inspector: "A White",
    type: "Ceiling System Inspection",
    findings:
      "Inspection of ceiling systems and support structures. All ceiling systems properly supported with no signs of sagging.",
    status: "passed",
    recommendations: "Inspect ceiling support systems in areas with heavy equipment above.",
  },
  {
    id: "211",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Lighting System Efficiency",
    findings:
      "Assessment of lighting system efficiency and illumination levels. All lighting systems providing adequate illumination efficiently.",
    status: "passed",
    recommendations: "Complete LED conversion project for remaining fluorescent fixtures.",
  },
  {
    id: "212",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Emergency Lighting Battery Test",
    findings:
      "Battery test of emergency lighting systems. All emergency lighting systems maintaining adequate battery backup duration.",
    status: "passed",
    recommendations: "Replace emergency lighting batteries over 4 years old.",
  },
  {
    id: "213",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Exit Sign Illumination Check",
    findings:
      "Check of exit sign illumination and visibility. All exit signs properly illuminated and clearly visible from all angles.",
    status: "passed",
    recommendations: "Upgrade exit signs to LED for improved reliability and energy efficiency.",
  },
  {
    id: "214",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Security Lighting Review",
    findings:
      "Review of security lighting coverage and operation. All security lighting providing adequate coverage with no dark areas.",
    status: "passed",
    recommendations: "Install motion-activated LED security lights in remote areas.",
  },
  {
    id: "215",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Parking Lot Lighting Assessment",
    findings:
      "Assessment of parking lot lighting levels and uniformity. All parking areas adequately lit with good uniformity.",
    status: "passed",
    recommendations: "Upgrade parking lot lighting to LED for better illumination and efficiency.",
  },
  {
    id: "216",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Landscape Lighting Check",
    findings:
      "Check of landscape lighting systems and timers. All landscape lighting functioning properly with appropriate timing controls.",
    status: "passed",
    recommendations: "Install photocell controls on landscape lighting for automatic operation.",
  },
  {
    id: "217",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Signage Visibility Audit",
    findings:
      "Audit of signage visibility and compliance with regulations. All required signage properly positioned and clearly visible.",
    status: "passed",
    recommendations: "Replace faded signs with new reflective materials for better visibility.",
  },
  {
    id: "218",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Wayfinding System Review",
    findings:
      "Review of wayfinding system effectiveness and clarity. All wayfinding signs clear and helpful for navigation.",
    status: "passed",
    recommendations: "Add digital wayfinding displays in main lobby and entrance areas.",
  },
  {
    id: "219",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "ADA Compliance Inspection",
    findings:
      "Inspection of ADA compliance features and accessibility. All accessibility features functioning properly and compliant.",
    status: "passed",
    recommendations: "Update accessibility features to current ADA standards where needed.",
  },
  {
    id: "220",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Elevator System Check",
    findings:
      "Check of elevator systems and safety features. All elevators operating smoothly with functioning safety systems.",
    status: "passed",
    recommendations: "Schedule annual elevator inspection by certified elevator technician.",
  },
  {
    id: "221",
    date: "2025-06-03",
    inspector: "A White",
    type: "Escalator Maintenance Review",
    findings:
      "Review of escalator maintenance and safety systems. All escalators operating properly with current maintenance records.",
    status: "passed",
    recommendations: "Implement predictive maintenance program for escalator systems.",
  },
  {
    id: "222",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Stairway Safety Inspection",
    findings:
      "Safety inspection of stairways and handrails. All stairways safe with properly installed handrails and non-slip surfaces.",
    status: "passed",
    recommendations: "Install additional handrails on wide stairways for improved safety.",
  },
  {
    id: "223",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Ramp and Platform Check",
    findings:
      "Check of ramps and loading platforms for safety and compliance. All ramps and platforms safe with appropriate slope and railings.",
    status: "passed",
    recommendations: "Apply anti-slip surface treatment to ramps in outdoor areas.",
  },
  {
    id: "224",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Guardrail System Audit",
    findings:
      "Audit of guardrail systems and fall protection. All guardrails properly installed and meeting height requirements.",
    status: "passed",
    recommendations: "Inspect guardrail connections and hardware for wear and corrosion.",
  },
  {
    id: "225",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Safety Barrier Review",
    findings:
      "Review of safety barriers and protective equipment. All safety barriers properly positioned and maintained.",
    status: "passed",
    recommendations: "Install additional safety barriers around high-risk equipment areas.",
  },
  {
    id: "226",
    date: "2025-06-03",
    inspector: "D Anderson",
    type: "Traffic Control Assessment",
    findings:
      "Assessment of traffic control measures and vehicle safety. All traffic control devices functioning properly.",
    status: "passed",
    recommendations: "Install speed bumps in areas with pedestrian and vehicle interaction.",
  },
  {
    id: "227",
    date: "2025-06-03",
    inspector: "S Wilson",
    type: "Pedestrian Safety Review",
    findings:
      "Review of pedestrian safety measures and walkway protection. All pedestrian areas properly protected from vehicle traffic.",
    status: "passed",
    recommendations: "Install additional pedestrian crossing signals at busy intersections.",
  },
  {
    id: "228",
    date: "2025-06-03",
    inspector: "L Garcia",
    type: "Vehicle Maintenance Inspection",
    findings:
      "Inspection of company vehicle maintenance and safety records. All vehicles properly maintained with current safety inspections.",
    status: "passed",
    recommendations: "Implement fleet management software for better maintenance tracking.",
  },
  {
    id: "229",
    date: "2025-06-03",
    inspector: "K Lee",
    type: "Driver Safety Program Review",
    findings:
      "Review of driver safety program and training records. All drivers properly trained with current safety certifications.",
    status: "passed",
    recommendations: "Implement defensive driving course for all company drivers.",
  },
  {
    id: "230",
    date: "2025-06-03",
    inspector: "B Taylor",
    type: "Fuel Storage Safety Check",
    findings:
      "Safety check of fuel storage systems and spill prevention. All fuel storage systems properly maintained with spill containment.",
    status: "passed",
    recommendations: "Install fuel monitoring system for leak detection and inventory control.",
  },
  {
    id: "231",
    date: "2025-06-03",
    inspector: "C Clark",
    type: "Battery Storage Review",
    findings:
      "Review of battery storage areas and ventilation systems. All battery storage areas properly ventilated with appropriate safety measures.",
    status: "passed",
    recommendations: "Install hydrogen gas detection system in battery storage areas.",
  },
  {
    id: "232",
    date: "2025-06-03",
    inspector: "A White",
    type: "Propane System Inspection",
    findings:
      "Inspection of propane systems and leak detection. All propane systems properly installed with functioning leak detection.",
    status: "passed",
    recommendations: "Schedule annual propane system inspection by certified technician.",
  },
  {
    id: "233",
    date: "2025-06-03",
    inspector: "T Johnson",
    type: "Natural Gas Safety Audit",
    findings:
      "Safety audit of natural gas systems and emergency shutoffs. All natural gas systems safe with accessible emergency shutoffs.",
    status: "passed",
    recommendations: "Install automatic gas shutoff valves for enhanced safety.",
  },
  {
    id: "234",
    date: "2025-06-03",
    inspector: "J Martinez",
    type: "Oxygen System Review",
    findings:
      "Review of oxygen systems and fire safety measures. All oxygen systems properly maintained with appropriate fire safety precautions.",
    status: "passed",
    recommendations: "Update oxygen safety training for all personnel working with oxygen systems.",
  },
  {
    id: "235",
    date: "2025-06-03",
    inspector: "R Rodriguez",
    type: "Acetylene Storage Check",
    findings:
      "Check of acetylene storage and handling procedures. All acetylene storage compliant with safety regulations.",
    status: "passed",
    recommendations: "Install additional ventilation in acetylene storage areas.",
  },
  {
    id: "236",
    date: "2025-06-03",
    inspector: "M Thompson",
    type: "Welding Safety Assessment",
    findings:
      "Assessment of welding safety procedures and ventilation. All welding operations conducted safely with proper ventilation.",
    status: "passed",
    recommendations: "Upgrade welding fume extraction systems for improved air quality.",
  },
  {
    id: "237",
    date: "2025-06-03",
    inspector: "PN Sikhakhane",
    type: "Comprehensive End-of-Day Review",
    findings:
      "Final comprehensive review of all 237 inspections completed on June 3, 2025. All facility systems, safety measures, and operational procedures found to be in excellent condition and full compliance.",
    status: "passed",
    recommendations:
      "Outstanding performance across all inspection categories. Continue current maintenance and safety standards. Schedule implementation of all recommended improvements within specified timeframes.",
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
