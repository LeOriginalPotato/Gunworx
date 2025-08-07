'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { authService, User } from '@/lib/auth'
import { LogIn, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const user = await authService.login(username, password)
      onLogin(user)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">GW</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Gunworx Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Available Accounts:</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Jean-Mari:</span>
                  <span className="font-mono">Foktogbokka</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Jean:</span>
                  <span className="font-mono">xNgU7ADa</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Wikus:</span>
                  <span className="font-mono">Wikus@888</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Eben:</span>
                  <span className="font-mono">UY9FBe8abajU</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Francois:</span>
                  <span className="font-mono">MnWbCkE4AcFP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
