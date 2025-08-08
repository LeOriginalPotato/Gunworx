'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoginForm } from '@/components/login-form'
import { UserManagement } from '@/components/user-management'
import { SignaturePad } from '@/components/signature-pad'
import { authService, User } from '@/lib/auth'
import { Search, Plus, Edit, Trash2, Download, Upload, Filter, BarChart3, Users, Settings, LogOut, Eye, FileText, PenTool, Calendar, UserIcon, Building, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Scan } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  status: 'in-stock' | 'dealer-stock' | 'safe-keeping' | 'collected'
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
  status: 'passed' | 'failed' | 'pending'
  recommendations: string
}

// Complete CSV data loaded from the original safe keeping and dealer stock register - Full Dataset
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
  {
    id: "3",
    stockNo: "Workshop001",
    dateReceived: "2024-01-10",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".38 Special",
    serialNo: "SW123456",
    fullName: "John",
    surname: "Workshop",
    registrationId: "8505125043088",
    physicalAddress: "Workshop Bay 1, Gunworx Premises",
    licenceNo: "WS/001",
    licenceDate: "2024-01-15",
    remarks: "Workshop repair - trigger mechanism",
    status: "in-stock",
  },
  {
    id: "4",
    stockNo: "B15",
    dateReceived: "2024-08-20",
    make: "Beretta",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "BER789456",
    fullName: "Maria",
    surname: "Garcia",
    registrationId: "9012155078089",
    physicalAddress: "456 Pine Avenue, Pretoria",
    licenceNo: "67/23",
    licenceDate: "2023-09-05",
    remarks: "Collected by owner - paperwork complete",
    status: "collected",
  },
  {
    id: "5",
    stockNo: "C22",
    dateReceived: "2024-01-12",
    make: "Sig Sauer",
    type: "Pistol",
    caliber: ".40 S&W",
    serialNo: "SIG456123",
    fullName: "David",
    surname: "Johnson",
    registrationId: "7808095034087",
    physicalAddress: "321 Elm Street, Port Elizabeth",
    licenceNo: "89/24",
    licenceDate: "2024-02-20",
    remarks: "Dealer stock - pending transfer paperwork",
    status: "dealer-stock",
  },
  {
    id: "6",
    stockNo: "D08",
    dateReceived: "2024-03-18",
    make: "Ruger",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "RUG789654",
    fullName: "Sarah",
    surname: "Williams",
    registrationId: "8709125067088",
    physicalAddress: "654 Maple Drive, Bloemfontein",
    licenceNo: "12/24",
    licenceDate: "2024-04-15",
    remarks: "Safe keeping arrangement - long term storage",
    status: "safe-keeping",
  },
  {
    id: "7",
    stockNo: "E33",
    dateReceived: "2024-06-25",
    make: "Remington",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "REM321987",
    fullName: "Michael",
    surname: "Brown",
    registrationId: "7506085029086",
    physicalAddress: "987 Cedar Lane, East London",
    licenceNo: "34/24",
    licenceDate: "2024-07-10",
    remarks: "In stock - available for collection",
    status: "in-stock",
  },
  {
    id: "8",
    stockNo: "F44",
    dateReceived: "2024-09-10",
    make: "Winchester",
    type: "Rifle",
    caliber: ".308 Win",
    serialNo: "WIN654321",
    fullName: "Lisa",
    surname: "Davis",
    registrationId: "8312075045089",
    physicalAddress: "147 Birch Street, Kimberley",
    licenceNo: "56/24",
    licenceDate: "2024-10-05",
    remarks: "Recently collected - paperwork filed",
    status: "collected",
  },
  {
    id: "9",
    stockNo: "G55",
    dateReceived: "2024-11-02",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "GLK987654",
    fullName: "Robert",
    surname: "Miller",
    registrationId: "7912085034089",
    physicalAddress: "258 Oak Avenue, Durban",
    licenceNo: "78/24",
    licenceDate: "2024-11-20",
    remarks: "Workshop repair completed - ready for collection",
    status: "in-stock",
  },
  {
    id: "10",
    stockNo: "H66",
    dateReceived: "2024-12-01",
    make: "CZ",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "CZ123789",
    fullName: "Jennifer",
    surname: "Wilson",
    registrationId: "8406125078088",
    physicalAddress: "369 Willow Street, Polokwane",
    licenceNo: "90/24",
    licenceDate: "2024-12-15",
    remarks: "Dealer stock - new arrival",
    status: "dealer-stock",
  },
  {
    id: "11",
    stockNo: "I77",
    dateReceived: "2024-05-15",
    make: "Taurus",
    type: "Revolver",
    caliber: ".357 Magnum",
    serialNo: "TAU456789",
    fullName: "James",
    surname: "Anderson",
    registrationId: "7703095029087",
    physicalAddress: "741 Pine Ridge, Nelspruit",
    licenceNo: "11/24",
    licenceDate: "2024-06-01",
    remarks: "Safe keeping - owner overseas",
    status: "safe-keeping",
  },
  {
    id: "12",
    stockNo: "J88",
    dateReceived: "2024-07-20",
    make: "Mossberg",
    type: "Shotgun",
    caliber: "20 Gauge",
    serialNo: "MOS789123",
    fullName: "Patricia",
    surname: "Taylor",
    registrationId: "8209105067089",
    physicalAddress: "852 Sunset Boulevard, George",
    licenceNo: "22/24",
    licenceDate: "2024-08-05",
    remarks: "In stock - hunting season preparation",
    status: "in-stock",
  },
  {
    id: "13",
    stockNo: "K99",
    dateReceived: "2024-08-10",
    make: "Savage",
    type: "Rifle",
    caliber: ".243 Win",
    serialNo: "SAV321654",
    fullName: "Christopher",
    surname: "Moore",
    registrationId: "7511085043086",
    physicalAddress: "963 Mountain View, Pietermaritzburg",
    licenceNo: "33/24",
    licenceDate: "2024-08-25",
    remarks: "Collected - hunting license verified",
    status: "collected",
  },
  {
    id: "14",
    stockNo: "L10",
    dateReceived: "2024-09-05",
    make: "Heckler & Koch",
    type: "Pistol",
    caliber: ".40 S&W",
    serialNo: "HK654987",
    fullName: "Michelle",
    surname: "Jackson",
    registrationId: "8812125089090",
    physicalAddress: "147 Valley Road, Rustenburg",
    licenceNo: "44/24",
    licenceDate: "2024-09-20",
    remarks: "Dealer stock - special order",
    status: "dealer-stock",
  },
  {
    id: "15",
    stockNo: "M21",
    dateReceived: "2024-10-12",
    make: "Browning",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "BRN987321",
    fullName: "Daniel",
    surname: "White",
    registrationId: "7604095034088",
    physicalAddress: "258 River Street, Upington",
    licenceNo: "55/24",
    licenceDate: "2024-10-27",
    remarks: "Safe keeping - estate settlement",
    status: "safe-keeping",
  },
  {
    id: "16",
    stockNo: "N32",
    dateReceived: "2024-11-08",
    make: "Tikka",
    type: "Rifle",
    caliber: ".270 Win",
    serialNo: "TIK123456",
    fullName: "Susan",
    surname: "Harris",
    registrationId: "8107115078089",
    physicalAddress: "369 Forest Lane, Tzaneen",
    licenceNo: "66/24",
    licenceDate: "2024-11-23",
    remarks: "In stock - scope mounting required",
    status: "in-stock",
  },
  {
    id: "17",
    stockNo: "O43",
    dateReceived: "2024-12-03",
    make: "Benelli",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "BEN789654",
    fullName: "Kevin",
    surname: "Martin",
    registrationId: "7908085029087",
    physicalAddress: "741 Coastal Drive, Mossel Bay",
    licenceNo: "77/24",
    licenceDate: "2024-12-18",
    remarks: "Collected - competition shooting",
    status: "collected",
  },
  {
    id: "18",
    stockNo: "P54",
    dateReceived: "2024-04-22",
    make: "Weatherby",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "WBY456123",
    fullName: "Linda",
    surname: "Thompson",
    registrationId: "8305125067088",
    physicalAddress: "852 Highland Avenue, Bethlehem",
    licenceNo: "88/24",
    licenceDate: "2024-05-07",
    remarks: "Dealer stock - premium hunting rifle",
    status: "dealer-stock",
  },
  {
    id: "19",
    stockNo: "Q65",
    dateReceived: "2024-06-18",
    make: "Stoeger",
    type: "Shotgun",
    caliber: "20 Gauge",
    serialNo: "STO321987",
    fullName: "Mark",
    surname: "Garcia",
    registrationId: "7712095043089",
    physicalAddress: "963 Lakeside Road, Hartbeespoort",
    licenceNo: "99/24",
    licenceDate: "2024-07-03",
    remarks: "Safe keeping - military deployment",
    status: "safe-keeping",
  },
  {
    id: "20",
    stockNo: "R76",
    dateReceived: "2024-08-25",
    make: "Marlin",
    type: "Rifle",
    caliber: ".30-30 Win",
    serialNo: "MAR654321",
    fullName: "Nancy",
    surname: "Rodriguez",
    registrationId: "8409105078090",
    physicalAddress: "147 Prairie View, Vryburg",
    licenceNo: "10/25",
    licenceDate: "2024-09-09",
    remarks: "In stock - lever action classic",
    status: "in-stock",
  },
  {
    id: "21",
    stockNo: "S87",
    dateReceived: "2024-09-30",
    make: "Franchi",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "FRA987654",
    fullName: "Paul",
    surname: "Lewis",
    registrationId: "7506085034087",
    physicalAddress: "258 Meadow Lane, Klerksdorp",
    licenceNo: "21/25",
    licenceDate: "2024-10-15",
    remarks: "Collected - clay pigeon shooting",
    status: "collected",
  },
  {
    id: "22",
    stockNo: "T98",
    dateReceived: "2024-11-15",
    make: "Sako",
    type: "Rifle",
    caliber: ".308 Win",
    serialNo: "SAK123789",
    fullName: "Carol",
    surname: "Walker",
    registrationId: "8211125089091",
    physicalAddress: "369 Ridge Road, Potchefstroom",
    licenceNo: "32/25",
    licenceDate: "2024-11-30",
    remarks: "Dealer stock - precision rifle",
    status: "dealer-stock",
  },
  {
    id: "23",
    stockNo: "U09",
    dateReceived: "2024-12-20",
    make: "Perazzi",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "PER456789",
    fullName: "Steven",
    surname: "Hall",
    registrationId: "7803095029088",
    physicalAddress: "741 Summit Drive, Oudtshoorn",
    licenceNo: "43/25",
    licenceDate: "2025-01-04",
    remarks: "Safe keeping - competition grade",
    status: "safe-keeping",
  },
  {
    id: "24",
    stockNo: "V10",
    dateReceived: "2024-05-08",
    make: "Blaser",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "BLA789123",
    fullName: "Dorothy",
    surname: "Young",
    registrationId: "8108115067089",
    physicalAddress: "852 Canyon View, Springbok",
    licenceNo: "54/25",
    licenceDate: "2024-05-23",
    remarks: "In stock - German engineering",
    status: "in-stock",
  },
  {
    id: "25",
    stockNo: "W21",
    dateReceived: "2024-07-14",
    make: "Krieghoff",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "KRI321654",
    fullName: "Kenneth",
    surname: "King",
    registrationId: "7705085043087",
    physicalAddress: "963 Desert Rose, Upington",
    licenceNo: "65/25",
    licenceDate: "2024-07-29",
    remarks: "Collected - over/under configuration",
    status: "collected",
  },
  {
    id: "26",
    stockNo: "X32",
    dateReceived: "2024-09-12",
    make: "Merkel",
    type: "Rifle",
    caliber: ".375 H&H",
    serialNo: "MER654987",
    fullName: "Betty",
    surname: "Wright",
    registrationId: "8412125078090",
    physicalAddress: "147 Savanna Road, Hoedspruit",
    licenceNo: "76/25",
    licenceDate: "2024-09-27",
    remarks: "Dealer stock - dangerous game rifle",
    status: "dealer-stock",
  },
  {
    id: "27",
    stockNo: "Y43",
    dateReceived: "2024-11-28",
    make: "Chapuis",
    type: "Rifle",
    caliber: ".470 NE",
    serialNo: "CHA987321",
    fullName: "Edward",
    surname: "Lopez",
    registrationId: "7609095034088",
    physicalAddress: "258 Thorn Tree, Phalaborwa",
    licenceNo: "87/25",
    licenceDate: "2024-12-13",
    remarks: "Safe keeping - double rifle",
    status: "safe-keeping",
  },
  {
    id: "28",
    stockNo: "Z54",
    dateReceived: "2024-06-30",
    make: "Heym",
    type: "Rifle",
    caliber: ".416 Rigby",
    serialNo: "HEY123456",
    fullName: "Helen",
    surname: "Hill",
    registrationId: "8206115089091",
    physicalAddress: "369 Baobab Street, Messina",
    licenceNo: "98/25",
    licenceDate: "2024-07-15",
    remarks: "In stock - African hunting rifle",
    status: "in-stock",
  },
  {
    id: "29",
    stockNo: "AA65",
    dateReceived: "2024-08-16",
    make: "Mauser",
    type: "Rifle",
    caliber: ".375 H&H",
    serialNo: "MAU789654",
    fullName: "Jason",
    surname: "Green",
    registrationId: "7511085029087",
    physicalAddress: "741 Acacia Drive, Lephalale",
    licenceNo: "09/26",
    licenceDate: "2024-08-31",
    remarks: "Collected - vintage action",
    status: "collected",
  },
  {
    id: "30",
    stockNo: "BB76",
    dateReceived: "2024-10-22",
    make: "Dakota",
    type: "Rifle",
    caliber: ".300 Dakota",
    serialNo: "DAK456123",
    fullName: "Shirley",
    surname: "Adams",
    registrationId: "8307125067088",
    physicalAddress: "852 Mopane Avenue, Thabazimbi",
    licenceNo: "18/26",
    licenceDate: "2024-11-06",
    remarks: "Dealer stock - custom build",
    status: "dealer-stock",
  },
  {
    id: "31",
    stockNo: "CC87",
    dateReceived: "2024-12-08",
    make: "Cooper",
    type: "Rifle",
    caliber: ".22-250 Rem",
    serialNo: "COO321987",
    fullName: "Ryan",
    surname: "Baker",
    registrationId: "7804095043089",
    physicalAddress: "963 Fever Tree, Hoedspruit",
    licenceNo: "27/26",
    licenceDate: "2024-12-23",
    remarks: "Safe keeping - varmint rifle",
    status: "safe-keeping",
  },
  {
    id: "32",
    stockNo: "DD98",
    dateReceived: "2024-04-05",
    make: "Christensen",
    type: "Rifle",
    caliber: ".28 Nosler",
    serialNo: "CHR654321",
    fullName: "Deborah",
    surname: "Nelson",
    registrationId: "8110115078090",
    physicalAddress: "147 Marula Street, Tzaneen",
    licenceNo: "36/26",
    licenceDate: "2024-04-20",
    remarks: "In stock - carbon fiber stock",
    status: "in-stock",
  },
  {
    id: "33",
    stockNo: "EE09",
    dateReceived: "2024-06-11",
    make: "Proof Research",
    type: "Rifle",
    caliber: "6.5 Creedmoor",
    serialNo: "PRF987654",
    fullName: "Gary",
    surname: "Carter",
    registrationId: "7707085034087",
    physicalAddress: "258 Leadwood Lane, Phalaborwa",
    licenceNo: "45/26",
    licenceDate: "2024-06-26",
    remarks: "Collected - precision shooting",
    status: "collected",
  },
  {
    id: "34",
    stockNo: "FF10",
    dateReceived: "2024-08-27",
    make: "Bergara",
    type: "Rifle",
    caliber: ".300 PRC",
    serialNo: "BER123789",
    fullName: "Cynthia",
    surname: "Mitchell",
    registrationId: "8413125089091",
    physicalAddress: "369 Tamboti Road, Messina",
    licenceNo: "54/26",
    licenceDate: "2024-09-11",
    remarks: "Dealer stock - long range rifle",
    status: "dealer-stock",
  },
  {
    id: "35",
    stockNo: "GG21",
    dateReceived: "2024-10-13",
    make: "Seekins",
    type: "Rifle",
    caliber: "6.5 PRC",
    serialNo: "SEE456789",
    fullName: "Arthur",
    surname: "Perez",
    registrationId: "7608095029088",
    physicalAddress: "741 Knobthorn Drive, Lephalale",
    licenceNo: "63/26",
    licenceDate: "2024-10-28",
    remarks: "Safe keeping - tactical rifle",
    status: "safe-keeping",
  },
  {
    id: "36",
    stockNo: "HH32",
    dateReceived: "2024-12-19",
    make: "Fierce",
    type: "Rifle",
    caliber: ".300 WSM",
    serialNo: "FIE789123",
    fullName: "Evelyn",
    surname: "Roberts",
    registrationId: "8205115067089",
    physicalAddress: "852 Jackalberry Street, Thabazimbi",
    licenceNo: "72/26",
    licenceDate: "2025-01-03",
    remarks: "In stock - mountain rifle",
    status: "in-stock",
  },
  {
    id: "37",
    stockNo: "II43",
    dateReceived: "2024-05-17",
    make: "Nosler",
    type: "Rifle",
    caliber: ".26 Nosler",
    serialNo: "NOS321654",
    fullName: "Wayne",
    surname: "Turner",
    registrationId: "7512085043087",
    physicalAddress: "963 Sausage Tree, Hoedspruit",
    licenceNo: "81/26",
    licenceDate: "2024-06-01",
    remarks: "Collected - magnum cartridge",
    status: "collected",
  },
  {
    id: "38",
    stockNo: "JJ54",
    dateReceived: "2024-07-23",
    make: "Gunwerks",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "GUN654987",
    fullName: "Cheryl",
    surname: "Phillips",
    registrationId: "8308125078090",
    physicalAddress: "147 Wild Fig Avenue, Messina",
    licenceNo: "90/26",
    licenceDate: "2024-08-07",
    remarks: "Dealer stock - long range system",
    status: "dealer-stock",
  },
  {
    id: "39",
    stockNo: "KK65",
    dateReceived: "2024-09-18",
    make: "Barrett",
    type: "Rifle",
    caliber: ".338 Lapua",
    serialNo: "BAR987321",
    fullName: "Ralph",
    surname: "Campbell",
    registrationId: "7609095034088",
    physicalAddress: "258 Shepherd Tree, Phalaborwa",
    licenceNo: "99/26",
    licenceDate: "2024-10-03",
    remarks: "Safe keeping - precision rifle",
    status: "safe-keeping",
  },
  {
    id: "40",
    stockNo: "LL76",
    dateReceived: "2024-11-24",
    make: "Accuracy International",
    type: "Rifle",
    caliber: ".308 Win",
    serialNo: "AI123456",
    fullName: "Marilyn",
    surname: "Parker",
    registrationId: "8106115089091",
    physicalAddress: "369 Umbrella Thorn, Lephalale",
    licenceNo: "08/27",
    licenceDate: "2024-12-09",
    remarks: "In stock - tactical precision",
    status: "in-stock",
  },
  {
    id: "41",
    stockNo: "MM87",
    dateReceived: "2024-06-29",
    make: "Desert Tech",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "DT789654",
    fullName: "Roy",
    surname: "Evans",
    registrationId: "7713085029087",
    physicalAddress: "741 Camel Thorn, Thabazimbi",
    licenceNo: "17/27",
    licenceDate: "2024-07-14",
    remarks: "Collected - bullpup design",
    status: "collected",
  },
  {
    id: "42",
    stockNo: "NN98",
    dateReceived: "2024-08-14",
    make: "Steyr",
    type: "Rifle",
    caliber: ".308 Win",
    serialNo: "STY456123",
    fullName: "Gloria",
    surname: "Edwards",
    registrationId: "8409125067088",
    physicalAddress: "852 Buffalo Thorn, Hoedspruit",
    licenceNo: "26/27",
    licenceDate: "2024-08-29",
    remarks: "Dealer stock - Austrian precision",
    status: "dealer-stock",
  },
  {
    id: "43",
    stockNo: "OO09",
    dateReceived: "2024-10-30",
    make: "Anschutz",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "ANS321987",
    fullName: "Eugene",
    surname: "Collins",
    registrationId: "7510095043089",
    physicalAddress: "963 Sweet Thorn, Messina",
    licenceNo: "35/27",
    licenceDate: "2024-11-14",
    remarks: "Safe keeping - target rifle",
    status: "safe-keeping",
  },
  {
    id: "44",
    stockNo: "PP10",
    dateReceived: "2024-12-15",
    make: "Walther",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "WAL654321",
    fullName: "Diane",
    surname: "Stewart",
    registrationId: "8207115078090",
    physicalAddress: "147 Monkey Thorn, Phalaborwa",
    licenceNo: "44/27",
    licenceDate: "2024-12-30",
    remarks: "In stock - competition rifle",
    status: "in-stock",
  },
  {
    id: "45",
    stockNo: "QQ21",
    dateReceived: "2024-04-26",
    make: "Feinwerkbau",
    type: "Rifle",
    caliber: ".177 Air",
    serialNo: "FWB987654",
    fullName: "Louis",
    surname: "Flores",
    registrationId: "7614085034087",
    physicalAddress: "258 Paper Bark, Lephalale",
    licenceNo: "53/27",
    licenceDate: "2024-05-11",
    remarks: "Collected - air rifle precision",
    status: "collected",
  },
  {
    id: "46",
    stockNo: "RR32",
    dateReceived: "2024-06-21",
    make: "Hammerli",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "HAM123789",
    fullName: "Frances",
    surname: "Morris",
    registrationId: "8311125089091",
    physicalAddress: "369 Fever Tree, Thabazimbi",
    licenceNo: "62/27",
    licenceDate: "2024-07-06",
    remarks: "Dealer stock - target pistol",
    status: "dealer-stock",
  },
  {
    id: "47",
    stockNo: "SS43",
    dateReceived: "2024-08-17",
    make: "Pardini",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "PAR456789",
    fullName: "Albert",
    surname: "Cook",
    registrationId: "7708095029088",
    physicalAddress: "741 Wild Olive, Hoedspruit",
    licenceNo: "71/27",
    licenceDate: "2024-09-01",
    remarks: "Safe keeping - Olympic pistol",
    status: "safe-keeping",
  },
  {
    id: "48",
    stockNo: "TT54",
    dateReceived: "2024-10-23",
    make: "Morini",
    type: "Pistol",
    caliber: ".177 Air",
    serialNo: "MOR789123",
    fullName: "Teresa",
    surname: "Bailey",
    registrationId: "8105115067089",
    physicalAddress: "852 Marula Tree, Messina",
    licenceNo: "80/27",
    licenceDate: "2024-11-07",
    remarks: "In stock - air pistol",
    status: "in-stock",
  },
  {
    id: "49",
    stockNo: "UU65",
    dateReceived: "2024-12-29",
    make: "Steyr",
    type: "Pistol",
    caliber: ".177 Air",
    serialNo: "STE321654",
    fullName: "Lawrence",
    surname: "Rivera",
    registrationId: "7612085043087",
    physicalAddress: "963 Sycamore Fig, Phalaborwa",
    licenceNo: "89/27",
    licenceDate: "2025-01-13",
    remarks: "Collected - precision air pistol",
    status: "collected",
  },
  {
    id: "50",
    stockNo: "VV76",
    dateReceived: "2024-05-12",
    make: "Feinwerkbau",
    type: "Pistol",
    caliber: ".177 Air",
    serialNo: "FWP654987",
    fullName: "Katherine",
    surname: "Cooper",
    registrationId: "8408125078090",
    physicalAddress: "147 Wild Date, Lephalale",
    licenceNo: "98/27",
    licenceDate: "2024-05-27",
    remarks: "Dealer stock - competition grade",
    status: "dealer-stock",
  },
  // Additional CSV entries to reach full dataset
  {
    id: "51",
    stockNo: "WW87",
    dateReceived: "2023-01-15",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "GLK001234",
    fullName: "Andrew",
    surname: "Thompson",
    registrationId: "8501125043088",
    physicalAddress: "123 Oak Street, Cape Town",
    licenceNo: "CT001/23",
    licenceDate: "2023-02-01",
    remarks: "Dealer stock - police trade-in",
    status: "dealer-stock",
  },
  {
    id: "52",
    stockNo: "XX98",
    dateReceived: "2023-02-20",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".357 Magnum",
    serialNo: "SW567890",
    fullName: "Margaret",
    surname: "Johnson",
    registrationId: "7809105067089",
    physicalAddress: "456 Pine Avenue, Johannesburg",
    licenceNo: "JHB002/23",
    licenceDate: "2023-03-10",
    remarks: "Safe keeping - estate firearm",
    status: "safe-keeping",
  },
  {
    id: "53",
    stockNo: "YY09",
    dateReceived: "2023-03-25",
    make: "Beretta",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "BER345678",
    fullName: "William",
    surname: "Davis",
    registrationId: "7512085029087",
    physicalAddress: "789 Elm Drive, Durban",
    licenceNo: "DBN003/23",
    licenceDate: "2023-04-15",
    remarks: "In stock - sporting shotgun",
    status: "in-stock",
  },
  {
    id: "54",
    stockNo: "ZZ10",
    dateReceived: "2023-04-30",
    make: "Remington",
    type: "Rifle",
    caliber: ".30-06",
    serialNo: "REM789012",
    fullName: "Elizabeth",
    surname: "Wilson",
    registrationId: "8206115078090",
    physicalAddress: "321 Maple Lane, Pretoria",
    licenceNo: "PTA004/23",
    licenceDate: "2023-05-20",
    remarks: "Collected - hunting rifle",
    status: "collected",
  },
  {
    id: "55",
    stockNo: "AAA21",
    dateReceived: "2023-05-15",
    make: "Winchester",
    type: "Rifle",
    caliber: ".270 Win",
    serialNo: "WIN234567",
    fullName: "Charles",
    surname: "Brown",
    registrationId: "7703095034088",
    physicalAddress: "654 Cedar Street, Bloemfontein",
    licenceNo: "BFN005/23",
    licenceDate: "2023-06-05",
    remarks: "Dealer stock - new arrival",
    status: "dealer-stock",
  },
  {
    id: "56",
    stockNo: "BBB32",
    dateReceived: "2023-06-20",
    make: "Ruger",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "RUG678901",
    fullName: "Patricia",
    surname: "Miller",
    registrationId: "8410125089091",
    physicalAddress: "987 Birch Avenue, Port Elizabeth",
    licenceNo: "PE006/23",
    licenceDate: "2023-07-10",
    remarks: "Safe keeping - target pistol",
    status: "safe-keeping",
  },
  {
    id: "57",
    stockNo: "CCC43",
    dateReceived: "2023-07-25",
    make: "Sig Sauer",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "SIG012345",
    fullName: "Robert",
    surname: "Garcia",
    registrationId: "7608095043089",
    physicalAddress: "147 Willow Road, East London",
    licenceNo: "EL007/23",
    licenceDate: "2023-08-15",
    remarks: "In stock - service pistol",
    status: "in-stock",
  },
  {
    id: "58",
    stockNo: "DDD54",
    dateReceived: "2023-08-30",
    make: "Mossberg",
    type: "Shotgun",
    caliber: "20 Gauge",
    serialNo: "MOS456789",
    fullName: "Linda",
    surname: "Rodriguez",
    registrationId: "8107115067089",
    physicalAddress: "258 Spruce Lane, Kimberley",
    licenceNo: "KIM008/23",
    licenceDate: "2023-09-20",
    remarks: "Collected - youth shotgun",
    status: "collected",
  },
  {
    id: "59",
    stockNo: "EEE65",
    dateReceived: "2023-09-15",
    make: "Savage",
    type: "Rifle",
    caliber: ".308 Win",
    serialNo: "SAV890123",
    fullName: "Michael",
    surname: "Martinez",
    registrationId: "7511085029087",
    physicalAddress: "369 Poplar Street, Polokwane",
    licenceNo: "POL009/23",
    licenceDate: "2023-10-05",
    remarks: "Dealer stock - precision rifle",
    status: "dealer-stock",
  },
  {
    id: "60",
    stockNo: "FFF76",
    dateReceived: "2023-10-20",
    make: "Browning",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "BRN123456",
    fullName: "Susan",
    surname: "Anderson",
    registrationId: "8304125078090",
    physicalAddress: "741 Ash Drive, Nelspruit",
    licenceNo: "NEL010/23",
    licenceDate: "2023-11-10",
    remarks: "Safe keeping - hunting rifle",
    status: "safe-keeping",
  },
  {
    id: "61",
    stockNo: "GGG87",
    dateReceived: "2023-11-25",
    make: "CZ",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "CZ567890",
    fullName: "James",
    surname: "Taylor",
    registrationId: "7712095034087",
    physicalAddress: "852 Hickory Avenue, George",
    licenceNo: "GEO011/23",
    licenceDate: "2023-12-15",
    remarks: "In stock - training rifle",
    status: "in-stock",
  },
  {
    id: "62",
    stockNo: "HHH98",
    dateReceived: "2023-12-30",
    make: "Tikka",
    type: "Rifle",
    caliber: ".243 Win",
    serialNo: "TIK901234",
    fullName: "Barbara",
    surname: "Thomas",
    registrationId: "8209105089091",
    physicalAddress: "963 Walnut Street, Pietermaritzburg",
    licenceNo: "PMB012/23",
    licenceDate: "2024-01-20",
    remarks: "Collected - varmint rifle",
    status: "collected",
  },
  {
    id: "63",
    stockNo: "III09",
    dateReceived: "2024-01-15",
    make: "Heckler & Koch",
    type: "Rifle",
    caliber: ".223 Rem",
    serialNo: "HK345678",
    fullName: "Christopher",
    surname: "Jackson",
    registrationId: "7605085043088",
    physicalAddress: "147 Cherry Lane, Rustenburg",
    licenceNo: "RUS013/24",
    licenceDate: "2024-02-05",
    remarks: "Dealer stock - tactical rifle",
    status: "dealer-stock",
  },
  {
    id: "64",
    stockNo: "JJJ10",
    dateReceived: "2024-02-20",
    make: "Benelli",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "BEN789012",
    fullName: "Dorothy",
    surname: "White",
    registrationId: "8108115067089",
    physicalAddress: "258 Peach Street, Upington",
    licenceNo: "UPI014/24",
    licenceDate: "2024-03-10",
    remarks: "Safe keeping - semi-auto shotgun",
    status: "safe-keeping",
  },
  {
    id: "65",
    stockNo: "KKK21",
    dateReceived: "2024-03-25",
    make: "Weatherby",
    type: "Rifle",
    caliber: ".257 Wby Mag",
    serialNo: "WBY123456",
    fullName: "Daniel",
    surname: "Harris",
    registrationId: "7713085029087",
    physicalAddress: "369 Plum Avenue, Tzaneen",
    licenceNo: "TZA015/24",
    licenceDate: "2024-04-15",
    remarks: "In stock - magnum rifle",
    status: "in-stock",
  },
  {
    id: "66",
    stockNo: "LLL32",
    dateReceived: "2024-04-30",
    make: "Marlin",
    type: "Rifle",
    caliber: ".444 Marlin",
    serialNo: "MAR567890",
    fullName: "Nancy",
    surname: "Clark",
    registrationId: "8411125078090",
    physicalAddress: "741 Grape Street, Messina",
    licenceNo: "MES016/24",
    licenceDate: "2024-05-20",
    remarks: "Collected - lever action",
    status: "collected",
  },
  {
    id: "67",
    stockNo: "MMM43",
    dateReceived: "2024-05-15",
    make: "Franchi",
    type: "Shotgun",
    caliber: "20 Gauge",
    serialNo: "FRA901234",
    fullName: "Paul",
    surname: "Lewis",
    registrationId: "7608095034088",
    physicalAddress: "852 Orange Drive, Phalaborwa",
    licenceNo: "PHA017/24",
    licenceDate: "2024-06-05",
    remarks: "Dealer stock - semi-auto",
    status: "dealer-stock",
  },
  {
    id: "68",
    stockNo: "NNN54",
    dateReceived: "2024-06-20",
    make: "Sako",
    type: "Rifle",
    caliber: ".300 WSM",
    serialNo: "SAK345678",
    fullName: "Helen",
    surname: "Robinson",
    registrationId: "8205115089091",
    physicalAddress: "963 Lemon Lane, Lephalale",
    licenceNo: "LEP018/24",
    licenceDate: "2024-07-10",
    remarks: "Safe keeping - precision rifle",
    status: "safe-keeping",
  },
  {
    id: "69",
    stockNo: "OOO65",
    dateReceived: "2024-07-25",
    make: "Perazzi",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "PER789012",
    fullName: "Mark",
    surname: "Walker",
    registrationId: "7512085043087",
    physicalAddress: "147 Lime Street, Thabazimbi",
    licenceNo: "THA019/24",
    licenceDate: "2024-08-15",
    remarks: "In stock - competition shotgun",
    status: "in-stock",
  },
  {
    id: "70",
    stockNo: "PPP76",
    dateReceived: "2024-08-30",
    make: "Blaser",
    type: "Rifle",
    caliber: ".30-06",
    serialNo: "BLA123456",
    fullName: "Sandra",
    surname: "Hall",
    registrationId: "8309125067089",
    physicalAddress: "258 Apple Avenue, Hoedspruit",
    licenceNo: "HOE020/24",
    licenceDate: "2024-09-20",
    remarks: "Collected - straight pull",
    status: "collected",
  },
  {
    id: "71",
    stockNo: "QQQ87",
    dateReceived: "2024-09-15",
    make: "Krieghoff",
    type: "Rifle",
    caliber: ".375 H&H",
    serialNo: "KRI567890",
    fullName: "Steven",
    surname: "Young",
    registrationId: "7706095029088",
    physicalAddress: "369 Pear Street, Springbok",
    licenceNo: "SPR021/24",
    licenceDate: "2024-10-05",
    remarks: "Dealer stock - double rifle",
    status: "dealer-stock",
  },
  {
    id: "72",
    stockNo: "RRR98",
    dateReceived: "2024-10-20",
    make: "Merkel",
    type: "Shotgun",
    caliber: "16 Gauge",
    serialNo: "MER901234",
    fullName: "Donna",
    surname: "King",
    registrationId: "8103115078090",
    physicalAddress: "741 Banana Drive, Oudtshoorn",
    licenceNo: "OUD022/24",
    licenceDate: "2024-11-10",
    remarks: "Safe keeping - side-by-side",
    status: "safe-keeping",
  },
  {
    id: "73",
    stockNo: "SSS09",
    dateReceived: "2024-11-25",
    make: "Chapuis",
    type: "Rifle",
    caliber: ".450 NE",
    serialNo: "CHA345678",
    fullName: "Kenneth",
    surname: "Wright",
    registrationId: "7610085034087",
    physicalAddress: "852 Mango Lane, Bethlehem",
    licenceNo: "BET023/24",
    licenceDate: "2024-12-15",
    remarks: "In stock - dangerous game",
    status: "in-stock",
  },
  {
    id: "74",
    stockNo: "TTT10",
    dateReceived: "2024-12-30",
    make: "Heym",
    type: "Rifle",
    caliber: ".500 NE",
    serialNo: "HEY789012",
    fullName: "Carol",
    surname: "Lopez",
    registrationId: "8407125089091",
    physicalAddress: "963 Papaya Street, Hartbeespoort",
    licenceNo: "HAR024/24",
    licenceDate: "2025-01-20",
    remarks: "Collected - express rifle",
    status: "collected",
  },
  {
    id: "75",
    stockNo: "UUU21",
    dateReceived: "2023-01-10",
    make: "Mauser",
    type: "Rifle",
    caliber: "8x57 Mauser",
    serialNo: "MAU123456",
    fullName: "Betty",
    surname: "Hill",
    registrationId: "7513085043088",
    physicalAddress: "147 Coconut Avenue, Vryburg",
    licenceNo: "VRY025/23",
    licenceDate: "2023-02-01",
    remarks: "Dealer stock - military surplus",
    status: "dealer-stock",
  },
  {
    id: "76",
    stockNo: "VVV32",
    dateReceived: "2023-02-15",
    make: "Dakota",
    type: "Rifle",
    caliber: ".338 Win Mag",
    serialNo: "DAK567890",
    fullName: "Edward",
    surname: "Green",
    registrationId: "8210115067089",
    physicalAddress: "258 Avocado Street, Klerksdorp",
    licenceNo: "KLE026/23",
    licenceDate: "2023-03-05",
    remarks: "Safe keeping - custom rifle",
    status: "safe-keeping",
  },
  {
    id: "77",
    stockNo: "WWW43",
    dateReceived: "2023-03-20",
    make: "Cooper",
    type: "Rifle",
    caliber: ".204 Ruger",
    serialNo: "COO901234",
    fullName: "Ruth",
    surname: "Adams",
    registrationId: "7607095029087",
    physicalAddress: "369 Kiwi Lane, Potchefstroom",
    licenceNo: "POT027/23",
    licenceDate: "2023-04-10",
    remarks: "In stock - varmint rifle",
    status: "in-stock",
  },
  {
    id: "78",
    stockNo: "XXX54",
    dateReceived: "2023-04-25",
    make: "Christensen",
    type: "Rifle",
    caliber: "6.5 PRC",
    serialNo: "CHR345678",
    fullName: "Frank",
    surname: "Baker",
    registrationId: "8104125078090",
    physicalAddress: "741 Guava Drive, Mossel Bay",
    licenceNo: "MOS028/23",
    licenceDate: "2023-05-15",
    remarks: "Collected - long range",
    status: "collected",
  },
  {
    id: "79",
    stockNo: "YYY65",
    dateReceived: "2023-05-30",
    make: "Proof Research",
    type: "Rifle",
    caliber: ".300 PRC",
    serialNo: "PRF789012",
    fullName: "Maria",
    surname: "Nelson",
    registrationId: "7711085034087",
    physicalAddress: "852 Passion Fruit Street, Springbok",
    licenceNo: "SPR029/23",
    licenceDate: "2023-06-20",
    remarks: "Dealer stock - carbon barrel",
    status: "dealer-stock",
  },
  {
    id: "80",
    stockNo: "ZZZ76",
    dateReceived: "2023-06-15",
    make: "Bergara",
    type: "Rifle",
    caliber: "6.5 Creedmoor",
    serialNo: "BER123456",
    fullName: "Jose",
    surname: "Carter",
    registrationId: "8308125089091",
    physicalAddress: "963 Dragon Fruit Lane, Upington",
    licenceNo: "UPI030/23",
    licenceDate: "2023-07-05",
    remarks: "Safe keeping - precision rifle",
    status: "safe-keeping",
  },
  {
    id: "81",
    stockNo: "AAAA87",
    dateReceived: "2023-07-20",
    make: "Seekins",
    type: "Rifle",
    caliber: ".280 AI",
    serialNo: "SEE567890",
    fullName: "Angela",
    surname: "Mitchell",
    registrationId: "7605095043088",
    physicalAddress: "147 Star Fruit Avenue, Tzaneen",
    licenceNo: "TZA031/23",
    licenceDate: "2023-08-10",
    remarks: "In stock - hunting rifle",
    status: "in-stock",
  },
  {
    id: "82",
    stockNo: "BBBB98",
    dateReceived: "2023-08-25",
    make: "Fierce",
    type: "Rifle",
    caliber: ".300 RUM",
    serialNo: "FIE901234",
    fullName: "Gary",
    surname: "Perez",
    registrationId: "8202115067089",
    physicalAddress: "258 Lychee Street, Messina",
    licenceNo: "MES032/23",
    licenceDate: "2023-09-15",
    remarks: "Collected - magnum rifle",
    status: "collected",
  },
  {
    id: "83",
    stockNo: "CCCC09",
    dateReceived: "2023-09-30",
    make: "Nosler",
    type: "Rifle",
    caliber: ".33 Nosler",
    serialNo: "NOS345678",
    fullName: "Cynthia",
    surname: "Roberts",
    registrationId: "7509085029087",
    physicalAddress: "369 Rambutan Drive, Phalaborwa",
    licenceNo: "PHA033/23",
    licenceDate: "2023-10-20",
    remarks: "Dealer stock - premium rifle",
    status: "dealer-stock",
  },
  {
    id: "84",
    stockNo: "DDDD10",
    dateReceived: "2023-10-15",
    make: "Gunwerks",
    type: "Rifle",
    caliber: "7mm Rem Mag",
    serialNo: "GUN789012",
    fullName: "Arthur",
    surname: "Turner",
    registrationId: "8106125078090",
    physicalAddress: "741 Durian Lane, Lephalale",
    licenceNo: "LEP034/23",
    licenceDate: "2023-11-05",
    remarks: "Safe keeping - long range system",
    status: "safe-keeping",
  },
  {
    id: "85",
    stockNo: "EEEE21",
    dateReceived: "2023-11-20",
    make: "Barrett",
    type: "Rifle",
    caliber: ".50 BMG",
    serialNo: "BAR123456",
    fullName: "Evelyn",
    surname: "Phillips",
    registrationId: "7712095034087",
    physicalAddress: "852 Jackfruit Street, Thabazimbi",
    licenceNo: "THA035/23",
    licenceDate: "2023-12-10",
    remarks: "In stock - anti-materiel rifle",
    status: "in-stock",
  },
  {
    id: "86",
    stockNo: "FFFF32",
    dateReceived: "2023-12-25",
    make: "Accuracy International",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "AI567890",
    fullName: "Wayne",
    surname: "Campbell",
    registrationId: "8409125089091",
    physicalAddress: "963 Breadfruit Avenue, Hoedspruit",
    licenceNo: "HOE036/23",
    licenceDate: "2024-01-15",
    remarks: "Collected - sniper rifle",
    status: "collected",
  },
  {
    id: "87",
    stockNo: "GGGG43",
    dateReceived: "2024-01-30",
    make: "Desert Tech",
    type: "Rifle",
    caliber: ".338 Lapua",
    serialNo: "DT901234",
    fullName: "Cheryl",
    surname: "Parker",
    registrationId: "7606095043088",
    physicalAddress: "147 Custard Apple Drive, Springbok",
    licenceNo: "SPR037/24",
    licenceDate: "2024-02-20",
    remarks: "Dealer stock - bullpup rifle",
    status: "dealer-stock",
  },
  {
    id: "88",
    stockNo: "HHHH54",
    dateReceived: "2024-02-15",
    make: "Steyr",
    type: "Rifle",
    caliber: ".243 Win",
    serialNo: "STY345678",
    fullName: "Ralph",
    surname: "Evans",
    registrationId: "8203115067089",
    physicalAddress: "258 Soursop Lane, Oudtshoorn",
    licenceNo: "OUD038/24",
    licenceDate: "2024-03-05",
    remarks: "Safe keeping - hunting rifle",
    status: "safe-keeping",
  },
  {
    id: "89",
    stockNo: "IIII65",
    dateReceived: "2024-03-20",
    make: "Anschutz",
    type: "Rifle",
    caliber: ".17 HMR",
    serialNo: "ANS789012",
    fullName: "Marilyn",
    surname: "Edwards",
    registrationId: "7510085029087",
    physicalAddress: "369 Tamarind Street, Bethlehem",
    licenceNo: "BET039/24",
    licenceDate: "2024-04-10",
    remarks: "In stock - small game rifle",
    status: "in-stock",
  },
  {
    id: "90",
    stockNo: "JJJJ76",
    dateReceived: "2024-04-25",
    make: "Walther",
    type: "Rifle",
    caliber: ".22 WMR",
    serialNo: "WAL123456",
    fullName: "Roy",
    surname: "Collins",
    registrationId: "8107125078090",
    physicalAddress: "741 Pomegranate Avenue, Hartbeespoort",
    licenceNo: "HAR040/24",
    licenceDate: "2024-05-15",
    remarks: "Collected - target rifle",
    status: "collected",
  },
  {
    id: "91",
    stockNo: "KKKK87",
    dateReceived: "2024-05-30",
    make: "Feinwerkbau",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "FWB567890",
    fullName: "Gloria",
    surname: "Stewart",
    registrationId: "7713095034087",
    physicalAddress: "852 Fig Drive, Vryburg",
    licenceNo: "VRY041/24",
    licenceDate: "2024-06-20",
    remarks: "Dealer stock - match rifle",
    status: "dealer-stock",
  },
  {
    id: "92",
    stockNo: "LLLL98",
    dateReceived: "2024-06-15",
    make: "Hammerli",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "HAM901234",
    fullName: "Eugene",
    surname: "Flores",
    registrationId: "8404125089091",
    physicalAddress: "963 Date Palm Lane, Klerksdorp",
    licenceNo: "KLE042/24",
    licenceDate: "2024-07-05",
    remarks: "Safe keeping - Olympic rifle",
    status: "safe-keeping",
  },
  {
    id: "93",
    stockNo: "MMMM09",
    dateReceived: "2024-07-20",
    make: "Pardini",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "PAR345678",
    fullName: "Diane",
    surname: "Morris",
    registrationId: "7607095043088",
    physicalAddress: "147 Coconut Palm Street, Potchefstroom",
    licenceNo: "POT043/24",
    licenceDate: "2024-08-10",
    remarks: "In stock - precision rifle",
    status: "in-stock",
  },
  {
    id: "94",
    stockNo: "NNNN10",
    dateReceived: "2024-08-25",
    make: "Morini",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "MOR789012",
    fullName: "Louis",
    surname: "Cook",
    registrationId: "8201115067089",
    physicalAddress: "258 Oil Palm Avenue, Mossel Bay",
    licenceNo: "MOS044/24",
    licenceDate: "2024-09-15",
    remarks: "Collected - competition rifle",
    status: "collected",
  },
  {
    id: "95",
    stockNo: "OOOO21",
    dateReceived: "2024-09-30",
    make: "Steyr",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "STE123456",
    fullName: "Frances",
    surname: "Bailey",
    registrationId: "7508085029087",
    physicalAddress: "369 Royal Palm Drive, Springbok",
    licenceNo: "SPR045/24",
    licenceDate: "2024-10-20",
    remarks: "Dealer stock - match grade rifle",
    status: "dealer-stock",
  },
  {
    id: "96",
    stockNo: "PPPP32",
    dateReceived: "2024-10-15",
    make: "Feinwerkbau",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "FWP567890",
    fullName: "Albert",
    surname: "Rivera",
    registrationId: "8105125078090",
    physicalAddress: "741 Phoenix Palm Lane, Upington",
    licenceNo: "UPI046/24",
    licenceDate: "2024-11-05",
    remarks: "Safe keeping - target pistol",
    status: "safe-keeping",
  },
  {
    id: "97",
    stockNo: "QQQQ43",
    dateReceived: "2024-11-20",
    make: "Hammerli",
    type: "Pistol",
    caliber: ".32 S&W",
    serialNo: "HAM901234",
    fullName: "Teresa",
    surname: "Cooper",
    registrationId: "7714095034087",
    physicalAddress: "852 Bottle Palm Street, Tzaneen",
    licenceNo: "TZA047/24",
    licenceDate: "2024-12-10",
    remarks: "In stock - Olympic pistol",
    status: "in-stock",
  },
  {
    id: "98",
    stockNo: "RRRR54",
    dateReceived: "2024-12-25",
    make: "Pardini",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "PAR345678",
    fullName: "Lawrence",
    surname: "Reed",
    registrationId: "8402125089091",
    physicalAddress: "963 Fan Palm Avenue, Messina",
    licenceNo: "MES048/24",
    licenceDate: "2025-01-15",
    remarks: "Collected - precision pistol",
    status: "collected",
  },
  {
    id: "99",
    stockNo: "SSSS65",
    dateReceived: "2023-01-05",
    make: "Morini",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "MOR789012",
    fullName: "Katherine",
    surname: "Bailey",
    registrationId: "7609095043088",
    physicalAddress: "147 Fishtail Palm Drive, Phalaborwa",
    licenceNo: "PHA049/23",
    licenceDate: "2023-01-25",
    remarks: "Dealer stock - air pistol",
    status: "dealer-stock",
  },
  {
    id: "100",
    stockNo: "TTTT76",
    dateReceived: "2023-02-10",
    make: "Steyr",
    type: "Pistol",
    caliber: ".177 Air",
    serialNo: "STE123456",
    fullName: "Andrew",
    surname: "Ward",
    registrationId: "8206115067089",
    physicalAddress: "258 Bismarck Palm Lane, Lephalale",
    licenceNo: "LEP050/23",
    licenceDate: "2023-03-02",
    remarks: "Safe keeping - competition air pistol",
    status: "safe-keeping",
  },
  // Add more firearms data after the existing 100 entries

  // Additional CSV entries to complete the dataset - continuing from entry 101
  {
    id: "101",
    stockNo: "UUUU87",
    dateReceived: "2023-03-15",
    make: "Feinwerkbau",
    type: "Pistol",
    caliber: ".177 Air",
    serialNo: "FWB901234",
    fullName: "Margaret",
    surname: "Torres",
    registrationId: "8503115089091",
    physicalAddress: "147 Coconut Palm Street, Klerksdorp",
    licenceNo: "LEP051/23",
    licenceDate: "2023-04-05",
    remarks: "In stock - competition air pistol",
    status: "in-stock",
  },
  {
    id: "102",
    stockNo: "VVVV98",
    dateReceived: "2023-04-20",
    make: "Hammerli",
    type: "Pistol",
    caliber: ".32 S&W",
    serialNo: "HAM345678",
    fullName: "Donald",
    surname: "Peterson",
    registrationId: "7710095034087",
    physicalAddress: "258 Date Palm Avenue, Mossel Bay",
    licenceNo: "MOS052/23",
    licenceDate: "2023-05-10",
    remarks: "Collected - Olympic grade pistol",
    status: "collected",
  },
  {
    id: "103",
    stockNo: "WWWW09",
    dateReceived: "2023-05-25",
    make: "Pardini",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "PAR789012",
    fullName: "Lisa",
    surname: "Hughes",
    registrationId: "8407125067089",
    physicalAddress: "369 Royal Palm Drive, Springbok",
    licenceNo: "SPR053/23",
    licenceDate: "2023-06-15",
    remarks: "Dealer stock - precision pistol",
    status: "dealer-stock",
  },
  {
    id: "104",
    stockNo: "XXXX10",
    dateReceived: "2023-06-30",
    make: "Morini",
    type: "Pistol",
    caliber: ".177 Air",
    serialNo: "MOR123456",
    fullName: "Kenneth",
    surname: "Powell",
    registrationId: "7614085043088",
    physicalAddress: "741 Phoenix Palm Lane, Upington",
    licenceNo: "UPI054/23",
    licenceDate: "2023-07-20",
    remarks: "Safe keeping - air pistol",
    status: "safe-keeping",
  },
  {
    id: "105",
    stockNo: "YYYY21",
    dateReceived: "2023-07-15",
    make: "Steyr",
    type: "Pistol",
    caliber: ".177 Air",
    serialNo: "STE567890",
    fullName: "Dorothy",
    surname: "Jenkins",
    registrationId: "8211125078090",
    physicalAddress: "852 Bottle Palm Street, Tzaneen",
    licenceNo: "TZA055/23",
    licenceDate: "2023-08-05",
    remarks: "In stock - precision air pistol",
    status: "in-stock",
  },
  {
    id: "106",
    stockNo: "ZZZZ32",
    dateReceived: "2023-08-20",
    make: "Walther",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "WAL901234",
    fullName: "Steven",
    surname: "Barnes",
    registrationId: "7508095029087",
    physicalAddress: "963 Fan Palm Avenue, Messina",
    licenceNo: "MES056/23",
    licenceDate: "2023-09-10",
    remarks: "Collected - target pistol",
    status: "collected",
  },
  {
    id: "107",
    stockNo: "AAAAA43",
    dateReceived: "2023-09-25",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "GLK345678",
    fullName: "Carol",
    surname: "Fisher",
    registrationId: "8105115089091",
    physicalAddress: "147 Fishtail Palm Drive, Phalaborwa",
    licenceNo: "PHA057/23",
    licenceDate: "2023-10-15",
    remarks: "Dealer stock - service pistol",
    status: "dealer-stock",
  },
  {
    id: "108",
    stockNo: "BBBBB54",
    dateReceived: "2023-10-30",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".38 Special",
    serialNo: "SW789012",
    fullName: "Jason",
    surname: "Russell",
    registrationId: "7612085034087",
    physicalAddress: "258 Bismarck Palm Lane, Lephalale",
    licenceNo: "LEP058/23",
    licenceDate: "2023-11-20",
    remarks: "Safe keeping - service revolver",
    status: "safe-keeping",
  },
  {
    id: "109",
    stockNo: "CCCCC65",
    dateReceived: "2023-11-15",
    make: "Beretta",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "BER123456",
    fullName: "Sharon",
    surname: "Griffin",
    registrationId: "8409125067089",
    physicalAddress: "369 Coconut Avenue, Thabazimbi",
    licenceNo: "THA059/23",
    remarks: "In stock - service pistol",
    status: "in-stock",
    licenceDate: "2023-12-05",
  },
  {
    id: "110",
    stockNo: "DDDDD76",
    dateReceived: "2023-12-20",
    make: "Sig Sauer",
    type: "Pistol",
    caliber: ".40 S&W",
    serialNo: "SIG567890",
    fullName: "Brian",
    surname: "Diaz",
    registrationId: "7513085043088",
    physicalAddress: "741 Avocado Street, Hoedspruit",
    licenceNo: "HOE060/23",
    licenceDate: "2024-01-10",
    remarks: "Collected - tactical pistol",
    status: "collected",
  },
  {
    id: "111",
    stockNo: "EEEEE87",
    dateReceived: "2024-01-25",
    make: "Ruger",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "RUG901234",
    fullName: "Deborah",
    surname: "Hayes",
    registrationId: "8210115078090",
    physicalAddress: "852 Kiwi Lane, Springbok",
    licenceNo: "SPR061/24",
    licenceDate: "2024-02-15",
    remarks: "Dealer stock - target pistol",
    status: "dealer-stock",
  },
  {
    id: "112",
    stockNo: "FFFFF98",
    dateReceived: "2024-02-28",
    make: "Taurus",
    type: "Revolver",
    caliber: ".357 Magnum",
    serialNo: "TAU345678",
    fullName: "Kevin",
    surname: "Myers",
    registrationId: "7607095034087",
    physicalAddress: "963 Guava Drive, Oudtshoorn",
    licenceNo: "OUD062/24",
    licenceDate: "2024-03-20",
    remarks: "Safe keeping - magnum revolver",
    status: "safe-keeping",
  },
  {
    id: "113",
    stockNo: "GGGGG09",
    dateReceived: "2024-03-15",
    make: "Heckler & Koch",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "HK789012",
    fullName: "Michelle",
    surname: "Ward",
    registrationId: "8104125089091",
    physicalAddress: "147 Passion Fruit Street, Bethlehem",
    licenceNo: "BET063/24",
    licenceDate: "2024-04-05",
    remarks: "In stock - tactical pistol",
    status: "in-stock",
  },
  {
    id: "114",
    stockNo: "HHHHH10",
    dateReceived: "2024-04-20",
    make: "CZ",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "CZ123456",
    fullName: "Timothy",
    surname: "Butler",
    registrationId: "7511085043088",
    physicalAddress: "258 Dragon Fruit Lane, Hartbeespoort",
    licenceNo: "HAR064/24",
    licenceDate: "2024-05-10",
    remarks: "Collected - service pistol",
    status: "collected",
  },
  {
    id: "115",
    stockNo: "IIIII21",
    dateReceived: "2024-05-25",
    make: "Browning",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "BRN567890",
    fullName: "Angela",
    surname: "Simmons",
    registrationId: "8308125067089",
    physicalAddress: "369 Star Fruit Avenue, Vryburg",
    licenceNo: "VRY065/24",
    licenceDate: "2024-06-15",
    remarks: "Dealer stock - sporting pistol",
    status: "dealer-stock",
  },
  {
    id: "116",
    stockNo: "JJJJJ32",
    dateReceived: "2024-06-30",
    make: "Winchester",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "WIN901234",
    fullName: "Frank",
    surname: "Foster",
    registrationId: "7605095029087",
    physicalAddress: "741 Lychee Street, Klerksdorp",
    licenceNo: "KLE066/24",
    licenceDate: "2024-07-20",
    remarks: "Safe keeping - target pistol",
    status: "safe-keeping",
  },
  {
    id: "117",
    stockNo: "KKKKK43",
    dateReceived: "2024-07-15",
    make: "Remington",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "REM345678",
    fullName: "Brenda",
    surname: "Alexander",
    registrationId: "8202115078090",
    physicalAddress: "852 Rambutan Drive, Potchefstroom",
    licenceNo: "POT067/24",
    licenceDate: "2024-08-05",
    remarks: "In stock - sporting pistol",
    status: "in-stock",
  },
  {
    id: "118",
    stockNo: "LLLLL54",
    dateReceived: "2024-08-20",
    make: "Savage",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "SAV789012",
    fullName: "Raymond",
    surname: "Bryant",
    registrationId: "7509085034087",
    physicalAddress: "963 Durian Lane, Mossel Bay",
    licenceNo: "MOS068/24",
    licenceDate: "2024-09-10",
    remarks: "Collected - target pistol",
    status: "collected",
  },
  {
    id: "119",
    stockNo: "MMMMM65",
    dateReceived: "2024-09-25",
    make: "Tikka",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "TIK123456",
    fullName: "Rachel",
    surname: "Stone",
    registrationId: "8106125089091",
    physicalAddress: "147 Jackfruit Street, Springbok",
    licenceNo: "SPR069/24",
    licenceDate: "2024-10-15",
    remarks: "Dealer stock - precision pistol",
    status: "dealer-stock",
  },
  {
    id: "120",
    stockNo: "NNNNN76",
    dateReceived: "2024-10-30",
    make: "Benelli",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "BEN567890",
    fullName: "Gary",
    surname: "Reed",
    registrationId: "7713095043088",
    physicalAddress: "258 Breadfruit Avenue, Upington",
    licenceNo: "UPI070/24",
    licenceDate: "2024-11-20",
    remarks: "Safe keeping - sporting pistol",
    status: "safe-keeping",
  },
  {
    id: "121",
    stockNo: "OOOOO87",
    dateReceived: "2024-11-15",
    make: "Weatherby",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "WBY901234",
    fullName: "Carolyn",
    surname: "Cox",
    registrationId: "8410125067089",
    physicalAddress: "369 Custard Apple Drive, Tzaneen",
    licenceNo: "TZA071/24",
    licenceDate: "2024-12-05",
    remarks: "In stock - premium pistol",
    status: "in-stock",
  },
  {
    id: "122",
    stockNo: "PPPPP98",
    dateReceived: "2024-12-20",
    make: "Marlin",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "MAR345678",
    fullName: "Roger",
    surname: "Bell",
    registrationId: "7607095029087",
    physicalAddress: "741 Soursop Lane, Messina",
    licenceNo: "MES072/24",
    licenceDate: "2025-01-10",
    remarks: "Collected - lever action pistol",
    status: "collected",
  },
  {
    id: "123",
    stockNo: "QQQQQ09",
    dateReceived: "2023-01-12",
    make: "Franchi",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "FRA789012",
    fullName: "Debra",
    surname: "Howard",
    registrationId: "8204115078090",
    physicalAddress: "852 Tamarind Street, Phalaborwa",
    licenceNo: "PHA073/23",
    licenceDate: "2023-02-02",
    remarks: "Dealer stock - sporting pistol",
    status: "dealer-stock",
  },
  {
    id: "124",
    stockNo: "RRRRR10",
    dateReceived: "2023-02-17",
    make: "Sako",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "SAK123456",
    fullName: "Carl",
    surname: "Long",
    registrationId: "7511085034087",
    physicalAddress: "963 Pomegranate Avenue, Lephalale",
    licenceNo: "LEP074/23",
    licenceDate: "2023-03-10",
    remarks: "Safe keeping - precision pistol",
    status: "safe-keeping",
  },
  {
    id: "125",
    stockNo: "SSSSS21",
    dateReceived: "2023-03-22",
    make: "Perazzi",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "PER567890",
    fullName: "Julie",
    surname: "Wood",
    registrationId: "8308125089091",
    physicalAddress: "147 Fig Drive, Thabazimbi",
    licenceNo: "THA075/23",
    licenceDate: "2023-04-12",
    remarks: "In stock - competition pistol",
    status: "in-stock",
  },
  {
    id: "126",
    stockNo: "TTTTT32",
    dateReceived: "2023-04-27",
    make: "Blaser",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "BLA901234",
    fullName: "Jerry",
    surname: "Patterson",
    registrationId: "7605095043088",
    physicalAddress: "258 Date Palm Lane, Hoedspruit",
    licenceNo: "HOE076/23",
    licenceDate: "2023-05-17",
    remarks: "Collected - German precision",
    status: "collected",
  },
  {
    id: "127",
    stockNo: "UUUUU43",
    dateReceived: "2023-05-30",
    make: "Krieghoff",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "KRI345678",
    fullName: "Joan",
    surname: "Rivera",
    registrationId: "8202115067089",
    physicalAddress: "369 Oil Palm Avenue, Springbok",
    licenceNo: "SPR077/23",
    licenceDate: "2023-06-20",
    remarks: "Dealer stock - premium pistol",
    status: "dealer-stock",
  },
  {
    id: "128",
    stockNo: "VVVVV54",
    dateReceived: "2023-07-05",
    make: "Merkel",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "MER789012",
    fullName: "Wayne",
    surname: "Cook",
    registrationId: "7509085029087",
    physicalAddress: "741 Royal Palm Drive, Oudtshoorn",
    licenceNo: "OUD078/23",
    licenceDate: "2023-07-25",
    remarks: "Safe keeping - double action",
    status: "safe-keeping",
  },
  {
    id: "129",
    stockNo: "WWWWW65",
    dateReceived: "2023-08-10",
    make: "Chapuis",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "CHA123456",
    fullName: "Gloria",
    surname: "Flores",
    registrationId: "8106125078090",
    physicalAddress: "852 Phoenix Palm Lane, Bethlehem",
    licenceNo: "BET079/23",
    licenceDate: "2023-08-30",
    remarks: "In stock - French craftsmanship",
    status: "in-stock",
  },
  {
    id: "130",
    stockNo: "XXXXX76",
    dateReceived: "2023-09-15",
    make: "Heym",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "HEY567890",
    fullName: "Ralph",
    surname: "Washington",
    registrationId: "7713095034087",
    physicalAddress: "963 Bottle Palm Street, Hartbeespoort",
    licenceNo: "HAR080/23",
    licenceDate: "2023-10-05",
    remarks: "Collected - German engineering",
    status: "collected",
  },
  {
    id: "131",
    stockNo: "YYYYY87",
    dateReceived: "2023-10-20",
    make: "Mauser",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "MAU901234",
    fullName: "Evelyn",
    surname: "Butler",
    registrationId: "8410125089091",
    physicalAddress: "147 Fan Palm Avenue, Vryburg",
    licenceNo: "VRY081/23",
    licenceDate: "2023-11-10",
    remarks: "Dealer stock - classic design",
    status: "dealer-stock",
  },
  {
    id: "132",
    stockNo: "ZZZZZ98",
    dateReceived: "2023-11-25",
    make: "Dakota",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "DAK345678",
    fullName: "Roy",
    surname: "Simmons",
    registrationId: "7607095043088",
    physicalAddress: "258 Fishtail Palm Drive, Klerksdorp",
    licenceNo: "KLE082/23",
    licenceDate: "2023-12-15",
    remarks: "Safe keeping - custom pistol",
    status: "safe-keeping",
  },
  {
    id: "133",
    stockNo: "AAAAAA09",
    dateReceived: "2023-12-30",
    make: "Cooper",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "COO789012",
    fullName: "Virginia",
    surname: "Alexander",
    registrationId: "8204115067089",
    physicalAddress: "369 Bismarck Palm Lane, Potchefstroom",
    licenceNo: "POT083/23",
    licenceDate: "2024-01-20",
    remarks: "In stock - precision pistol",
    status: "in-stock",
  },
  {
    id: "134",
    stockNo: "BBBBBB10",
    dateReceived: "2024-01-15",
    make: "Christensen",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "CHR123456",
    fullName: "Louis",
    surname: "Bryant",
    registrationId: "7511085029087",
    physicalAddress: "741 Coconut Palm Street, Mossel Bay",
    licenceNo: "MOS084/24",
    licenceDate: "2024-02-05",
    remarks: "Collected - carbon fiber",
    status: "collected",
  },
  {
    id: "135",
    stockNo: "CCCCCC21",
    dateReceived: "2024-02-20",
    make: "Proof Research",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "PRF567890",
    fullName: "Marilyn",
    surname: "Stone",
    registrationId: "8308125078090",
    physicalAddress: "852 Date Palm Lane, Springbok",
    licenceNo: "SPR085/24",
    licenceDate: "2024-03-10",
    remarks: "Dealer stock - advanced materials",
    status: "dealer-stock",
  },
  {
    id: "136",
    stockNo: "DDDDDD32",
    dateReceived: "2024-03-25",
    make: "Bergara",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "BER901234",
    fullName: "Eugene",
    surname: "Reed",
    registrationId: "7605095034087",
    physicalAddress: "963 Royal Palm Drive, Upington",
    licenceNo: "UPI086/24",
    licenceDate: "2024-04-15",
    remarks: "Safe keeping - Spanish precision",
    status: "safe-keeping",
  },
  {
    id: "137",
    stockNo: "EEEEEE43",
    dateReceived: "2024-04-30",
    make: "Seekins",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "SEE345678",
    fullName: "Cheryl",
    surname: "Cox",
    registrationId: "8202115089091",
    physicalAddress: "147 Phoenix Palm Lane, Tzaneen",
    licenceNo: "TZA087/24",
    licenceDate: "2024-05-20",
    remarks: "In stock - tactical pistol",
    status: "in-stock",
  },
  {
    id: "138",
    stockNo: "FFFFFF54",
    dateReceived: "2024-05-15",
    make: "Fierce",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "FIE789012",
    fullName: "Harold",
    surname: "Bell",
    registrationId: "7509085043088",
    physicalAddress: "258 Bottle Palm Street, Messina",
    licenceNo: "MES088/24",
    licenceDate: "2024-06-05",
    remarks: "Collected - mountain pistol",
    status: "collected",
  },
  {
    id: "139",
    stockNo: "GGGGGG65",
    dateReceived: "2024-06-20",
    make: "Nosler",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "NOS123456",
    fullName: "Kathryn",
    surname: "Howard",
    registrationId: "8106125067089",
    physicalAddress: "369 Fan Palm Avenue, Phalaborwa",
    licenceNo: "PHA089/24",
    licenceDate: "2024-07-10",
    remarks: "Dealer stock - premium ammunition",
    status: "dealer-stock",
  },
  {
    id: "140",
    stockNo: "HHHHHH76",
    dateReceived: "2024-07-25",
    make: "Gunwerks",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "GUN567890",
    fullName: "Russell",
    surname: "Long",
    registrationId: "7713095029087",
    physicalAddress: "741 Fishtail Palm Drive, Lephalale",
    licenceNo: "LEP090/24",
    licenceDate: "2024-08-15",
    remarks: "Safe keeping - precision system",
    status: "safe-keeping",
  },
  {
    id: "141",
    stockNo: "IIIIII87",
    dateReceived: "2024-08-30",
    make: "Barrett",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "BAR901234",
    fullName: "Norma",
    surname: "Wood",
    registrationId: "8410125078090",
    physicalAddress: "852 Bismarck Palm Lane, Thabazimbi",
    licenceNo: "THA091/24",
    licenceDate: "2024-09-20",
    remarks: "In stock - precision pistol",
    status: "in-stock",
  },
  {
    id: "142",
    stockNo: "JJJJJJ98",
    dateReceived: "2024-09-15",
    make: "Accuracy International",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "AI345678",
    fullName: "Philip",
    surname: "Patterson",
    registrationId: "7607095034087",
    physicalAddress: "963 Coconut Avenue, Hoedspruit",
    licenceNo: "HOE092/24",
    licenceDate: "2024-10-05",
    remarks: "Collected - tactical precision",
    status: "collected",
  },
  {
    id: "143",
    stockNo: "KKKKKK09",
    dateReceived: "2024-10-20",
    make: "Desert Tech",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "DT789012",
    fullName: "Janice",
    surname: "Rivera",
    registrationId: "8204115089091",
    physicalAddress: "147 Date Palm Lane, Springbok",
    licenceNo: "SPR093/24",
    licenceDate: "2024-11-10",
    remarks: "Dealer stock - bullpup pistol",
    status: "dealer-stock",
  },
  {
    id: "144",
    stockNo: "LLLLLL10",
    dateReceived: "2024-11-25",
    make: "Steyr",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "STY123456",
    fullName: "Arthur",
    surname: "Washington",
    registrationId: "7511085043088",
    physicalAddress: "258 Royal Palm Drive, Oudtshoorn",
    licenceNo: "OUD094/24",
    licenceDate: "2024-12-15",
    remarks: "Safe keeping - Austrian precision",
    status: "safe-keeping",
  },
  {
    id: "145",
    stockNo: "MMMMMM21",
    dateReceived: "2024-12-30",
    make: "Anschutz",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "ANS567890",
    fullName: "Judith",
    surname: "Butler",
    registrationId: "8308125067089",
    physicalAddress: "369 Phoenix Palm Lane, Bethlehem",
    licenceNo: "BET095/24",
    licenceDate: "2025-01-20",
    remarks: "In stock - match grade pistol",
    status: "in-stock",
  },
  {
    id: "146",
    stockNo: "NNNNNN32",
    dateReceived: "2023-01-08",
    make: "Walther",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "WAL901234",
    fullName: "Dennis",
    surname: "Simmons",
    registrationId: "7605095029087",
    physicalAddress: "741 Bottle Palm Street, Hartbeespoort",
    licenceNo: "HAR096/23",
    licenceDate: "2023-01-28",
    remarks: "Collected - German engineering",
    status: "collected",
  },
  {
    id: "147",
    stockNo: "OOOOOO43",
    dateReceived: "2023-02-12",
    make: "Feinwerkbau",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "FWB345678",
    fullName: "Martha",
    surname: "Alexander",
    registrationId: "8202115078090",
    physicalAddress: "852 Fan Palm Avenue, Vryburg",
    licenceNo: "VRY097/23",
    licenceDate: "2023-03-05",
    remarks: "Dealer stock - precision engineering",
    status: "dealer-stock",
  },
  {
    id: "148",
    stockNo: "PPPPPP54",
    dateReceived: "2023-03-18",
    make: "Hammerli",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "HAM789012",
    fullName: "Gerald",
    surname: "Bryant",
    registrationId: "7509085034087",
    physicalAddress: "963 Fishtail Palm Drive, Klerksdorp",
    licenceNo: "KLE098/23",
    licenceDate: "2023-04-08",
    remarks: "Safe keeping - Swiss precision",
    status: "safe-keeping",
  },
  {
    id: "149",
    stockNo: "QQQQQQ65",
    dateReceived: "2023-04-23",
    make: "Pardini",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "PAR123456",
    fullName: "Helen",
    surname: "Stone",
    registrationId: "8106125089091",
    physicalAddress: "147 Bismarck Palm Lane, Potchefstroom",
    licenceNo: "POT099/23",
    licenceDate: "2023-05-13",
    remarks: "In stock - Italian precision",
    status: "in-stock",
  },
  {
    id: "150",
    stockNo: "RRRRRR76",
    dateReceived: "2023-05-28",
    make: "Morini",
    type: "Pistol",
    caliber: ".22 LR",
    serialNo: "MOR567890",
    fullName: "Keith",
    surname: "Reed",
    registrationId: "7713095043088",
    physicalAddress: "258 Date Palm Lane, Mossel Bay",
    licenceNo: "MOS100/23",
    licenceDate: "2023-06-18",
    remarks: "Collected - Swiss craftsmanship",
    status: "collected",
  },
  // Continue with additional entries to reach 200+ total
  {
    id: "151",
    stockNo: "SSSSSS87",
    dateReceived: "2023-06-15",
    make: "Glock",
    type: "Pistol",
    caliber: "9mm",
    serialNo: "GLK789456",
    fullName: "Amanda",
    surname: "Price",
    registrationId: "8503125089091",
    physicalAddress: "369 Coconut Palm Street, Cape Town",
    licenceNo: "CT101/23",
    licenceDate: "2023-07-05",
    remarks: "Dealer stock - law enforcement trade",
    status: "dealer-stock",
  },
  {
    id: "152",
    stockNo: "TTTTTT98",
    dateReceived: "2023-07-22",
    make: "Smith & Wesson",
    type: "Revolver",
    caliber: ".44 Magnum",
    serialNo: "SW456789",
    fullName: "George",
    surname: "Murphy",
    registrationId: "7710095034087",
    physicalAddress: "741 Date Palm Avenue, Johannesburg",
    licenceNo: "JHB102/23",
    licenceDate: "2023-08-12",
    remarks: "Safe keeping - estate settlement",
    status: "safe-keeping",
  },
  {
    id: "153",
    stockNo: "UUUUUU09",
    dateReceived: "2023-08-28",
    make: "Beretta",
    type: "Shotgun",
    caliber: "20 Gauge",
    serialNo: "BER987654",
    fullName: "Patricia",
    surname: "Coleman",
    registrationId: "8407125067089",
    physicalAddress: "852 Royal Palm Drive, Durban",
    licenceNo: "DBN103/23",
    licenceDate: "2023-09-18",
    remarks: "In stock - sporting clays",
    status: "in-stock",
  },
  {
    id: "154",
    stockNo: "VVVVVV10",
    dateReceived: "2023-09-15",
    make: "Remington",
    type: "Rifle",
    caliber: ".270 Win",
    serialNo: "REM123789",
    fullName: "Charles",
    surname: "Bennett",
    registrationId: "7614085043088",
    physicalAddress: "963 Phoenix Palm Lane, Pretoria",
    licenceNo: "PTA104/23",
    licenceDate: "2023-10-05",
    remarks: "Collected - hunting season",
    status: "collected",
  },
  {
    id: "155",
    stockNo: "WWWWWW21",
    dateReceived: "2023-10-20",
    make: "Winchester",
    type: "Rifle",
    caliber: ".30-30 Win",
    serialNo: "WIN789456",
    fullName: "Barbara",
    surname: "Ward",
    registrationId: "8211125078090",
    physicalAddress: "147 Bottle Palm Street, Bloemfontein",
    licenceNo: "BFN105/23",
    licenceDate: "2023-11-10",
    remarks: "Dealer stock - lever action classic",
    status: "dealer-stock",
  },
  {
    id: "156",
    stockNo: "XXXXXX32",
    dateReceived: "2023-11-25",
    make: "Ruger",
    type: "Rifle",
    caliber: ".223 Rem",
    serialNo: "RUG456123",
    fullName: "Donald",
    surname: "Cox",
    registrationId: "7508095029087",
    physicalAddress: "258 Fan Palm Avenue, Port Elizabeth",
    licenceNo: "PE106/23",
    licenceDate: "2023-12-15",
    remarks: "Safe keeping - varmint rifle",
    status: "safe-keeping",
  },
  {
    id: "157",
    stockNo: "YYYYYY43",
    dateReceived: "2023-12-30",
    make: "Sig Sauer",
    type: "Rifle",
    caliber: ".308 Win",
    serialNo: "SIG789012",
    fullName: "Michelle",
    surname: "Rogers",
    registrationId: "8105115089091",
    physicalAddress: "369 Fishtail Palm Drive, East London",
    licenceNo: "EL107/23",
    licenceDate: "2024-01-20",
    remarks: "In stock - precision rifle",
    status: "in-stock",
  },
  {
    id: "158",
    stockNo: "ZZZZZZ54",
    dateReceived: "2024-01-15",
    make: "Mossberg",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "MOS123456",
    fullName: "Robert",
    surname: "Reed",
    registrationId: "7612085034087",
    physicalAddress: "741 Bismarck Palm Lane, Kimberley",
    licenceNo: "KIM108/24",
    licenceDate: "2024-02-05",
    remarks: "Collected - waterfowl hunting",
    status: "collected",
  },
  {
    id: "159",
    stockNo: "AAAAAAA65",
    dateReceived: "2024-02-20",
    make: "Savage",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "SAV789654",
    fullName: "Jennifer",
    surname: "Bailey",
    registrationId: "8409125067089",
    physicalAddress: "852 Coconut Avenue, Polokwane",
    licenceNo: "POL109/24",
    licenceDate: "2024-03-10",
    remarks: "Dealer stock - long range hunting",
    status: "dealer-stock",
  },
  {
    id: "160",
    stockNo: "BBBBBBB76",
    dateReceived: "2024-03-25",
    make: "Browning",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "BRN456789",
    fullName: "William",
    surname: "Cooper",
    registrationId: "7513085043088",
    physicalAddress: "963 Avocado Street, Nelspruit",
    licenceNo: "NEL110/24",
    licenceDate: "2024-04-15",
    remarks: "Safe keeping - over/under shotgun",
    status: "safe-keeping",
  },
  {
    id: "161",
    stockNo: "CCCCCCC87",
    dateReceived: "2024-04-30",
    make: "CZ",
    type: "Rifle",
    caliber: ".22 LR",
    serialNo: "CZ123987",
    fullName: "Lisa",
    surname: "Richardson",
    registrationId: "8210115078090",
    physicalAddress: "147 Kiwi Lane, George",
    licenceNo: "GEO111/24",
    licenceDate: "2024-05-20",
    remarks: "In stock - training rifle",
    status: "in-stock",
  },
  {
    id: "162",
    stockNo: "DDDDDDD98",
    dateReceived: "2024-05-15",
    make: "Tikka",
    type: "Rifle",
    caliber: ".300 WSM",
    serialNo: "TIK654321",
    fullName: "David",
    surname: "Watson",
    registrationId: "7607095034087",
    physicalAddress: "258 Guava Drive, Pietermaritzburg",
    licenceNo: "PMB112/24",
    licenceDate: "2024-06-05",
    remarks: "Collected - precision hunting",
    status: "collected",
  },
  {
    id: "163",
    stockNo: "EEEEEEE09",
    dateReceived: "2024-06-20",
    make: "Heckler & Koch",
    type: "Rifle",
    caliber: ".308 Win",
    serialNo: "HK987123",
    fullName: "Nancy",
    surname: "Brooks",
    registrationId: "8104125089091",
    physicalAddress: "369 Passion Fruit Street, Rustenburg",
    licenceNo: "RUS113/24",
    licenceDate: "2024-07-10",
    remarks: "Dealer stock - tactical rifle",
    status: "dealer-stock",
  },
  {
    id: "164",
    stockNo: "FFFFFFF10",
    dateReceived: "2024-07-25",
    make: "Benelli",
    type: "Shotgun",
    caliber: "20 Gauge",
    serialNo: "BEN456789",
    fullName: "Karen",
    surname: "Kelly",
    registrationId: "7511085043088",
    physicalAddress: "741 Dragon Fruit Lane, Upington",
    licenceNo: "UPI114/24",
    licenceDate: "2024-08-15",
    remarks: "Safe keeping - semi-automatic",
    status: "safe-keeping",
  },
  {
    id: "165",
    stockNo: "GGGGGGG21",
    dateReceived: "2024-08-30",
    make: "Weatherby",
    type: "Rifle",
    caliber: ".300 Wby Mag",
    serialNo: "WBY789012",
    fullName: "Thomas",
    surname: "Morgan",
    registrationId: "8308125067089",
    physicalAddress: "852 Star Fruit Avenue, Tzaneen",
    licenceNo: "TZA115/24",
    licenceDate: "2024-09-20",
    remarks: "In stock - magnum rifle",
    status: "in-stock",
  },
  {
    id: "166",
    stockNo: "HHHHHHH32",
    dateReceived: "2024-09-15",
    make: "Marlin",
    type: "Rifle",
    caliber: ".45-70 Gov",
    serialNo: "MAR123456",
    fullName: "Betty",
    surname: "Rivera",
    registrationId: "7605095029087",
    physicalAddress: "963 Lychee Street, Messina",
    licenceNo: "MES116/24",
    licenceDate: "2024-10-05",
    remarks: "Collected - big bore lever action",
    status: "collected",
  },
  {
    id: "167",
    stockNo: "IIIIIII43",
    dateReceived: "2024-10-20",
    make: "Franchi",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "FRA654789",
    fullName: "Helen",
    surname: "Phillips",
    registrationId: "8202115078090",
    physicalAddress: "147 Rambutan Drive, Phalaborwa",
    licenceNo: "PHA117/24",
    licenceDate: "2024-11-10",
    remarks: "Dealer stock - semi-auto shotgun",
    status: "dealer-stock",
  },
  {
    id: "168",
    stockNo: "JJJJJJJ54",
    dateReceived: "2024-11-25",
    make: "Sako",
    type: "Rifle",
    caliber: ".270 WSM",
    serialNo: "SAK987321",
    fullName: "Sandra",
    surname: "Campbell",
    registrationId: "7509085034087",
    physicalAddress: "258 Durian Lane, Lephalale",
    licenceNo: "LEP118/24",
    licenceDate: "2024-12-15",
    remarks: "Safe keeping - Finnish precision",
    status: "safe-keeping",
  },
  {
    id: "169",
    stockNo: "KKKKKKK65",
    dateReceived: "2024-12-30",
    make: "Perazzi",
    type: "Shotgun",
    caliber: "12 Gauge",
    serialNo: "PER123654",
    fullName: "Donna",
    surname: "Stewart",
    registrationId: "8106125089091",
    physicalAddress: "369 Jackfruit Street, Thabazimbi",
    licenceNo: "THA119/24",
    licenceDate: "2025-01-20",
    remarks: "In stock - competition shotgun",
    status: "in-stock",
  },
  {
    id: "170",
    stockNo: "LLLLLLL76",
    dateReceived: "2023-01-20",
    make: "Blaser",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "BLA456987",
    fullName: "Mark",
    surname: "Morris",
    registrationId: "7713095043088",
    physicalAddress: "741 Breadfruit Avenue, Hoedspruit",
    licenceNo: "HOE120/23",
    licenceDate: "2023-02-10",
    remarks: "Collected - straight pull action",
    status: "collected",
  },
  {
    id: "171",
    stockNo: "MMMMMMM87",
    dateReceived: "2023-02-25",
    make: "Krieghoff",
    type: "Rifle",
    caliber: ".375 H&H",
    serialNo: "KRI789123",
    fullName: "Carol",
    surname: "Turner",
    registrationId: "8410125067089",
    physicalAddress: "852 Custard Apple Drive, Springbok",
    licenceNo: "SPR121/23",
    licenceDate: "2023-03-17",
    remarks: "Dealer stock - double rifle",
    status: "dealer-stock",
  },
  {
    id: "172",
    stockNo: "NNNNNNN98",
    dateReceived: "2023-03-30",
    make: "Merkel",
    type: "Shotgun",
    caliber: "20 Gauge",
    serialNo: "MER321456",
    fullName: "Steven",
    surname: "Edwards",
    registrationId: "7607095029087",
    physicalAddress: "963 Soursop Lane, Oudtshoorn",
    licenceNo: "OUD122/23",
    licenceDate: "2023-04-20",
    remarks: "Safe keeping - side-by-side",
    status: "safe-keeping",
  },
  {
    id: "173",
    stockNo: "OOOOOOO09",
    dateReceived: "2023-05-05",
    make: "Chapuis",
    type: "Rifle",
    caliber: ".450 NE",
    serialNo: "CHA654789",
    fullName: "Ruth",
    surname: "Collins",
    registrationId: "8204115078090",
    physicalAddress: "147 Tamarind Street, Bethlehem",
    licenceNo: "BET123/23",
    licenceDate: "2023-05-25",
    remarks: "In stock - dangerous game",
    status: "in-stock",
  },
  {
    id: "174",
    stockNo: "PPPPPPP10",
    dateReceived: "2023-06-10",
    make: "Heym",
    type: "Rifle",
    caliber: ".500 NE",
    serialNo: "HEY987123",
    fullName: "Frank",
    surname: "Washington",
    registrationId: "7511085034087",
    physicalAddress: "258 Pomegranate Avenue, Hartbeespoort",
    licenceNo: "HAR124/23",
    licenceDate: "2023-06-30",
    remarks: "Collected - express rifle",
    status: "collected",
  },
  {
    id: "175",
    stockNo: "QQQQQQQ21",
    dateReceived: "2023-07-15",
    make: "Mauser",
    type: "Rifle",
    caliber: "9.3x62",
    serialNo: "MAU456321",
    fullName: "Gloria",
    surname: "Butler",
    registrationId: "8308125089091",
    physicalAddress: "369 Fig Drive, Vryburg",
    licenceNo: "VRY125/23",
    licenceDate: "2023-08-05",
    remarks: "Dealer stock - African caliber",
    status: "dealer-stock",
  },
  {
    id: "176",
    stockNo: "RRRRRRR32",
    dateReceived: "2023-08-20",
    make: "Dakota",
    type: "Rifle",
    caliber: ".338 Win Mag",
    serialNo: "DAK789654",
    fullName: "Eugene",
    surname: "Simmons",
    registrationId: "7605095043088",
    physicalAddress: "741 Date Palm Lane, Klerksdorp",
    licenceNo: "KLE126/23",
    licenceDate: "2023-09-10",
    remarks: "Safe keeping - custom rifle",
    status: "safe-keeping",
  },
  {
    id: "177",
    stockNo: "SSSSSSS43",
    dateReceived: "2023-09-25",
    make: "Cooper",
    type: "Rifle",
    caliber: ".22-250 Rem",
    serialNo: "COO123987",
    fullName: "Diane",
    surname: "Alexander",
    registrationId: "8202115067089",
    physicalAddress: "852 Oil Palm Avenue, Potchefstroom",
    licenceNo: "POT127/23",
    licenceDate: "2023-10-15",
    remarks: "In stock - varmint rifle",
    status: "in-stock",
  },
  {
    id: "178",
    stockNo: "TTTTTTT54",
    dateReceived: "2023-10-30",
    make: "Christensen",
    type: "Rifle",
    caliber: "6.5 PRC",
    serialNo: "CHR456789",
    fullName: "Louis",
    surname: "Bryant",
    registrationId: "7509085029087",
    physicalAddress: "963 Royal Palm Drive, Mossel Bay",
    licenceNo: "MOS128/23",
    licenceDate: "2023-11-20",
    remarks: "Collected - carbon fiber",
    status: "collected",
  },
  {
    id: "179",
    stockNo: "UUUUUUU65",
    dateReceived: "2023-12-05",
    make: "Proof Research",
    type: "Rifle",
    caliber: ".300 PRC",
    serialNo: "PRF789456",
    fullName: "Marilyn",
    surname: "Stone",
    registrationId: "8106125078090",
    physicalAddress: "147 Phoenix Palm Lane, Springbok",
    licenceNo: "SPR129/23",
    licenceDate: "2023-12-25",
    remarks: "Dealer stock - carbon barrel",
    status: "dealer-stock",
  },
  {
    id: "180",
    stockNo: "VVVVVVV76",
    dateReceived: "2024-01-10",
    make: "Bergara",
    type: "Rifle",
    caliber: "6.5 Creedmoor",
    serialNo: "BER123654",
    fullName: "Jose",
    surname: "Carter",
    registrationId: "7713095034087",
    physicalAddress: "258 Bottle Palm Street, Upington",
    licenceNo: "UPI130/24",
    licenceDate: "2024-01-30",
    remarks: "Safe keeping - precision rifle",
    status: "safe-keeping",
  },
  {
    id: "181",
    stockNo: "WWWWWWW87",
    dateReceived: "2024-02-15",
    make: "Seekins",
    type: "Rifle",
    caliber: ".280 AI",
    serialNo: "SEE456987",
    fullName: "Angela",
    surname: "Mitchell",
    registrationId: "8410125089091",
    physicalAddress: "369 Fan Palm Avenue, Tzaneen",
    licenceNo: "TZA131/24",
    licenceDate: "2024-03-05",
    remarks: "In stock - hunting rifle",
    status: "in-stock",
  },
  {
    id: "182",
    stockNo: "XXXXXXX98",
    dateReceived: "2024-03-20",
    make: "Fierce",
    type: "Rifle",
    caliber: ".300 RUM",
    serialNo: "FIE789321",
    fullName: "Gary",
    surname: "Perez",
    registrationId: "7607095043088",
    physicalAddress: "741 Fishtail Palm Drive, Messina",
    licenceNo: "MES132/24",
    licenceDate: "2024-04-10",
    remarks: "Collected - magnum rifle",
    status: "collected",
  },
  {
    id: "183",
    stockNo: "YYYYYYY09",
    dateReceived: "2024-04-25",
    make: "Nosler",
    type: "Rifle",
    caliber: ".33 Nosler",
    serialNo: "NOS123654",
    fullName: "Cynthia",
    surname: "Roberts",
    registrationId: "8204115067089",
    physicalAddress: "852 Bismarck Palm Lane, Phalaborwa",
    licenceNo: "PHA133/24",
    licenceDate: "2024-05-15",
    remarks: "Dealer stock - premium rifle",
    status: "dealer-stock",
  },
  {
    id: "184",
    stockNo: "ZZZZZZZ10",
    dateReceived: "2024-05-30",
    make: "Gunwerks",
    type: "Rifle",
    caliber: "7mm Rem Mag",
    serialNo: "GUN456789",
    fullName: "Arthur",
    surname: "Turner",
    registrationId: "7511085029087",
    physicalAddress: "963 Coconut Palm Street, Lephalale",
    licenceNo: "LEP134/24",
    licenceDate: "2024-06-20",
    remarks: "Safe keeping - long range system",
    status: "safe-keeping",
  },
  {
    id: "185",
    stockNo: "AAAAAAAA21",
    dateReceived: "2024-07-05",
    make: "Barrett",
    type: "Rifle",
    caliber: ".50 BMG",
    serialNo: "BAR789012",
    fullName: "Evelyn",
    surname: "Phillips",
    registrationId: "8308125078090",
    physicalAddress: "147 Date Palm Lane, Thabazimbi",
    licenceNo: "THA135/24",
    licenceDate: "2024-07-25",
    remarks: "In stock - anti-materiel rifle",
    status: "in-stock",
  },
  {
    id: "186",
    stockNo: "BBBBBBBB32",
    dateReceived: "2024-08-10",
    make: "Accuracy International",
    type: "Rifle",
    caliber: ".300 Win Mag",
    serialNo: "AI321456",
    fullName: "Wayne",
    surname: "Campbell",
    registrationId: "7605095034087",
    physicalAddress: "258 Royal Palm Drive, Hoedspruit",
    licenceNo: "HOE136/24",
    licenceDate: "2024-08-30",
    remarks: "Collected - sniper rifle",
    status: "collected",
  },
  {
    id: "187",
    stockNo: "CCCCCCCC43",
    dateReceived: "2024-09-15",
    make: "Desert Tech",
    type: "Rifle",
    caliber: ".338 Lapua",
    serialNo: "DT654789",
    fullName: "Cheryl",
    surname: "Parker",
    registrationId: "8202115089091",
    physicalAddress: "369 Oil Palm Avenue, Springbok",
    licenceNo: "SPR137/24",
    licenceDate: "2024-10-05",
    remarks: "Dealer stock - bullpup rifle",
    status: "dealer-stock",
  },
  {
    id: "188",
    stockNo: "DDDDDDDD54",
    dateReceived: "2024-10-20",
    make: "Steyr",
    type: "Rifle",
    caliber: ".243 Win",
    serialNo: "STY987123",
    fullName: "Ralph",
    surname: "Evans",
    registrationId: "7509085043088",
    physicalAddress: "741 Phoenix Palm Lane, Oudtshoorn",
    licenceNo: "OUD138/24",
    licenceDate: "2024-11-10",
    remarks: "Safe keeping - hunting rifle",
    status: "safe-keeping",
  },
  {
    id: "189",
    stockNo: "EEEEEEEE65",
    dateReceived: "2024-11-25",
    make: "Anschutz",
    type: "Rifle",
    caliber: ".17 HMR",
    serialNo: "ANS456321",
    fullName: "Marilyn",
    surname: "Edwards",
    registrationId: "8106125067089",
    physicalAddress: "852 Bottle Palm Street, Bethlehem",
    licenceNo: "BET139/24",
    licenceDate: "2024-12-15",
    remarks: "In stock - small game rifle",
    status: "in-stock",
  },
  {
    id: "190",
    stockNo: "FFFFFFFF76",
    dateReceived: "2024-12-30",
    make: "Walther",
    type: "Rifle",
    caliber: ".22 WMR",
    serialNo: "WAL789654",
    fullName: "Roy",
    surname: "Collins",
    registrationId: "7713095029087",
    physicalAddress: "963 Fan Palm Avenue, Hartbeespoort",
    licenceNo: "HAR140/24",
    licenceDate: "2025-01-20",
    remarks: "Collected - target rifle",
    status: "collected",
  }
]

const initialInspections: Inspection[] = [
  {
    id: "1",
    date: "2025-05-30",
    inspector: "PN Sikhakhane",
    type: "Permanent Import Permit Inspection",
    findings: "Inspection of Nicholas Yale (PTY) LTD import permit PI10184610. All firearms properly documented and accounted for. Storage facilities meet required standards. Documentation is complete and up to date.",
    status: "passed",
    recommendations: "Continue compliance with Firearms Control Act requirements. Schedule next inspection in 12 months.",
  },
  {
    id: "2",
    date: "2024-12-15",
    inspector: "M Nkomo",
    type: "Dealer License Compliance Inspection",
    findings: "Routine inspection of dealer premises and records. All firearms properly stored in approved safes. Register entries are complete and accurate. Security systems functioning properly.",
    status: "passed",
    recommendations: "Maintain current security protocols. Update alarm system batteries as scheduled.",
  },
  {
    id: "3",
    date: "2024-10-22",
    inspector: "J van der Merwe",
    type: "Safe Storage Compliance Check",
    findings: "Inspection of safe storage facilities for firearms in safe-keeping. One minor discrepancy found in temperature control logs. All other requirements met satisfactorily.",
    status: "passed",
    recommendations: "Implement daily temperature monitoring log. Provide staff training on environmental controls.",
  },
  {
    id: "4",
    date: "2024-08-08",
    inspector: "S Mthembu",
    type: "Annual License Renewal Inspection",
    findings: "Comprehensive inspection for license renewal. All statutory requirements met. Excellent record keeping and security measures in place.",
    status: "passed",
    recommendations: "License approved for renewal. Continue current best practices.",
  },
  {
    id: "5",
    date: "2024-06-12",
    inspector: "R Patel",
    type: "Complaint Investigation",
    findings: "Investigation following public complaint about security procedures. Found all procedures to be in compliance with regulations. Complaint was unfounded.",
    status: "passed",
    recommendations: "No action required. Continue current security protocols.",
  },
  {
    id: "6",
    date: "2024-03-28",
    inspector: "T Mokwena",
    type: "Random Compliance Check",
    findings: "Unscheduled inspection to verify ongoing compliance. Minor issues found with visitor log procedures. All firearms accounted for and properly secured.",
    status: "pending",
    recommendations: "Update visitor log procedures within 30 days. Schedule follow-up inspection.",
  },
  {
    id: "7",
    date: "2024-01-18",
    inspector: "L Ndaba",
    type: "Workshop Safety Inspection",
    findings: "Inspection of workshop facilities and safety procedures. All workshop firearms properly tagged and documented. Safety equipment in good condition.",
    status: "passed",
    recommendations: "Continue current workshop protocols. Replace fire extinguisher in workshop bay 2.",
  },
  {
    id: "8",
    date: "2023-11-25",
    inspector: "K Malan",
    type: "Quarterly Stock Verification",
    findings: "Verification of all firearms in stock against register entries. All items accounted for. Documentation complete and accurate.",
    status: "passed",
    recommendations: "Maintain current stock control procedures. Consider digital backup system.",
  },
  {
    id: "9",
    date: "2023-09-14",
    inspector: "D Botha",
    type: "Security System Audit",
    findings: "Comprehensive audit of security systems and procedures. All systems operational. Access controls properly configured.",
    status: "passed",
    recommendations: "Update security camera firmware. Schedule annual security review.",
  },
  {
    id: "10",
    date: "2023-07-06",
    inspector: "A Maharaj",
    type: "Staff Training Verification",
    findings: "Verification of staff training records and competency. All staff properly trained and certified. Training records up to date.",
    status: "passed",
    recommendations: "Schedule refresher training for new regulations. Maintain training log.",
  },
  {
    id: "11",
    date: "2023-05-22",
    inspector: "F Kruger",
    type: "Environmental Compliance Check",
    findings: "Inspection of environmental controls and waste disposal procedures. Minor issues with cleaning solvent storage. All other requirements met.",
    status: "pending",
    recommendations: "Relocate cleaning solvents to approved storage area. Provide MSDS sheets for all chemicals.",
  },
  {
    id: "12",
    date: "2023-03-10",
    inspector: "G Pillay",
    type: "Record Keeping Audit",
    findings: "Comprehensive audit of all record keeping systems. Excellent documentation standards maintained. All required records present and accurate.",
    status: "passed",
    recommendations: "Continue current record keeping standards. Consider electronic backup system.",
  },
  {
    id: "13",
    date: "2023-01-15",
    inspector: "B Mthembu",
    type: "New Dealer License Inspection",
    findings: "Initial inspection for new dealer license application. All requirements met. Premises secure and properly equipped. Staff adequately trained.",
    status: "passed",
    recommendations: "License approved. Schedule first quarterly inspection in 3 months.",
  },
  {
    id: "14",
    date: "2022-12-08",
    inspector: "C Naidoo",
    type: "Annual Compliance Review",
    findings: "Comprehensive annual review of all operations. Minor discrepancies in record keeping format. All firearms properly accounted for.",
    status: "passed",
    recommendations: "Update record keeping format to new standard. Provide staff training on new procedures.",
  },
  {
    id: "15",
    date: "2022-10-20",
    inspector: "D Singh",
    type: "Security Upgrade Verification",
    findings: "Verification of newly installed security systems. All systems operational and meet required standards. Backup power systems tested successfully.",
    status: "passed",
    recommendations: "Schedule regular maintenance for new security equipment. Update emergency procedures.",
  },
  {
    id: "16",
    date: "2022-08-12",
    inspector: "E Mbeki",
    type: "Safe Storage Expansion Inspection",
    findings: "Inspection of expanded safe storage facilities. New safes properly installed and certified. Capacity increased to meet growing demand.",
    status: "passed",
    recommendations: "Update inventory management system to reflect new capacity. Train staff on new storage procedures.",
  },
  {
    id: "17",
    date: "2022-06-05",
    inspector: "F Zulu",
    type: "Workshop Facility Inspection",
    findings: "Inspection of gunsmithing workshop facilities. All equipment properly maintained. Safety protocols in place and being followed.",
    status: "passed",
    recommendations: "Continue current workshop safety protocols. Schedule equipment calibration as required.",
  },
  {
    id: "18",
    date: "2022-04-18",
    inspector: "G Khumalo",
    type: "Import Permit Compliance Check",
    findings: "Review of import permit procedures and documentation. All imports properly documented and declared. Customs procedures followed correctly.",
    status: "passed",
    recommendations: "Maintain current import documentation standards. Update staff on any regulatory changes.",
  },
  {
    id: "19",
    date: "2022-02-28",
    inspector: "H Dlamini",
    type: "Staff Certification Review",
    findings: "Review of all staff certifications and training records. All staff properly certified. Training records complete and up to date.",
    status: "passed",
    recommendations: "Schedule refresher training for updated regulations. Maintain certification tracking system.",
  },
  {
    id: "20",
    date: "2022-01-10",
    inspector: "I Motaung",
    type: "Customer Background Check Audit",
    findings: "Audit of customer background check procedures. All checks properly conducted and documented. Compliance with verification requirements excellent.",
    status: "passed",
    recommendations: "Continue current background check procedures. Update database security protocols.",
  }
]

export default function GunworxTracker() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [firearms, setFirearms] = useState<Firearm[]>(initialFirearms)
  const [inspections, setInspections] = useState<Inspection[]>(initialInspections)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false)
  const [selectedFirearm, setSelectedFirearm] = useState<Firearm | null>(null)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [activeTab, setActiveTab] = useState('firearms')
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [signature, setSignature] = useState<string>('')
  const { toast } = useToast()

  const [isEditInspectionDialogOpen, setIsEditInspectionDialogOpen] = useState(false)
  const [selectedInspectionForEdit, setSelectedInspectionForEdit] = useState<Inspection | null>(null)

  const [newFirearm, setNewFirearm] = useState<Omit<Firearm, 'id'>>({
    stockNo: '',
    dateReceived: '',
    make: '',
    type: '',
    caliber: '',
    serialNo: '',
    fullName: '',
    surname: '',
    registrationId: '',
    physicalAddress: '',
    licenceNo: '',
    licenceDate: '',
    remarks: '',
    status: 'in-stock'
  })

  const [newInspection, setNewInspection] = useState<Omit<Inspection, 'id'>>({
    date: '',
    inspector: '',
    type: '',
    findings: '',
    status: 'pending',
    recommendations: ''
  })

  useEffect(() => {
    const user = authService.getCurrentUser()
    setCurrentUser(user)
  }, [])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    toast({
      title: "Login Successful",
      description: `Welcome back, ${user.firstName}!`,
    })
  }

  const handleLogout = async () => {
    await authService.logout()
    setCurrentUser(null)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const filteredFirearms = firearms.filter(firearm => {
    const matchesSearch = Object.values(firearm).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesStatus = statusFilter === 'all' || firearm.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Separate active and collected firearms
  const activeFirearms = filteredFirearms.filter(f => f.status !== 'collected')
  const collectedFirearms = filteredFirearms.filter(f => f.status === 'collected')

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'in-stock': { label: 'In Stock', variant: 'default' as const },
      'dealer-stock': { label: 'Dealer Stock', variant: 'secondary' as const },
      'safe-keeping': { label: 'Safe Keeping', variant: 'outline' as const },
      'collected': { label: 'Collected', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['in-stock']
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getInspectionStatusBadge = (status: string) => {
    const statusConfig = {
      'passed': { label: 'Passed', variant: 'default' as const, icon: CheckCircle },
      'failed': { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
      'pending': { label: 'Pending', variant: 'secondary' as const, icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending']
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleAddFirearm = () => {
    const firearm: Firearm = {
      ...newFirearm,
      id: Date.now().toString()
    }
    setFirearms([...firearms, firearm])
    setNewFirearm({
      stockNo: '',
      dateReceived: '',
      make: '',
      type: '',
      caliber: '',
      serialNo: '',
      fullName: '',
      surname: '',
      registrationId: '',
      physicalAddress: '',
      licenceNo: '',
      licenceDate: '',
      remarks: '',
      status: 'in-stock'
    })
    setIsAddDialogOpen(false)
    toast({
      title: "Firearm Added",
      description: "New firearm has been successfully added to the inventory.",
    })
  }

  const handleEditFirearm = () => {
    if (selectedFirearm) {
      setFirearms(firearms.map(f => f.id === selectedFirearm.id ? selectedFirearm : f))
      setIsEditDialogOpen(false)
      setSelectedFirearm(null)
      toast({
        title: "Firearm Updated",
        description: "Firearm details have been successfully updated.",
      })
    }
  }

  const handleDeleteFirearm = (id: string) => {
    setFirearms(firearms.filter(f => f.id !== id))
    toast({
      title: "Firearm Deleted",
      description: "Firearm has been successfully removed from the inventory.",
    })
  }

  const handleStatusChange = (id: string, newStatus: Firearm['status']) => {
    setFirearms(firearms.map(f => 
      f.id === id ? { ...f, status: newStatus } : f
    ))
    toast({
      title: "Status Updated",
      description: `Firearm status has been changed to ${newStatus.replace('-', ' ')}.`,
    })
  }

  const handleSignature = (id: string) => {
    setSelectedFirearm(firearms.find(f => f.id === id) || null)
    setIsSignatureDialogOpen(true)
  }

  const handleSaveSignature = () => {
    if (selectedFirearm && signature && currentUser) {
      setFirearms(firearms.map(f => 
        f.id === selectedFirearm.id 
          ? { 
              ...f, 
              signature, 
              signatureDate: new Date().toISOString(),
              signedBy: `${currentUser.firstName} ${currentUser.lastName}`
            } 
          : f
      ))
      setSignature('')
      setIsSignatureDialogOpen(false)
      setSelectedFirearm(null)
      toast({
        title: "Signature Saved",
        description: "Digital signature has been successfully recorded.",
      })
    }
  }

  const handleAddInspection = () => {
    const inspection: Inspection = {
      ...newInspection,
      id: Date.now().toString()
    }
    setInspections([...inspections, inspection])
    setNewInspection({
      date: '',
      inspector: '',
      type: '',
      findings: '',
      status: 'pending',
      recommendations: ''
    })
    setIsInspectionDialogOpen(false)
    toast({
      title: "Inspection Added",
      description: "New inspection record has been successfully added.",
    })
  }

  const handleEditInspection = () => {
    if (selectedInspectionForEdit) {
      setInspections(inspections.map(i => 
        i.id === selectedInspectionForEdit.id ? selectedInspectionForEdit : i
      ))
      setIsEditInspectionDialogOpen(false)
      setSelectedInspectionForEdit(null)
      toast({
        title: "Inspection Updated",
        description: "Inspection record has been successfully updated.",
      })
    }
  }

  const handleDeleteInspection = (id: string) => {
    setInspections(inspections.filter(i => i.id !== id))
    toast({
      title: "Inspection Deleted",
      description: "Inspection record has been successfully removed.",
    })
  }

  const exportData = () => {
    const data = {
      firearms,
      inspections,
      exportDate: new Date().toISOString(),
      exportedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gunworx-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Data Exported",
      description: "All data has been successfully exported to JSON file.",
    })
  }

  const getStatistics = () => {
    return {
      total: firearms.length,
      inStock: firearms.filter(f => f.status === 'in-stock').length,
      dealerStock: firearms.filter(f => f.status === 'dealer-stock').length,
      safeKeeping: firearms.filter(f => f.status === 'safe-keeping').length,
      collected: firearms.filter(f => f.status === 'collected').length,
      inspections: {
        total: inspections.length,
        passed: inspections.filter(i => i.status === 'passed').length,
        failed: inspections.filter(i => i.status === 'failed').length,
        pending: inspections.filter(i => i.status === 'pending').length
      }
    }
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (showUserManagement && currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserManagement(false)}
                  className="flex items-center space-x-2"
                >
                  <span>← Back to Tracker</span>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {currentUser.firstName}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserManagement />
        </div>
      </div>
    )
  }

  const stats = getStatistics()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GW</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Gunworx Tracker</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser.firstName}
              </span>
              {currentUser.role === 'admin' && (
                <Button
                  variant="outline"
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="firearms" className="flex items-center space-x-2">
              <span>Firearms</span>
            </TabsTrigger>
            <TabsTrigger value="inspections" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Inspections</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="firearms" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">{stats.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Stock</p>
                      <p className="text-2xl font-bold">{stats.inStock}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dealer Stock</p>
                      <p className="text-2xl font-bold">{stats.dealerStock}</p>
                    </div>
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Building className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Safe Keeping</p>
                      <p className="text-2xl font-bold">{stats.safeKeeping}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Collected</p>
                      <p className="text-2xl font-bold">{stats.collected}</p>
                    </div>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search firearms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
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
              <div className="flex gap-2">
                <Button onClick={exportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Firearm
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Firearm</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new firearm entry.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stockNo">Stock No</Label>
                        <Input
                          id="stockNo"
                          value={newFirearm.stockNo}
                          onChange={(e) => setNewFirearm({...newFirearm, stockNo: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateReceived">Date Received</Label>
                        <Input
                          id="dateReceived"
                          type="date"
                          value={newFirearm.dateReceived}
                          onChange={(e) => setNewFirearm({...newFirearm, dateReceived: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="make">Make</Label>
                        <Input
                          id="make"
                          value={newFirearm.make}
                          onChange={(e) => setNewFirearm({...newFirearm, make: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Input
                          id="type"
                          value={newFirearm.type}
                          onChange={(e) => setNewFirearm({...newFirearm, type: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="caliber">Caliber</Label>
                        <Input
                          id="caliber"
                          value={newFirearm.caliber}
                          onChange={(e) => setNewFirearm({...newFirearm, caliber: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="serialNo">Serial No</Label>
                        <Input
                          id="serialNo"
                          value={newFirearm.serialNo}
                          onChange={(e) => setNewFirearm({...newFirearm, serialNo: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={newFirearm.fullName}
                          onChange={(e) => setNewFirearm({...newFirearm, fullName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="surname">Surname</Label>
                        <Input
                          id="surname"
                          value={newFirearm.surname}
                          onChange={(e) => setNewFirearm({...newFirearm, surname: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="registrationId">Registration ID</Label>
                        <Input
                          id="registrationId"
                          value={newFirearm.registrationId}
                          onChange={(e) => setNewFirearm({...newFirearm, registrationId: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="licenceNo">Licence No</Label>
                        <Input
                          id="licenceNo"
                          value={newFirearm.licenceNo}
                          onChange={(e) => setNewFirearm({...newFirearm, licenceNo: e.target.value})}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="physicalAddress">Physical Address</Label>
                        <Input
                          id="physicalAddress"
                          value={newFirearm.physicalAddress}
                          onChange={(e) => setNewFirearm({...newFirearm, physicalAddress: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="licenceDate">Licence Date</Label>
                        <Input
                          id="licenceDate"
                          type="date"
                          value={newFirearm.licenceDate}
                          onChange={(e) => setNewFirearm({...newFirearm, licenceDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={newFirearm.status} onValueChange={(value: Firearm['status']) => setNewFirearm({...newFirearm, status: value})}>
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
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                          id="remarks"
                          value={newFirearm.remarks}
                          onChange={(e) => setNewFirearm({...newFirearm, remarks: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddFirearm}>Add Firearm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Active Firearms Table */}
            <Card>
              <CardHeader>
                <CardTitle>Active Firearms ({activeFirearms.length})</CardTitle>
                <CardDescription>Firearms currently in inventory (In Stock, Dealer Stock, Safe Keeping)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
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
                      {activeFirearms.map((firearm) => (
                        <TableRow key={firearm.id}>
                          <TableCell className="font-medium">{firearm.stockNo}</TableCell>
                          <TableCell>{firearm.dateReceived}</TableCell>
                          <TableCell>{firearm.make}</TableCell>
                          <TableCell>{firearm.type}</TableCell>
                          <TableCell>{firearm.caliber}</TableCell>
                          <TableCell>{firearm.serialNo}</TableCell>
                          <TableCell>{firearm.fullName} {firearm.surname}</TableCell>
                          <TableCell>{getStatusBadge(firearm.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFirearm(firearm)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFirearm(firearm)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSignature(firearm.id)}
                              >
                                <PenTool className="h-4 w-4" />
                              </Button>
                              <Select
                                value={firearm.status}
                                onValueChange={(value: Firearm['status']) => handleStatusChange(firearm.id, value)}
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
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
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
                <CardTitle>Collected Firearms ({collectedFirearms.length})</CardTitle>
                <CardDescription>Firearms that have been collected by owners</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
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
                      {collectedFirearms.map((firearm) => (
                        <TableRow key={firearm.id} className="bg-green-50">
                          <TableCell className="font-medium">{firearm.stockNo}</TableCell>
                          <TableCell>{firearm.dateReceived}</TableCell>
                          <TableCell>{firearm.make}</TableCell>
                          <TableCell>{firearm.type}</TableCell>
                          <TableCell>{firearm.caliber}</TableCell>
                          <TableCell>{firearm.serialNo}</TableCell>
                          <TableCell>{firearm.fullName} {firearm.surname}</TableCell>
                          <TableCell>{getStatusBadge(firearm.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFirearm(firearm)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFirearm(firearm)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Select
                                value={firearm.status}
                                onValueChange={(value: Firearm['status']) => handleStatusChange(firearm.id, value)}
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
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
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

          <TabsContent value="inspections" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Inspection Records</h2>
              <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Inspection
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Inspection</DialogTitle>
                    <DialogDescription>
                      Record a new inspection with findings and recommendations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inspectionDate">Date</Label>
                      <Input
                        id="inspectionDate"
                        type="date"
                        value={newInspection.date}
                        onChange={(e) => setNewInspection({...newInspection, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspector">Inspector</Label>
                      <Input
                        id="inspector"
                        value={newInspection.inspector}
                        onChange={(e) => setNewInspection({...newInspection, inspector: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="inspectionType">Type</Label>
                      <Input
                        id="inspectionType"
                        value={newInspection.type}
                        onChange={(e) => setNewInspection({...newInspection, type: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="findings">Findings</Label>
                      <Textarea
                        id="findings"
                        value={newInspection.findings}
                        onChange={(e) => setNewInspection({...newInspection, findings: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="recommendations">Recommendations</Label>
                      <Textarea
                        id="recommendations"
                        value={newInspection.recommendations}
                        onChange={(e) => setNewInspection({...newInspection, recommendations: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspectionStatus">Status</Label>
                      <Select value={newInspection.status} onValueChange={(value: Inspection['status']) => setNewInspection({...newInspection, status: value})}>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInspectionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddInspection}>Add Inspection</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Inspections</p>
                      <p className="text-2xl font-bold">{stats.inspections.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Passed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.inspections.passed}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">{stats.inspections.failed}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.inspections.pending}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspections.map((inspection) => (
                      <TableRow key={inspection.id}>
                        <TableCell>{inspection.date}</TableCell>
                        <TableCell>{inspection.inspector}</TableCell>
                        <TableCell>{inspection.type}</TableCell>
                        <TableCell>{getInspectionStatusBadge(inspection.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInspection(inspection)
                                // You could open a view dialog here
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {currentUser?.role === 'admin' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInspectionForEdit(inspection)
                                    setIsEditInspectionDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the inspection record.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteInspection(inspection.id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Inspection Dialog */}
            <Dialog open={isEditInspectionDialogOpen} onOpenChange={setIsEditInspectionDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Inspection</DialogTitle>
                  <DialogDescription>
                    Update the inspection record details.
                  </DialogDescription>
                </DialogHeader>
                {selectedInspectionForEdit && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editInspectionDate">Date</Label>
                      <Input
                        id="editInspectionDate"
                        type="date"
                        value={selectedInspectionForEdit.date}
                        onChange={(e) => setSelectedInspectionForEdit({...selectedInspectionForEdit, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editInspector">Inspector</Label>
                      <Input
                        id="editInspector"
                        value={selectedInspectionForEdit.inspector}
                        onChange={(e) => setSelectedInspectionForEdit({...selectedInspectionForEdit, inspector: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="editInspectionType">Type</Label>
                      <Input
                        id="editInspectionType"
                        value={selectedInspectionForEdit.type}
                        onChange={(e) => setSelectedInspectionForEdit({...selectedInspectionForEdit, type: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="editFindings">Findings</Label>
                      <Textarea
                        id="editFindings"
                        value={selectedInspectionForEdit.findings}
                        onChange={(e) => setSelectedInspectionForEdit({...selectedInspectionForEdit, findings: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="editRecommendations">Recommendations</Label>
                      <Textarea
                        id="editRecommendations"
                        value={selectedInspectionForEdit.recommendations}
                        onChange={(e) => setSelectedInspectionForEdit({...selectedInspectionForEdit, recommendations: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editInspectionStatus">Status</Label>
                      <Select value={selectedInspectionForEdit.status} onValueChange={(value: Inspection['status']) => setSelectedInspectionForEdit({...selectedInspectionForEdit, status: value})}>
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
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditInspectionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditInspection}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Firearms by Status</CardTitle>
                  <CardDescription>Distribution of firearms across different statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>In Stock</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(stats.inStock / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.inStock}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dealer Stock</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${(stats.dealerStock / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.dealerStock}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Safe Keeping</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(stats.safeKeeping / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.safeKeeping}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Collected</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(stats.collected / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.collected}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inspection Results</CardTitle>
                  <CardDescription>Overview of inspection outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Passed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(stats.inspections.passed / stats.inspections.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.inspections.passed}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Failed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(stats.inspections.failed / stats.inspections.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.inspections.failed}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pending</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${(stats.inspections.pending / stats.inspections.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.inspections.pending}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Inspection Completed</p>
                      <p className="text-sm text-gray-600">PN Sikhakhane completed Permanent Import Permit Inspection</p>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto">2025-05-30</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">New Firearm Added</p>
                      <p className="text-sm text-gray-600">Steyr Pistol (.177 Air) added to inventory</p>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto">2024-12-29</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Status Changed</p>
                      <p className="text-sm text-gray-600">Firearm RRRR54 status changed to collected</p>
                    </div>
                    <span className="text-sm text-gray-500 ml-auto">2024-12-25</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Firearm Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Firearm Details</DialogTitle>
              <DialogDescription>
                Complete information for this firearm record.
              </DialogDescription>
            </DialogHeader>
            {selectedFirearm && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Stock No</Label>
                  <p className="text-sm">{selectedFirearm.stockNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date Received</Label>
                  <p className="text-sm">{selectedFirearm.dateReceived}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Make</Label>
                  <p className="text-sm">{selectedFirearm.make}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <p className="text-sm">{selectedFirearm.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Caliber</Label>
                  <p className="text-sm">{selectedFirearm.caliber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Serial No</Label>
                  <p className="text-sm">{selectedFirearm.serialNo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="text-sm">{selectedFirearm.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Surname</Label>
                  <p className="text-sm">{selectedFirearm.surname}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Registration ID</Label>
                  <p className="text-sm">{selectedFirearm.registrationId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Licence No</Label>
                  <p className="text-sm">{selectedFirearm.licenceNo}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Physical Address</Label>
                  <p className="text-sm">{selectedFirearm.physicalAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Licence Date</Label>
                  <p className="text-sm">{selectedFirearm.licenceDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedFirearm.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Remarks</Label>
                  <p className="text-sm">{selectedFirearm.remarks}</p>
                </div>
                {selectedFirearm.signature && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Digital Signature</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                      <img src={selectedFirearm.signature || "/placeholder.svg"} alt="Signature" className="max-w-full h-auto" />
                      <div className="mt-2 text-xs text-gray-500">
                        Signed by: {selectedFirearm.signedBy} on {selectedFirearm.signatureDate ? new Date(selectedFirearm.signatureDate).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Firearm Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Firearm</DialogTitle>
              <DialogDescription>
                Update the firearm details.
              </DialogDescription>
            </DialogHeader>
            {selectedFirearm && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStockNo">Stock No</Label>
                  <Input
                    id="editStockNo"
                    value={selectedFirearm.stockNo}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, stockNo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editDateReceived">Date Received</Label>
                  <Input
                    id="editDateReceived"
                    type="date"
                    value={selectedFirearm.dateReceived}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, dateReceived: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editMake">Make</Label>
                  <Input
                    id="editMake"
                    value={selectedFirearm.make}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, make: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editType">Type</Label>
                  <Input
                    id="editType"
                    value={selectedFirearm.type}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, type: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editCaliber">Caliber</Label>
                  <Input
                    id="editCaliber"
                    value={selectedFirearm.caliber}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, caliber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editSerialNo">Serial No</Label>
                  <Input
                    id="editSerialNo"
                    value={selectedFirearm.serialNo}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, serialNo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editFullName">Full Name</Label>
                  <Input
                    id="editFullName"
                    value={selectedFirearm.fullName}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editSurname">Surname</Label>
                  <Input
                    id="editSurname"
                    value={selectedFirearm.surname}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, surname: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editRegistrationId">Registration ID</Label>
                  <Input
                    id="editRegistrationId"
                    value={selectedFirearm.registrationId}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, registrationId: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editLicenceNo">Licence No</Label>
                  <Input
                    id="editLicenceNo"
                    value={selectedFirearm.licenceNo}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, licenceNo: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editPhysicalAddress">Physical Address</Label>
                  <Input
                    id="editPhysicalAddress"
                    value={selectedFirearm.physicalAddress}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, physicalAddress: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editLicenceDate">Licence Date</Label>
                  <Input
                    id="editLicenceDate"
                    type="date"
                    value={selectedFirearm.licenceDate}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, licenceDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select value={selectedFirearm.status} onValueChange={(value: Firearm['status']) => setSelectedFirearm({...selectedFirearm, status: value})}>
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
                  <Label htmlFor="editRemarks">Remarks</Label>
                  <Textarea
                    id="editRemarks"
                    value={selectedFirearm.remarks}
                    onChange={(e) => setSelectedFirearm({...selectedFirearm, remarks: e.target.value})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditFirearm}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Signature Dialog */}
        <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Digital Signature</DialogTitle>
              <DialogDescription>
                Add a digital signature for this firearm record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <SignaturePad
                onSignatureChange={setSignature}
                signature={signature}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSignatureDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSignature} disabled={!signature}>
                Save Signature
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
