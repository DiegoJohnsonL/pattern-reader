"use client"

import React, { useState, useRef } from "react"
import { Plus, Minus, X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Counter {
  id: string
  value: number
  x: number
  y: number
}

interface CounterCardProps {
  counter: Counter
  onUpdate: (id: string, updates: Partial<Counter>) => void
  onRemove: (id: string) => void
}

export function CounterCard({ counter, onUpdate, onRemove }: CounterCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === cardRef.current || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true)
      const rect = cardRef.current!.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 200
      const maxY = window.innerHeight - 100
      
      onUpdate(counter.id, {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const increment = () => {
    onUpdate(counter.id, { value: counter.value + 1 })
  }

  const decrement = () => {
    onUpdate(counter.id, { value: Math.max(0, counter.value - 1) })
  }

  const remove = () => {
    onRemove(counter.id)
  }

  return (
    <div
      ref={cardRef}
      className="fixed bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-lg p-3 w-48 z-50 select-none"
      style={{
        left: counter.x,
        top: counter.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag handle */}
      <div 
        data-drag-handle
        className="flex items-center justify-center w-full h-6 mb-2 cursor-grab hover:bg-muted/50 rounded-lg transition-colors"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Counter value */}
      <div className="text-center mb-3">
        <span className="text-2xl font-bold text-foreground">{counter.value}</span>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={decrement}
          className="flex-1 rounded-xl"
        >
          <Minus className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={increment}
          className="flex-1 rounded-xl"
        >
          <Plus className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={remove}
          className="rounded-xl hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
