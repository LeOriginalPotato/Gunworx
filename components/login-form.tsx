"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle } from "lucide-react"
import { authService, type User } from "@/lib/auth"

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password")
      setIsLoading(false)
      return
    }

    try {
      const user = authService.login(username.trim(), password)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Gunworx Employee Portal</h2>
          <p className="mt-2 text-sm text-gray-600">FIREARMS CONTROL ACT, 2000 (Act No. 60 of 2000)</p>
          <p className="mt-4 text-sm text-gray-500">Sign in to access the firearms tracking system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">System Access</h4>
            <p className="text-sm text-blue-700">
              Contact your system administrator for login credentials. All access is logged and monitored for security
              purposes.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Security Notice</h4>
            <ul className="text-sm text-orange-700 space-y-1 text-left">
              <li>• This system is for authorized personnel only</li>
              <li>• All activities are logged and monitored</li>
              <li>• Unauthorized access is prohibited</li>
              <li>• Report any security concerns immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
