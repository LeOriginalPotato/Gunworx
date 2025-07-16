"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Edit, Trash2, Shield, UserIcon, CheckCircle, AlertCircle } from "lucide-react"
import { authService, type User } from "@/lib/auth"

interface UserManagementProps {
  currentUser: User
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setUsers(authService.getAllUsers())
  }

  const handleAddUser = () => {
    setError("")
    setSuccess("")

    if (!newUser.username || !newUser.password) {
      setError("Username and password are required")
      return
    }

    if (newUser.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      authService.createUser(newUser.username, newUser.password, newUser.role)
      setSuccess(
        `User "${newUser.username}" created successfully! Please provide the following credentials directly to the user:

Username: ${newUser.username}
Password: ${newUser.password}`,
      )
      setNewUser({ username: "", password: "", role: "user" })
      setIsAddDialogOpen(false)
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
    setError("")
  }

  const handleUpdateUser = () => {
    if (!editingUser) return

    setError("")

    try {
      authService.updateUser(editingUser.id, {
        username: editingUser.username,
        role: editingUser.role,
      })
      setSuccess(`User "${editingUser.username}" updated successfully!`)
      setIsEditDialogOpen(false)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    }
  }

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      setError("You cannot delete your own account")
      return
    }

    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      try {
        authService.deleteUser(user.id)
        setSuccess(`User "${user.username}" deleted successfully!`)
        loadUsers()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete user")
      }
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewUser({ ...newUser, password })
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

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 whitespace-pre-line">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* User Management Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage system users and their permissions</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-800">Total Users</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{users.filter((u) => u.role === "admin").length}</div>
              <div className="text-sm text-red-800">Administrators</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.role === "user").length}</div>
              <div className="text-sm text-green-800">Regular Users</div>
            </div>
          </div>

          {/* Users Table */}
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
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.id === currentUser.id}
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
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="new-password">Password *</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
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
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> After creating the user, you must provide the username and password directly
                to them. This information will not be shown again.
              </p>
            </div>
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
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
    </div>
  )
}
