'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { LoginForm } from '@/components/login-form'
import { UserManagement } from '@/components/user-management'
import { SignaturePad } from '@/components/signature-pad'
import { authService, type User } from '@/lib/auth'
import { Users, FileText, Clock, CheckCircle, AlertCircle, LogOut, Shield, UserIcon } from 'lucide-react'

export default function GunworxPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const sessionId = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionId='))
        ?.split('=')[1]

      if (sessionId) {
        const validatedUser = await authService.validateSession(sessionId)
        setUser(validatedUser)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (username: string, password: string) => {
    try {
      const result = await authService.login(username, password)
      
      if (result.success && result.user && result.sessionId) {
        document.cookie = `sessionId=${result.sessionId}; path=/; max-age=86400`
        setUser(result.user)
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.firstName}!`,
        })
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      const sessionId = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionId='))
        ?.split('=')[1]

      if (sessionId) {
        await authService.logout(sessionId)
      }
      
      document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      setUser(null)
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Gunworx Portal</h1>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Employee Portal
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.role === 'admin' ? (
                  <Shield className="h-4 w-4 text-blue-600" />
                ) : (
                  <UserIcon className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-600">
            Manage your tasks, track progress, and stay connected with your team.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">3 urgent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">2 online now</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Task completed: Quality Check #1247</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New task assigned: Inventory Update</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Document signed: Safety Protocol</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Tasks requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Monthly safety training due in 3 days
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Equipment Maintenance Report</span>
                      <Badge variant="destructive">Due Today</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Inventory Audit</span>
                      <Badge variant="secondary">Due Tomorrow</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Team Meeting Prep</span>
                      <Badge variant="outline">Due Friday</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>View and manage your assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Task Management</h3>
                  <p className="text-gray-500">
                    Task management functionality will be implemented here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signature" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Digital Signature</CardTitle>
                <CardDescription>Create and manage your digital signatures</CardDescription>
              </CardHeader>
              <CardContent>
                <SignaturePad />
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserManagement />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}
