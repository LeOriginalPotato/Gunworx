"use client"

import type React from "react"

import { useRef, useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { PenTool, RotateCcw, Save } from "lucide-react"

interface SignaturePadProps {
  onSave: (signature: string, signerName: string, fullName: string) => void
  trigger?: React.ReactNode
}

export function SignaturePad({ onSave, trigger }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [signerName, setSignerName] = useState("")
  const [fullName, setFullName] = useState("")

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

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
  }

  const saveSignature = () => {
    if (!signerName.trim()) {
      alert("Please enter the signer's name")
      return
    }

    if (!fullName.trim()) {
      alert("Please enter the full name")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL()
    onSave(dataURL, signerName.trim(), fullName.trim())
    setIsOpen(false)
    setSignerName("")
    setFullName("")
    clearCanvas()
  }

  const setupCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <PenTool className="w-4 h-4 mr-2" />
            Add Signature
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Digital Signature</DialogTitle>
          <DialogDescription>Sign your name in the area below and provide your details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signer-name">Signer Name *</Label>
              <Input
                id="signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter signer's name"
                required
              />
            </div>
            <div>
              <Label htmlFor="full-name">Full Name *</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="border border-gray-200 rounded cursor-crosshair w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onLoad={setupCanvas}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">Click and drag to sign above</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={clearCanvas}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button onClick={saveSignature}>
            <Save className="w-4 h-4 mr-2" />
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
