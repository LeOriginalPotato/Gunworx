"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Shield, User } from 'lucide-react'
import { authService, type User } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

interface UserManagementProps {
  currentUser: User
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as "admin" | "user",
    isSystemAdmin: false,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const userList = await authService.getUsers()
      setUsers(userList)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const userExists = await authService.userExists(newUser.username)
      if (userExists) {
        alert("Username already exists")
        return
      }

      await authService.createUser({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        isSystemAdmin: newUser.isSystemAdmin,
      })

      setNewUser({
        username: "",
        password: "",
        role: "user",
        isSystemAdmin: false,
      })
      setIsAddUserOpen(false)
      loadUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
      alert("Failed to create user")
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditUserOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.username || !editingUser.password) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await authService.updateUser(editingUser)
      setEditingUser(null)
      setIsEditUserOpen(false)
      loadUsers()
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("Failed to update user")
    }
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user?.isSystemAdmin) {
      alert("Cannot delete system administrator")
      return
    }
    setDeleteUserId(userId)
  }

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return

    try {
      await authService.deleteUser(deleteUserId)
      setDeleteUserId(null)
      loadUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Failed to delete user")
    }
  }

  const getUserRoleBadge = (user: User) => {
    if (user.isSystemAdmin) {
      return <Badge className="bg-purple-100 text-purple-800">System Admin</Badge>
    }
    if (user.role === "admin") {
      return <Badge className="bg-orange-100 text-orange-800">Admin</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">User</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users and their permissions</CardDescription>
          </div>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "admin" | "user") => setNewUser((prev) => ({ ...prev, role: value }))}
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
                {currentUser.isSystemAdmin && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isSystemAdmin"
                      checked={newUser.isSystemAdmin}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, isSystemAdmin: e.target.checked }))}
                    />
                    <Label htmlFor="isSystemAdmin">System Administrator</Label>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddUser} className="flex-1">
                  Add User
                </Button>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
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
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {user.isSystemAdmin ? (
                      <Shield className="w-4 h-4 text-purple-600" />
                    ) : user.role === "admin" ? (
                      <Shield className="w-4 h-4 text-orange-600" />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                    {user.username}
                  </div>
                </TableCell>
                <TableCell>{getUserRoleBadge(user)}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : "Never"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={user.isSystemAdmin}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Password *</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
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
              {currentUser.isSystemAdmin && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isSystemAdmin"
                    checked={editingUser.isSystemAdmin || false}
                    onChange={(e) => setEditingUser({ ...editingUser, isSystemAdmin: e.target.checked })}
                  />
                  <Label htmlFor="edit-isSystemAdmin">System Administrator</Label>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdateUser} className="flex-1">
              Update User
            </Button>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
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
    </Card>
  )
}
