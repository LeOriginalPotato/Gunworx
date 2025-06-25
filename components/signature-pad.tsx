"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Pen, RotateCcw, Save, X, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SignaturePadProps {
  onSignatureSave: (signature: string, signerName: string) => void
  isOpen: boolean
  onClose: () => void
  title?: string
  signerName?: string
}

export function SignaturePad({
  onSignatureSave,
  isOpen,
  onClose,
  title = "Capture Signature",
  signerName = "",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [currentSignerName, setCurrentSignerName] = useState(signerName)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [tabletDetected, setTabletDetected] = useState(false)
  const [pointerType, setPointerType] = useState<string>("")

  // Detect signature tablet/stylus support
  useEffect(() => {
    const checkTabletSupport = () => {
      // Check for pointer events support (better for tablets)
      const hasPointerEvents = "PointerEvent" in window

      // Check for touch support
      const hasTouchSupport = "ontouchstart" in window || navigator.maxTouchPoints > 0

      // Check for pressure sensitivity support
      const hasPressureSupport = "onpointerdown" in window

      setTabletDetected(hasPointerEvents && (hasTouchSupport || hasPressureSupport))
    }

    checkTabletSupport()
  }, [])

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size with higher resolution for better quality
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    // Set actual canvas size
    canvas.width = 800 * dpr
    canvas.height = 400 * dpr

    // Scale the canvas back down using CSS
    canvas.style.width = "100%"
    canvas.style.height = "200px"
    canvas.style.maxWidth = "800px"

    // Scale the drawing context
    ctx.scale(dpr, dpr)

    // Set drawing styles optimized for signature tablets
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.imageSmoothingEnabled = true

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 800, 400)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(initializeCanvas, 100)
    }
  }, [isOpen, initializeCanvas])

  // Pointer Events (best for signature tablets)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (800 / rect.width)
    const y = (e.clientY - rect.top) * (400 / rect.height)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Detect pointer type
    setPointerType(e.pointerType)

    // Support pressure sensitivity
    const pressure = e.pressure || 0.5
    const lineWidth = Math.max(1, pressure * 4)
    ctx.lineWidth = lineWidth

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)

    // Capture pointer for better tracking
    canvas.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return
      e.preventDefault()

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * (800 / rect.width)
      const y = (e.clientY - rect.top) * (400 / rect.height)

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Support pressure sensitivity
      const pressure = e.pressure || 0.5
      const lineWidth = Math.max(1, pressure * 4)
      ctx.lineWidth = lineWidth

      ctx.lineTo(x, y)
      ctx.stroke()
      setHasSignature(true)
    },
    [isDrawing],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId)
    }
  }, [])

  // Fallback mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (800 / rect.width)
    const y = (e.clientY - rect.top) * (400 / rect.height)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineWidth = 2
    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (800 / rect.width)
    const y = (e.clientY - rect.top) * (400 / rect.height)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Touch events for mobile devices
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = (touch.clientX - rect.left) * (800 / rect.width)
    const y = (touch.clientY - rect.top) * (400 / rect.height)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Support force touch on supported devices
    const pressure = (touch as any).force || 0.5
    const lineWidth = Math.max(1, pressure * 4)
    ctx.lineWidth = lineWidth

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = (touch.clientX - rect.left) * (800 / rect.width)
    const y = (touch.clientY - rect.top) * (400 / rect.height)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Support force touch on supported devices
    const pressure = (touch as any).force || 0.5
    const lineWidth = Math.max(1, pressure * 4)
    ctx.lineWidth = lineWidth

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 800, 400)
    setHasSignature(false)
    setUploadedImage(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Clear canvas
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, 800, 400)

        // Calculate scaling to fit image in canvas while maintaining aspect ratio
        const scale = Math.min(800 / img.width, 400 / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (800 - scaledWidth) / 2
        const y = (400 - scaledHeight) / 2

        // Draw image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        setHasSignature(true)
        setUploadedImage(event.target?.result as string)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const saveSignature = () => {
    if (!hasSignature) {
      alert("Please provide a signature first")
      return
    }

    if (!currentSignerName.trim()) {
      alert("Please enter the signer's name")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const signatureDataURL = canvas.toDataURL("image/png", 1.0)
    onSignatureSave(signatureDataURL, currentSignerName.trim())
    onClose()

    // Reset state
    clearSignature()
    setCurrentSignerName("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tablet Detection Status */}
          {tabletDetected && (
            <Alert>
              <Pen className="h-4 w-4" />
              <AlertDescription>
                Signature tablet detected! Using pointer type: {pointerType || "stylus/pen"}
                <br />
                <strong>Instructions:</strong> Use your stylus or pen to sign directly on the signature area below.
              </AlertDescription>
            </Alert>
          )}

          {!tabletDetected && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No signature tablet detected. You can still sign using:
                <br />• Mouse or trackpad • Touch screen • Upload a signature image
                <br />
                <strong>For signature tablets:</strong> Make sure your tablet drivers are installed and the tablet is
                connected.
              </AlertDescription>
            </Alert>
          )}

          {/* Signer Name Input */}
          <div>
            <Label htmlFor="signerName">Signer Name *</Label>
            <Input
              id="signerName"
              value={currentSignerName}
              onChange={(e) => setCurrentSignerName(e.target.value)}
              placeholder="Enter the name of the person signing"
            />
          </div>

          {/* Signature Canvas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Signature Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="border-2 border-gray-400 bg-white cursor-crosshair rounded w-full"
                  style={{
                    touchAction: "none",
                    height: "200px",
                    maxWidth: "100%",
                  }}
                  // Pointer Events (best for signature tablets)
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  // Mouse Events (fallback)
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  // Touch Events (mobile)
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={stopDrawingTouch}
                />
                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <p className="font-medium">How to sign:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <strong>Signature Tablet:</strong> Use your stylus/pen on the tablet surface
                    </li>
                    <li>
                      <strong>Touch Screen:</strong> Use your finger or stylus directly on the signature area
                    </li>
                    <li>
                      <strong>Mouse/Trackpad:</strong> Click and drag to draw your signature
                    </li>
                    <li>
                      <strong>Upload:</strong> Use the upload button below to add a signature image
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alternative: Upload Signature Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="signature-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      Upload Signature Image
                    </div>
                  </Label>
                  <Input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF • Use this for scanned signatures, photos of ink signatures, or if
                  your signature tablet isn't working
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting for Signature Tablets */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm text-blue-800">Signature Tablet Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-blue-700 space-y-2">
              <p>
                <strong>If your signature tablet isn't working:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Make sure your tablet drivers are installed and up to date</li>
                <li>Check that your tablet is properly connected (USB/Bluetooth)</li>
                <li>Try refreshing the page after connecting your tablet</li>
                <li>Some tablets require specific browser settings - try Chrome or Edge</li>
                <li>For Wacom tablets, ensure Wacom drivers are running</li>
                <li>Test your tablet in other applications first to confirm it's working</li>
              </ul>
              <p className="mt-2 font-medium">
                Popular supported tablets: Wacom Intuos, Wacom Bamboo, Huion, XP-Pen, and most USB signature pads
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearSignature} disabled={!hasSignature}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Signature
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveSignature} disabled={!hasSignature || !currentSignerName.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Save Signature
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
