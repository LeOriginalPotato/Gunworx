"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Save } from "lucide-react"

interface SignaturePadProps {
  isOpen: boolean
  onClose: () => void
  onSignatureSave: (signatureData: string, signerName: string) => void
  title: string
}

export function SignaturePad({ isOpen, onClose, onSignatureSave, title }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [hasSignature, setHasSignature] = useState(false)

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
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
      }
    }
  }

  const saveSignature = () => {
    if (!hasSignature || !signerName.trim()) {
      alert("Please provide a signature and signer name")
      return
    }

    const canvas = canvasRef.current
    if (canvas) {
      const signatureData = canvas.toDataURL("image/png")
      onSignatureSave(signatureData, signerName.trim())
      setSignerName("")
      setHasSignature(false)
      onClose()
    }
  }

  const handleClose = () => {
    setSignerName("")
    setHasSignature(false)
    clearSignature()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Please sign below and provide your name to confirm the transaction.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="signer-name">Signer Name *</Label>
            <Input
              id="signer-name"
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
                className="border border-gray-200 cursor-crosshair w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ maxWidth: "100%", height: "150px" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Click and drag to sign above</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearSignature}
              className="flex-1 bg-transparent"
              disabled={!hasSignature}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button onClick={saveSignature} className="flex-1" disabled={!hasSignature || !signerName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Signature
            </Button>
          </div>

          <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
