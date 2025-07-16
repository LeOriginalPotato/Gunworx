"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Trash2, Shield, UserIcon, Eye, EyeOff, Users, UserCheck, Crown } from "lucide-react"
import { authService, type User } from "@/lib/auth"

interface UserManagementProps {
  currentUser: User
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
    isSystemAdmin: false,
  })

  // Check if current user is system admin
  const isCurrentUserSystemAdmin = currentUser.isSystemAdmin === true

  // Load users on component mount
  useEffect(() => {
    loadUsers()

    // Auto-refresh every 30 seconds to sync with server
    const interval = setInterval(loadUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      console.log("Loading users...")

      const userList = await authService.getUsers()
      console.log("Raw user list:", userList)

      // Ensure we have valid user objects
      const validUsers = userList.filter((user): user is User => {
        return (
          user &&
          typeof user === "object" &&
          typeof user.id === "string" &&
          typeof user.username === "string" &&
          typeof user.password === "string" &&
          typeof user.role === "string" &&
          typeof user.createdAt === "string"
        )
      })

      console.log("Valid users:", validUsers)

      // Sort users: system admin first, then by role, then by username
      const sortedUsers = validUsers.sort((a, b) => {
        // System admin first
        if (a.isSystemAdmin && !b.isSystemAdmin) return -1
        if (b.isSystemAdmin && !a.isSystemAdmin) return 1

        // Then by role (admin before user)
        if (a.role === "admin" && b.role === "user") return -1
        if (a.role === "user" && b.role === "admin") return 1

        // Finally by username
        return (a.username || "").localeCompare(b.username || "")
      })

      console.log("Sorted users:", sortedUsers)
      setUsers(sortedUsers)
    } catch (err) {
      console.error("Failed to load users:", err)
      setError("Failed to load users")
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleAddUser = async () => {
    setError("")
    setSuccess("")

    if (!newUser.username) {
      setError("Username is required")
      return
    }

    if (newUser.username.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    const password = newUser.password || generatePassword()

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (await authService.userExists(newUser.username)) {
      setError("Username already exists")
      return
    }

    // Only system admins can create system admin users
    if (newUser.isSystemAdmin && !isCurrentUserSystemAdmin) {
      setError("Only system administrators can create system admin accounts")
      return
    }

    try {
      const createdUser = await authService.createUser({
        username: newUser.username,
        password,
        role: newUser.role,
        isSystemAdmin: newUser.isSystemAdmin,
      })

      await loadUsers()
      setNewUser({ username: "", password: "", role: "user", isSystemAdmin: false })
      setIsAddDialogOpen(false)

      alert(
        `User created successfully!

Username: ${createdUser.username}
Password: ${password}
Role: ${createdUser.isSystemAdmin ? "System Administrator" : createdUser.role}

Please provide these credentials to the user.`,
      )

      setSuccess(`User "${createdUser.username}" created successfully`)
    } catch (err) {
      setError("Failed to create user")
    }
  }

  const handleEditUser = (user: User) => {
    // Only system admins can edit system admin users (including other system admins)
    if (user.isSystemAdmin && !isCurrentUserSystemAdmin) {
      setError("Only system administrators can edit system admin accounts")
      return
    }

    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
    setError("")
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    setError("")

    if (!editingUser.username || !editingUser.password) {
      setError("Username and password are required")
      return
    }

    if (editingUser.username.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    if (editingUser.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    // Only system admins can set system admin role
    if (editingUser.isSystemAdmin && !isCurrentUserSystemAdmin) {
      setError("Only system administrators can grant system admin privileges")
      return
    }

    // Check if username exists for other users
    const existingUsers = await authService.getUsers()
    const existingUser = existingUsers.find((u) => u.username === editingUser.username && u.id !== editingUser.id)
    if (existingUser) {
      setError("Username already exists")
      return
    }

    try {
      await authService.updateUser(editingUser)
      await loadUsers()
      setIsEditDialogOpen(false)
      setEditingUser(null)

      alert(
        `User updated successfully!

Username: ${editingUser.username}
Password: ${editingUser.password}
Role: ${editingUser.isSystemAdmin ? "System Administrator" : editingUser.role}

Please provide the updated credentials to the user.`,
      )

      setSuccess(`User "${editingUser.username}" updated successfully`)
    } catch (err) {
      setError("Failed to update user")
    }
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)

    // Only system admins can delete system admin users
    if (user?.isSystemAdmin && !isCurrentUserSystemAdmin) {
      setError("Only system administrators can delete system admin accounts")
      return
    }

    // Prevent users from deleting themselves
    if (userId === currentUser.id) {
      setError("You cannot delete your own account")
      return
    }

    setDeletingUserId(userId)
    setIsDeleteDialogOpen(true)
    setError("")
  }

  const confirmDeleteUser = async () => {
    if (!deletingUserId) return

    try {
      const userToDelete = users.find((u) => u.id === deletingUserId)
      await authService.deleteUser(deletingUserId)
      await loadUsers()
      setIsDeleteDialogOpen(false)
      setDeletingUserId(null)
      setSuccess(`User "${userToDelete?.username}" deleted successfully`)
    } catch (err) {
      setError("Failed to delete user")
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const getRoleBadge = (user: User) => {
    if (user.isSystemAdmin) {
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <Crown className="w-3 h-3 mr-1" />
          System Admin
        </Badge>
      )
    }

    return user.role === "admin" ? (
      <Badge className="bg-orange-100 text-orange-800">
        <Shield className="w-3 h-3 mr-1" />
        Administrator
      </Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">
        <UserIcon className="w-3 h-3 mr-1" />
        User
      </Badge>
    )
  }

  const canEditUser = (user: User) => {
    // System admins can edit anyone
    if (isCurrentUserSystemAdmin) return true

    // Non-system admins cannot edit system admins
    if (user.isSystemAdmin) return false

    // Regular admins can edit non-system admin users
    return currentUser.role === "admin"
  }

  const canDeleteUser = (user: User) => {
    // Cannot delete yourself
    if (user.id === currentUser.id) return false

    // System admins can delete anyone (except themselves)
    if (isCurrentUserSystemAdmin) return true

    // Non-system admins cannot delete system admins
    if (user.isSystemAdmin) return false

    // Regular admins can delete non-system admin users
    return currentUser.role === "admin"
  }

  // Calculate statistics
  const stats = {
    total: users.length,
    systemAdmins: users.filter((u) => u.isSystemAdmin).length,
    admins: users.filter((u) => u.role === "admin" && !u.isSystemAdmin).length,
    users: users.filter((u) => u.role === "user").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* System Admin Notice */}
        {isCurrentUserSystemAdmin && (
          <Alert className="border-purple-200 bg-purple-50">
            <Crown className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>System Administrator Access:</strong> You have full privileges to manage all users, including
              creating and managing other system administrators.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.systemAdmins}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.admins}</p>
                </div>
                <UserCheck className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regular Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.users}</p>
                </div>
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage system users and their permissions</CardDescription>
              </div>
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
                    <DialogDescription>Create a new user account for the system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-username">Username *</Label>
                      <Input
                        id="new-username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="Enter username (min 3 characters)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Password (leave empty to auto-generate)</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password or leave empty"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value: "admin" | "user") => setNewUser({ ...newUser, role: value })}
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
                    {isCurrentUserSystemAdmin && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="new-system-admin"
                          checked={newUser.isSystemAdmin}
                          onChange={(e) => setNewUser({ ...newUser, isSystemAdmin: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="new-system-admin" className="text-sm font-medium">
                          <Crown className="w-4 h-4 inline mr-1 text-purple-600" />
                          System Administrator
                        </Label>
                      </div>
                    )}
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleAddUser} className="flex-1" disabled={!newUser.username}>
                        Create User
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
                <p className="text-sm text-gray-400">Click "Add User" to create the first user</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className={user.isSystemAdmin ? "bg-purple-50" : ""}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.isSystemAdmin && <Crown className="w-4 h-4 text-purple-600" />}
                            {user.username}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {showPasswords[user.id] ? user.password : "••••••••"}
                            </code>
                            <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(user.id)}>
                              {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user)}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  disabled={!canEditUser(user)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {!canEditUser(user)
                                  ? user.isSystemAdmin && !isCurrentUserSystemAdmin
                                    ? "Only system admins can edit system admin accounts"
                                    : "Insufficient permissions"
                                  : "Edit user"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={!canDeleteUser(user)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {!canDeleteUser(user)
                                  ? user.id === currentUser.id
                                    ? "Cannot delete yourself"
                                    : user.isSystemAdmin && !isCurrentUserSystemAdmin
                                      ? "Only system admins can delete system admin accounts"
                                      : "Insufficient permissions"
                                  : "Delete user"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">User Management Permissions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <Crown className="w-3 h-3 inline mr-1" />
                  <strong>System Administrators:</strong> Can manage all users including other system admins
                </li>
                <li>
                  • <Shield className="w-3 h-3 inline mr-1" />
                  <strong>Regular Administrators:</strong> Can manage non-system admin users only
                </li>
                <li>
                  • <UserIcon className="w-3 h-3 inline mr-1" />
                  <strong>Users:</strong> Cannot access user management
                </li>
                <li>• Users cannot delete their own accounts</li>
                <li>• Passwords are visible to administrators for credential sharing</li>
                <li>• Data syncs with server automatically every 30 seconds</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user account information</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-username">Username *</Label>
                  <Input
                    id="edit-username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-password">Password *</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value: "admin" | "user") => setEditingUser({ ...editingUser, role: value })}
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
                {isCurrentUserSystemAdmin && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-system-admin"
                      checked={editingUser.isSystemAdmin || false}
                      onChange={(e) => setEditingUser({ ...editingUser, isSystemAdmin: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-system-admin" className="text-sm font-medium">
                      <Crown className="w-4 h-4 inline mr-1 text-purple-600" />
                      System Administrator
                    </Label>
                  </div>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleUpdateUser} className="flex-1">
                    Update User
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
                This action cannot be undone. This will permanently delete the user account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
