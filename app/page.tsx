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

            {/* Firearms Table */}
            <Card>
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
                      {filteredFirearms.map((firearm) => (
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">In Stock</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(stats.inStock / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{stats.inStock}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dealer Stock</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${(stats.dealerStock / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{stats.dealerStock}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Safe Keeping</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(stats.safeKeeping / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{stats.safeKeeping}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Collected</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(stats.collected / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{stats.collected}</span>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Passed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${stats.inspections.total > 0 ? (stats.inspections.passed / stats.inspections.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{stats.inspections.passed}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Failed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${stats.inspections.total > 0 ? (stats.inspections.failed / stats.inspections.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{stats.inspections.failed}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pending</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${stats.inspections.total > 0 ? (stats.inspections.pending / stats.inspections.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{stats.inspections.pending}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download your data in various formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button variant="outline" onClick={() => {
                    // CSV export functionality
                    const csvData = firearms.map(f => ({
                      'Stock No': f.stockNo,
                      'Date Received': f.dateReceived,
                      'Make': f.make,
                      'Type': f.type,
                      'Caliber': f.caliber,
                      'Serial No': f.serialNo,
                      'Full Name': f.fullName,
                      'Surname': f.surname,
                      'Registration ID': f.registrationId,
                      'Physical Address': f.physicalAddress,
                      'Licence No': f.licenceNo,
                      'Licence Date': f.licenceDate,
                      'Remarks': f.remarks,
                      'Status': f.status
                    }))
                    
                    const csv = [
                      Object.keys(csvData[0] || {}).join(','),
                      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
                    ].join('\n')
                    
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `gunworx-firearms-${new Date().toISOString().split('T')[0]}.csv`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    
                    toast({
                      title: "CSV Exported",
                      description: "Firearms data has been exported to CSV file.",
                    })
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Firearm Details</DialogTitle>
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
                  <div className="mt-2 p-4 border rounded-lg">
                    <img src={selectedFirearm.signature || "/placeholder.svg"} alt="Digital Signature" className="max-w-full h-auto" />
                    <div className="mt-2 text-xs text-gray-500">
                      Signed by: {selectedFirearm.signedBy} on {selectedFirearm.signatureDate ? new Date(selectedFirearm.signatureDate).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Digital Signature</DialogTitle>
            <DialogDescription>
              Please provide your digital signature for this firearm record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SignaturePad onSignatureChange={setSignature} />
            {selectedFirearm && (
              <div className="text-sm text-gray-600">
                <p><strong>Firearm:</strong> {selectedFirearm.make} {selectedFirearm.type}</p>
                <p><strong>Serial No:</strong> {selectedFirearm.serialNo}</p>
                <p><strong>Stock No:</strong> {selectedFirearm.stockNo}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsSignatureDialogOpen(false)
              setSignature('')
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveSignature} disabled={!signature}>
              Save Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
