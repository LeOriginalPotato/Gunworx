"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PenTool, RotateCcw, Save, AlertCircle, CheckCircle } from "lucide-react"

interface SignaturePadProps {
  onSave?: (signature: string, signerName: string, fullName: string) => void
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 200

    // Set drawing styles
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [isDialogOpen])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)

    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX, clientY
    if ("touches" in e) {
      e.preventDefault()
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = () => {
    setError("")

    if (!signerName.trim()) {
      setError("Signer name is required")
      return
    }

    if (!fullName.trim()) {
      setError("Full name is required")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      setError("Canvas not available")
      return
    }

    // Check if canvas is blank
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      setError("Canvas context not available")
      return
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const isBlank = imageData.data.every((value, index) => {
      // Check if pixel is white (255, 255, 255, 255) or transparent
      return index % 4 === 3 ? value === 255 : value === 255
    })

    if (isBlank) {
      setError("Please provide a signature before saving")
      return
    }

    try {
      const signatureDataURL = canvas.toDataURL("image/png")
      setSuccess(`Signature saved successfully for ${fullName}`)

      if (onSave) {
        onSave(signatureDataURL, signerName.trim(), fullName.trim())
      }

      // Reset form
      setSignerName("")
      setFullName("")
      clearCanvas()

      // Close dialog after a short delay
      setTimeout(() => {
        setIsDialogOpen(false)
        setSuccess("")
      }, 2000)
    } catch (err) {
      setError("Failed to save signature")
    }
  }

  // Clear messages when dialog opens/closes
  useEffect(() => {
    if (!isDialogOpen) {
      setError("")
      setSuccess("")
      setSignerName("")
      setFullName("")
    }
  }, [isDialogOpen])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PenTool className="w-4 h-4 mr-2" />
          Digital Signature
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Digital Signature Capture</DialogTitle>
          <DialogDescription>Please provide your signature and required information below</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Signer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signer-name">Signer Name *</Label>
              <Input
                id="signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter signer name"
              />
            </div>
            <div>
              <Label htmlFor="full-name">Full Name *</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full legal name"
              />
            </div>
          </div>

          {/* Signature Canvas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Signature Area</CardTitle>
              <CardDescription>
                Draw your signature using mouse or touch. Use the clear button to start over.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 rounded bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={clearCanvas}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button onClick={saveSignature}>
              <Save className="w-4 h-4 mr-2" />
              Save Signature
            </Button>
          </div>

          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <strong>Note:</strong> By providing your digital signature, you acknowledge that this signature has the same
            legal effect as a handwritten signature.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
