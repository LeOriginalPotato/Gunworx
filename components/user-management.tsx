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
import { Plus, Edit, Trash2, Shield, UserIcon, Eye, EyeOff } from "lucide-react"
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
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
  })

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const allUsers = authService.getUsers()
    setUsers(allUsers)
  }

  const handleAddUser = () => {
    setError("")
    setSuccess("")

    if (!newUser.username || !newUser.password) {
      setError("Username and password are required")
      return
    }

    if (newUser.username.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    if (newUser.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (authService.userExists(newUser.username)) {
      setError("Username already exists")
      return
    }

    try {
      const createdUser = authService.createUser(newUser)
      loadUsers()
      setNewUser({ username: "", password: "", role: "user" })
      setIsAddDialogOpen(false)
      setSuccess(`User "${createdUser.username}" created successfully. Password: ${newUser.password}`)
    } catch (err) {
      setError("Failed to create user")
    }
  }

  const handleEditUser = (user: User) => {
    // Prevent editing the system admin user
    if (user.username === "admin" && user.id === "1") {
      setError("Cannot edit the system administrator account")
      return
    }

    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
    setError("")
  }

  const handleUpdateUser = () => {
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

    // Check if username exists for other users
    const existingUser = authService
      .getUsers()
      .find((u) => u.username === editingUser.username && u.id !== editingUser.id)
    if (existingUser) {
      setError("Username already exists")
      return
    }

    try {
      authService.updateUser(editingUser)
      loadUsers()
      setIsEditDialogOpen(false)
      setEditingUser(null)
      setSuccess(`User "${editingUser.username}" updated successfully`)
    } catch (err) {
      setError("Failed to update user")
    }
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)

    // Prevent deleting the system admin user
    if (user && user.username === "admin" && user.id === "1") {
      setError("Cannot delete the system administrator account")
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

  const confirmDeleteUser = () => {
    if (!deletingUserId) return

    try {
      const userToDelete = users.find((u) => u.id === deletingUserId)
      authService.deleteUser(deletingUserId)
      loadUsers()
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

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-red-100 text-red-800">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge className="bg-blue-100 text-blue-800">
        <UserIcon className="w-3 h-3 mr-1" />
        User
      </Badge>
    )
  }

  const isSystemAdmin = (user: User) => {
    return user.username === "admin" && user.id === "1"
  }

  return (
    <div className="space-y-6">
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
                    <Label htmlFor="new-password">Password *</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password (min 6 characters)"
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
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleAddUser} className="flex-1">
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
                  <TableRow key={user.id} className={isSystemAdmin(user) ? "bg-yellow-50" : ""}>
                    <TableCell className="font-medium">
                      {user.username}
                      {isSystemAdmin(user) && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          System Admin
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{showPasswords[user.id] ? user.password : "••••••••"}</span>
                        <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(user.id)}>
                          {showPasswords[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          disabled={isSystemAdmin(user)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          disabled={isSystemAdmin(user) || user.id === currentUser.id}
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

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">User Management Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• System administrator account cannot be edited or deleted</li>
              <li>• Users cannot delete their own accounts</li>
              <li>• Passwords are stored locally and visible to administrators</li>
              <li>• Provide credentials directly to users when creating accounts</li>
              <li>• Admin users have full system access including user management</li>
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
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
  )
}
