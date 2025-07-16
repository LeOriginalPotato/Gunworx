"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { PenTool, RotateCcw, Save, X } from "lucide-react"

interface SignaturePadProps {
  isOpen: boolean
  onClose: () => void
  onSignatureSave: (signatureData: string, signerName: string) => void
  title?: string
}

export function SignaturePad({ isOpen, onClose, onSignatureSave, title = "Digital Signature" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setSignerName("")
      setHasSignature(false)
      clearCanvas()
    }
  }, [isOpen])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasSignature(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

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

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up canvas for drawing
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    setHasSignature(false)
  }

  const saveSignature = () => {
    if (!hasSignature) {
      alert("Please provide a signature")
      return
    }

    if (!signerName.trim()) {
      alert("Please enter the signer's full name")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL("image/png")
    onSignatureSave(signatureData, signerName.trim())
    onClose()
  }

  const handleClose = () => {
    setSignerName("")
    setHasSignature(false)
    clearCanvas()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>Please enter your full name and provide your digital signature below</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Signer Name Input */}
          <div>
            <Label htmlFor="signer-name">Full Name *</Label>
            <Input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>

          {/* Signature Canvas */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-2">
                <Label>Digital Signature *</Label>
                <p className="text-sm text-gray-500">Sign in the box below using your mouse or touch</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full h-48 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    startDrawing(e)
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault()
                    draw(e)
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    stopDrawing()
                  }}
                />
              </div>

              <div className="flex justify-center mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Signature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={saveSignature} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Signature
            </Button>
            <Button variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p>
              <strong>Instructions:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Enter your full legal name in the field above</li>
              <li>Sign your name in the signature box using your mouse or finger</li>
              <li>Use the "Clear Signature" button to start over if needed</li>
              <li>Click "Save Signature" when you're satisfied with your signature</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
