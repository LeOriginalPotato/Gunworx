"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { users as initialUsers } from "@/lib/auth"
import { Plus, Edit, Trash2, Users, Eye, EyeOff } from "lucide-react"

interface User {
  id: string
  username: string
  password: string
  name: string
  role: string
  isSystemAdmin?: boolean
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    role: "user",
  })

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast({
        title: "Validation Error",
        description: "Username, password, and name are required.",
        variant: "destructive",
      })
      return
    }

    if (users.some((u) => u.username === newUser.username)) {
      toast({
        title: "Username Exists",
        description: "A user with this username already exists.",
        variant: "destructive",
      })
      return
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      role: newUser.role,
      isSystemAdmin: newUser.role === "admin",
      createdAt: new Date().toISOString(),
    }

    try {
      // In a real app, this would be an API call
      setUsers([...users, user])
      setNewUser({ username: "", password: "", name: "", role: "user" })
      setIsAddDialogOpen(false)

      toast({
        title: "User Added",
        description: `User ${newUser.username} has been successfully added.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    if (!editingUser.username || !editingUser.password || !editingUser.name) {
      toast({
        title: "Validation Error",
        description: "Username, password, and name are required.",
        variant: "destructive",
      })
      return
    }

    if (users.some((u) => u.id !== editingUser.id && u.username === editingUser.username)) {
      toast({
        title: "Username Exists",
        description: "A user with this username already exists.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedUser = {
        ...editingUser,
        isSystemAdmin: editingUser.role === "admin",
      }

      setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)))
      setIsEditDialogOpen(false)
      setEditingUser(null)

      toast({
        title: "User Updated",
        description: "User details have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    if (user.isSystemAdmin && users.filter((u) => u.isSystemAdmin).length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the last system administrator.",
        variant: "destructive",
      })
      return
    }

    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      try {
        setUsers(users.filter((u) => u.id !== userId))
        toast({
          title: "User Deleted",
          description: `User ${user.username} has been deleted.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      case "inspector":
        return "secondary"
      case "operator":
        return "outline"
      case "viewer":
        return "outline"
      default:
        return "outline"
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>Manage system users, roles, and permissions</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account for the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-username">Username</Label>
                    <Input
                      id="new-username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-name">Full Name</Label>
                    <Input
                      id="new-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">Password</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="new-password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNewUser({ ...newUser, password: generatePassword() })}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="new-role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="inspector">Inspector</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser}>Add User</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{showPasswords[user.id] ? user.password : "••••••••"}</span>
                        <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(user.id)}>
                          {showPasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.isSystemAdmin ? (
                        <Badge variant="secondary">System Admin</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.isSystemAdmin && users.filter((u) => u.isSystemAdmin).length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user account details</DialogDescription>
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
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Password</Label>
                <div className="flex space-x-2">
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUser({ ...editingUser, password: generatePassword() })}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveUser}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
