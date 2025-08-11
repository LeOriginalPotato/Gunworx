export interface User {
  id: string
  username: string
  role: "admin" | "manager" | "user" | "inspector"
  isSystemAdmin: boolean
  createdAt: string
  lastLogin?: string
}

export const users: User[] = [
  {
    id: "1",
    username: "Jean-Mari",
    role: "admin",
    isSystemAdmin: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    username: "Jean",
    role: "admin",
    isSystemAdmin: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    username: "Wikus",
    role: "manager",
    isSystemAdmin: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    username: "Eben",
    role: "user",
    isSystemAdmin: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    username: "Francois",
    role: "user",
    isSystemAdmin: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    username: "Inspector",
    role: "inspector",
    isSystemAdmin: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export function validateCredentials(username: string, password: string): User | null {
  const validCredentials = [
    { username: "Jean-Mari", password: "Foktogbokka" },
    { username: "Jean", password: "xNgU7ADa" },
    { username: "Wikus", password: "Wikus@888" },
    { username: "Eben", password: "UY9FBe8abajU" },
    { username: "Francois", password: "MnWbCkE4AcFP" },
    { username: "Inspector", password: "inspector123" },
  ]

  const isValid = validCredentials.some((cred) => cred.username === username && cred.password === password)

  if (isValid) {
    return users.find((user) => user.username === username) || null
  }

  return null
}

export function getUserPermissions(role: string) {
  switch (role) {
    case "admin":
      return {
        canViewFirearms: true,
        canEditFirearms: true,
        canDeleteFirearms: true,
        canViewInspections: true,
        canEditInspections: true,
        canDeleteInspections: true,
        canExportInspections: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canCaptureSignatures: true,
      }
    case "manager":
      return {
        canViewFirearms: true,
        canEditFirearms: true,
        canDeleteFirearms: false,
        canViewInspections: true,
        canEditInspections: false,
        canDeleteInspections: false,
        canExportInspections: true,
        canViewAnalytics: true,
        canManageUsers: false,
        canCaptureSignatures: true,
      }
    case "user":
      return {
        canViewFirearms: true,
        canEditFirearms: false,
        canDeleteFirearms: false,
        canViewInspections: true,
        canEditInspections: false,
        canDeleteInspections: false,
        canExportInspections: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canCaptureSignatures: false,
      }
    case "inspector":
      return {
        canViewFirearms: false,
        canEditFirearms: false,
        canDeleteFirearms: false,
        canViewInspections: true,
        canEditInspections: false,
        canDeleteInspections: false,
        canExportInspections: true,
        canViewAnalytics: false,
        canManageUsers: false,
        canCaptureSignatures: false,
      }
    default:
      return {
        canViewFirearms: false,
        canEditFirearms: false,
        canDeleteFirearms: false,
        canViewInspections: false,
        canEditInspections: false,
        canDeleteInspections: false,
        canExportInspections: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canCaptureSignatures: false,
      }
  }
}
