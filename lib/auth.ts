export const users = [
  {
    id: "1",
    username: "Jean-Mari",
    password: "Foktogbokka",
    name: "Jean-Mari",
    role: "admin",
    isSystemAdmin: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    username: "Jean",
    password: "xNgU7ADa",
    name: "Jean",
    role: "admin",
    isSystemAdmin: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    username: "Wikus",
    password: "Wikus@888",
    name: "Wikus",
    role: "admin",
    isSystemAdmin: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    username: "Eben",
    password: "UY9FBe8abajU",
    name: "Eben",
    role: "user",
    isSystemAdmin: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    username: "Francois",
    password: "MnWbCkE4AcFP",
    name: "Francois",
    role: "user",
    isSystemAdmin: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export function validateCredentials(username: string, password: string) {
  const user = users.find((u) => u.username === username && u.password === password)
  return user || null
}

export function getUserPermissions(role: string) {
  switch (role) {
    case "admin":
      return {
        canViewFirearms: true,
        canEditFirearms: true,
        canDeleteFirearms: true,
        canCreateFirearms: true,
        canCaptureSignatures: true,
        canViewInspections: true,
        canEditInspections: true,
        canDeleteInspections: true,
        canCreateInspections: true,
        canViewAnalytics: true,
        canManageUsers: true,
      }
    case "user":
      return {
        canViewFirearms: true,
        canEditFirearms: false,
        canDeleteFirearms: false,
        canCreateFirearms: true,
        canCaptureSignatures: false,
        canViewInspections: true,
        canEditInspections: false,
        canDeleteInspections: false,
        canCreateInspections: true,
        canViewAnalytics: false,
        canManageUsers: false,
      }
    default:
      return {
        canViewFirearms: false,
        canEditFirearms: false,
        canDeleteFirearms: false,
        canCreateFirearms: false,
        canCaptureSignatures: false,
        canViewInspections: false,
        canEditInspections: false,
        canDeleteInspections: false,
        canCreateInspections: false,
        canViewAnalytics: false,
        canManageUsers: false,
      }
  }
}
