"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertTriangle } from "lucide-react"

interface TimerProps {
  initialTime: number // in seconds
  onTimeUp: () => void
}

export function Timer({ initialTime, onTimeUp }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    // Reset timer when initialTime changes
    setTimeRemaining(initialTime)
    setIsWarning(false)
  }, [initialTime])

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp()
      return
    }

    // Set warning when less than 5 minutes remaining
    if (timeRemaining <= 300 && !isWarning) {
      setIsWarning(true)
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isWarning, onTimeUp])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={isWarning ? "border-red-500" : ""}>
      <CardContent className="p-3 flex items-center gap-2">
        {isWarning ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-primary" />}
        <span className={`font-mono text-lg ${isWarning ? "text-red-500 font-bold" : ""}`}>
          {formatTime(timeRemaining)}
        </span>
      </CardContent>
    </Card>
  )
}
