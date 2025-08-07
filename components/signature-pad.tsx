"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    
    setIsDrawing(true)
    setHasSignature(true)
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    
    if (ctx) {
      let x, y
      
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left
        y = e.touches[0].clientY - rect.top
      } else {
        x = e.clientX - rect.left
        y = e.clientY - rect.top
      }
      
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    
    if (ctx) {
      let x, y
      
      if ('touches' in e) {
        e.preventDefault()
        x = e.touches[0].clientX - rect.left
        y = e.touches[0].clientY - rect.top
      } else {
        x = e.clientX - rect.left
        y = e.clientY - rect.top
      }
      
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
    }
  }

  const saveSignature = () => {
    if (!canvasRef.current || !signerName.trim() || !hasSignature) {
      alert("Please provide your name and signature")
      return
    }
    
    const canvas = canvasRef.current
    const signatureData = canvas.toDataURL("image/png")
    
    onSignatureSave(signatureData, signerName.trim())
    
    // Reset form
    setSignerName("")
    setHasSignature(false)
    clearSignature()
    onClose()
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
          <DialogDescription>
            Please sign below to confirm the transaction
          </DialogDescription>
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
                className="w-full h-32 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sign above using your mouse or finger
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearSignature}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              onClick={saveSignature}
              disabled={!signerName.trim() || !hasSignature}
              className="flex-1"
            >
              Save Signature
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
