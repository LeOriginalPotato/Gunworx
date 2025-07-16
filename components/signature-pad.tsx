"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PenTool, RotateCcw, Save } from "lucide-react"

interface SignaturePadProps {
  isOpen: boolean
  onClose: () => void
  onSignatureSave: (signatureData: string, signerName: string) => void
  title: string
  signerName?: string
}

export function SignaturePad({ isOpen, onClose, onSignatureSave, title, signerName = "" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentSignerName, setCurrentSignerName] = useState(signerName)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    setCurrentSignerName(signerName)
  }, [signerName])

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Set canvas size
        canvas.width = 400
        canvas.height = 200

        // Set drawing styles
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        // Clear canvas
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [isOpen])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
      setHasSignature(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    if (!currentSignerName.trim()) {
      alert("Please enter the signer's name")
      return
    }

    const signatureData = canvas.toDataURL("image/png")
    onSignatureSave(signatureData, currentSignerName.trim())
    onClose()
    clearSignature()
    setCurrentSignerName("")
  }

  const handleClose = () => {
    clearSignature()
    setCurrentSignerName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Please sign below to confirm the transaction. Enter your name and draw your signature.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="signer-name">Full Name *</Label>
            <Input
              id="signer-name"
              value={currentSignerName}
              onChange={(e) => setCurrentSignerName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label>Digital Signature *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
              <canvas
                ref={canvasRef}
                className="w-full h-32 border border-gray-200 rounded cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Click and drag to draw your signature above</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={clearSignature} disabled={!hasSignature}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={saveSignature} disabled={!hasSignature || !currentSignerName.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
