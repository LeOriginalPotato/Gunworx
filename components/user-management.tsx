"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Users, Edit, Trash2, Shield, UserIcon, Key, UserPlus } from "lucide-react"
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

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
  })

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
  })

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    // Get all users except the system admin (Jean-Mari)
    const allUsers = authService.getAllUsers()
    setUsers(allUsers)
  }

  const handleAddUser = () => {
    setError("")
    setSuccess("")

    if (!newUser.username.trim() || !newUser.password.trim()) {
      setError("Please fill in all required fields")
      return
    }

    if (newUser.username.trim().length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    if (newUser.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    const createdUser = authService.createUser(
      newUser.username.trim(),
      newUser.password,
      newUser.role,
      currentUser.username,
    )

    if (createdUser) {
      setSuccess(`User "${createdUser.username}" created successfully. Please provide these credentials to the user.`)
      setNewUser({ username: "", password: "", role: "user" })
      setIsAddDialogOpen(false)
      loadUsers()
    } else {
      setError("Username already exists. Please choose a different username.")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditUserForm({
      username: user.username,
      password: "", // Don't pre-fill password for security
      role: user.role,
    })
    setIsEditDialogOpen(true)
    setError("")
  }

  const handleUpdateUser = () => {
    if (!editingUser) return

    setError("")

    if (!editUserForm.username.trim()) {
      setError("Username is required")
      return
    }

    if (editUserForm.username.trim().length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    // Update password if provided
    if (editUserForm.password && editUserForm.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    // Update username if changed
    if (editUserForm.username.trim() !== editingUser.username) {
      // Check if new username already exists
      const existingUser = authService
        .getAllUsersInternal()
        .find((u) => u.username === editUserForm.username.trim() && u.id !== editingUser.id)
      if (existingUser) {
        setError("Username already exists. Please choose a different username.")
        return
      }

      // Update username
      authService.updateUsername(editingUser.id, editUserForm.username.trim())
    }

    // Update password if provided
    if (editUserForm.password) {
      authService.updateUserPassword(editingUser.id, editUserForm.password)
    }

    // Update role
    authService.updateUserRole(editingUser.id, editUserForm.role)

    setSuccess(`User "${editUserForm.username}" updated successfully`)
    setIsEditDialogOpen(false)
    setEditingUser(null)
    loadUsers()
  }

  const handleDeleteUser = (userId: string) => {
    // Prevent deleting the current user
    if (userId === currentUser.id) {
      setError("You cannot delete your own account")
      return
    }

    setDeletingUserId(userId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = () => {
    if (deletingUserId) {
      const success = authService.deleteUser(deletingUserId)
      if (success) {
        setSuccess("User deleted successfully")
        loadUsers()
      } else {
        setError("Failed to delete user")
      }
      setIsDeleteDialogOpen(false)
      setDeletingUserId(null)
    }
  }

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <Badge variant="destructive">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <UserIcon className="w-3 h-3 mr-1" />
        User
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Create and manage user accounts for the firearms tracking system. Only administrators can access this
            section.
          </CardDescription>
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

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Active Users ({users.length})</h3>
              <p className="text-sm text-gray-600">Manage user accounts and access permissions</p>
            </div>
            <Button
              onClick={() => {
                setIsAddDialogOpen(true)
                clearMessages()
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{user.createdBy || "System"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleEditUser(user)
                            clearMessages()
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No users created yet. Click "Create User" to add the first user.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Security Guidelines
            </h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Only administrators can create and manage user accounts</li>
              <li>• Usernames must be at least 3 characters long and unique</li>
              <li>• Passwords must be at least 6 characters long</li>
              <li>• Provide login credentials directly to users - do not display them publicly</li>
              <li>• Regular users can access firearms tracking, admins can manage users</li>
              <li>• All user data is automatically saved and synchronized</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user account. You will need to provide the username and password to the user directly.
            </DialogDescription>
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
              <Label htmlFor="new-role">Access Level</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as "admin" | "user" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - Can access firearms tracking</SelectItem>
                  <SelectItem value="admin">Admin - Can manage users and access all features</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Account</DialogTitle>
            <DialogDescription>
              Update user account details. Leave password blank to keep the current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                value={editUserForm.username}
                onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                placeholder="Enter username (min 3 characters)"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editUserForm.password}
                onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                placeholder="Enter new password (min 6 characters) or leave blank"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Access Level</Label>
              <Select
                value={editUserForm.role}
                onValueChange={(value) => setEditUserForm({ ...editUserForm, role: value as "admin" | "user" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - Can access firearms tracking</SelectItem>
                  <SelectItem value="admin">Admin - Can manage users and access all features</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user account? This action cannot be undone and the user will lose
              access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
