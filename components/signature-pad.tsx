"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pen, RotateCcw, Save, AlertCircle } from "lucide-react"

interface SignaturePadProps {
  isOpen: boolean
  onClose: () => void
  onSave: (signature: string, signerName: string, fullName: string) => void
  title?: string
}

export function SignaturePad({ isOpen, onClose, onSave, title = "Digital Signature" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      setSignerName("")
      setFullName("")
      setError("")
      setHasSignature(false)

      // Initialize canvas
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Set canvas size
          canvas.width = 400
          canvas.height = 200

          // Set drawing properties
          ctx.strokeStyle = "#000000"
          ctx.lineWidth = 2
          ctx.lineCap = "round"
          ctx.lineJoin = "round"

          // Clear canvas with white background
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }, [isOpen])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

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
      e.preventDefault() // Prevent scrolling on touch
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
    setHasSignature(false)
  }

  const handleSave = () => {
    setError("")

    if (!signerName.trim()) {
      setError("Signer name is required")
      return
    }

    if (!fullName.trim()) {
      setError("Full name is required")
      return
    }

    if (!hasSignature) {
      setError("Please provide a signature")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      setError("Canvas not available")
      return
    }

    try {
      const signatureData = canvas.toDataURL("image/png")
      onSave(signatureData, signerName.trim(), fullName.trim())
      onClose()
    } catch (err) {
      setError("Failed to save signature")
    }
  }

  const handleClose = () => {
    setSignerName("")
    setFullName("")
    setError("")
    setHasSignature(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>Please enter your details and provide your digital signature below</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Signer Name Input */}
          <div>
            <Label htmlFor="signer-name">Signer Name *</Label>
            <Input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your name as it should appear"
            />
          </div>

          {/* Full Name Input */}
          <div>
            <Label htmlFor="full-name">Full Name *</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full legal name"
            />
          </div>

          {/* Signature Canvas */}
          <div>
            <Label>Signature *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded bg-white cursor-crosshair touch-none"
                style={{ width: "100%", height: "150px" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Sign above using mouse or touch</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 bg-transparent"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Signature
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
