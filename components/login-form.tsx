"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, Shield } from "lucide-react"
import { authService, type User } from "@/lib/auth"

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const user = await authService.login(username, password)
      if (user) {
        onLogin(user)
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestLogin = async (testUsername: string, testPassword: string) => {
    setUsername(testUsername)
    setPassword(testPassword)
    setError("")
    setIsLoading(true)

    try {
      const user = await authService.login(testUsername, testPassword)
      if (user) {
        onLogin(user)
      } else {
        setError("Test login failed")
      }
    } catch (err) {
      setError("Test login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Gunworx Portal</CardTitle>
          <CardDescription>Employee access to firearms tracking system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3 text-center">Available Test Accounts:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left justify-start bg-transparent"
                onClick={() => handleTestLogin("Jean-Mari", "Password123")}
                disabled={isLoading}
              >
                <Shield className="w-3 h-3 mr-2 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Jean-Mari (System Admin)</div>
                  <div className="text-xs text-gray-500">Password: Password123</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left justify-start bg-transparent"
                onClick={() => handleTestLogin("JP", "xNgU7ADa")}
                disabled={isLoading}
              >
                <Shield className="w-3 h-3 mr-2 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium">JP (Admin)</div>
                  <div className="text-xs text-gray-500">Password: xNgU7ADa</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left justify-start bg-transparent"
                onClick={() => handleTestLogin("admin", "admin123")}
                disabled={isLoading}
              >
                <Shield className="w-3 h-3 mr-2 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">admin (Admin)</div>
                  <div className="text-xs text-gray-500">Password: admin123</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">Authorized personnel only. All activities are logged and monitored.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
