"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  FolderSyncIcon as Sync,
} from "lucide-react"
import { authService, type User } from "@/lib/auth"

interface UserManagementProps {
  currentUser: User
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
  })

  // Edit user form state
  const [editUserData, setEditUserData] = useState({
    username: "",
    role: "user" as "admin" | "user",
    newPassword: "",
  })

  // Load users function with proper error handling and cross-device sync
  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    setError("")

    try {
      // Wait for auth service to be ready
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (!authService.isReady()) {
        throw new Error("Authentication service not ready")
      }

      // Force refresh from storage to get latest data from all devices
      const allUsers = authService.getAllUsers()
      setUsers(allUsers)
      setLastSyncTime(new Date())
    } catch (err) {
      console.error("Failed to load users:", err)
      setError("Failed to load users. Please refresh the page.")
      setUsers([]) // Set empty array as fallback
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  // Set up sync listener for real-time updates
  useEffect(() => {
    const unsubscribe = authService.onSync(() => {
      loadUsers()
    })

    return unsubscribe
  }, [loadUsers])

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Auto-refresh users every 10 seconds to ensure sync across devices
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isLoadingUsers) {
        loadUsers()
      }
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [loadUsers, isLoading, isLoadingUsers])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      setError("Username and password are required")
      return
    }

    if (newUser.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const user = authService.createUser(newUser.username.trim(), newUser.password, newUser.role)
      setSuccess(
        `User "${user.username}" created successfully!\n\nCredentials:\nUsername: ${user.username}\nPassword: ${newUser.password}\n\nPlease provide these credentials to the user.\n\nThis user is now visible on all devices and accounts.`,
      )
      setNewUser({ username: "", password: "", role: "user" })
      setIsAddDialogOpen(false)

      // Force sync and reload
      authService.forceSync()
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditUserData({
      username: user.username,
      role: user.role,
      newPassword: "",
    })
    setIsEditDialogOpen(true)
    setError("")
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserData.username.trim()) {
      setError("Username is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Update user details
      authService.updateUser(editingUser.id, {
        username: editUserData.username.trim(),
        role: editUserData.role,
      })

      // Update password if provided
      if (editUserData.newPassword.trim()) {
        if (editUserData.newPassword.length < 6) {
          setError("Password must be at least 6 characters long")
          setIsLoading(false)
          return
        }
        authService.updatePassword(editingUser.id, editUserData.newPassword)
        setSuccess(
          `User "${editUserData.username}" updated successfully!\n\nNew password: ${editUserData.newPassword}\n\nPlease provide the new password to the user.\n\nChanges are synced across all devices.`,
        )
      } else {
        setSuccess(`User "${editUserData.username}" updated successfully!\n\nChanges are synced across all devices.`)
      }

      setIsEditDialogOpen(false)
      setEditingUser(null)

      // Force sync and reload
      authService.forceSync()
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = (userId: string) => {
    setDeletingUserId(userId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUserId) return

    setIsLoading(true)
    setError("")

    try {
      const userToDelete = users.find((u) => u.id === deletingUserId)
      authService.deleteUser(deletingUserId)
      setSuccess(`User "${userToDelete?.username}" deleted successfully!\n\nDeletion is synced across all devices.`)
      setIsDeleteDialogOpen(false)
      setDeletingUserId(null)

      // Force sync and reload
      authService.forceSync()
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceSync = async () => {
    setIsLoadingUsers(true)
    authService.forceSync()
    await loadUsers()
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewUser({ ...newUser, password })
  }

  const getRoleBadge = (role: User["role"]) => {
    return role === "admin" ? (
      <Badge className="bg-red-100 text-red-800">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">
        <UserCheck className="w-3 h-3 mr-1" />
        User
      </Badge>
    )
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    users: users.filter((u) => u.role === "user").length,
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sync className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Last synced: {lastSyncTime.toLocaleTimeString()}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleForceSync} disabled={isLoadingUsers}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUsers ? "animate-spin" : ""}`} />
              Force Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{isLoadingUsers ? "..." : stats.total}</p>
                <p className="text-xs text-gray-500">Synced across all devices</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-red-600">{isLoadingUsers ? "..." : stats.admins}</p>
                <p className="text-xs text-gray-500">Admin privileges</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Users</p>
                <p className="text-2xl font-bold text-blue-600">{isLoadingUsers ? "..." : stats.users}</p>
                <p className="text-xs text-gray-500">Standard access</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 whitespace-pre-line">{success}</AlertDescription>
        </Alert>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage system users and their permissions. All changes sync automatically across devices and accounts.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadUsers} disabled={isLoadingUsers}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUsers ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account. This user will be visible on all devices and accounts immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-username">Username</Label>
                      <Input
                        id="new-username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="Enter username"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Password</Label>
                      <div className="flex gap-2">
                        <Input
                          id="new-password"
                          type="text"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Enter password (min 6 characters)"
                          disabled={isLoading}
                        />
                        <Button type="button" variant="outline" onClick={generatePassword} disabled={isLoading}>
                          Generate
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: "admin" | "user") => setNewUser({ ...newUser, role: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> After creating the user, you must provide the username and password
                        directly to them. This user will be visible and accessible from all devices and accounts
                        immediately.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddUser} className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create User"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Syncing users across all devices...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No users found. Create your first user to get started.</p>
              <p className="text-xs text-gray-400 mb-4">
                Users created here will be visible on all devices and accounts immediately.
              </p>
              <Button onClick={loadUsers} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} disabled={isLoading}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Cross-Device Sync:</strong> All users shown here are automatically synchronized across all
                  devices and accounts. Changes made on any device will be reflected everywhere within seconds.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information. Changes will sync across all devices immediately.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editUserData.username}
                  onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                  placeholder="Enter username"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editUserData.role}
                  onValueChange={(value: "admin" | "user") => setEditUserData({ ...editUserData, role: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="text"
                  value={editUserData.newPassword}
                  onChange={(e) => setEditUserData({ ...editUserData, newPassword: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateUser} className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
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
              This action cannot be undone. This will permanently delete the user account and remove their access to the
              system across all devices and accounts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
