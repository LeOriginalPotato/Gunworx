"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
      }
    }
  }, [isOpen])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
      }
    }
  }

  const saveSignature = () => {
    if (!hasSignature || !signerName.trim()) {
      alert("Please provide your name and signature")
      return
    }

    const canvas = canvasRef.current
    if (canvas) {
      const signatureData = canvas.toDataURL()
      onSignatureSave(signatureData, signerName.trim())
      clearSignature()
      setSignerName("")
      onClose()
    }
  }

  const handleClose = () => {
    clearSignature()
    setSignerName("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="signerName">Full Name *</Label>
            <Input
              id="signerName"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label>Signature *</Label>
            <div className="border border-gray-300 rounded-md p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 cursor-crosshair signature-pad"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sign above using your mouse or touch device
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={saveSignature} className="flex-1">
              Save Signature
            </Button>
            <Button variant="outline" onClick={clearSignature}>
              Clear
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
