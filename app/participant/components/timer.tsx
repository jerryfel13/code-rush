"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertTriangle } from "lucide-react"

interface TimerProps {
  time: number // in seconds, controlled by parent
  onTimeUp: () => void
  isPaused: boolean
  onTick?: (remaining: number) => void // Optional callback for parent to track remaining time
}

export function Timer({ time, onTimeUp, isPaused, onTick }: TimerProps) {
  useEffect(() => {
    if (time <= 0) {
      onTimeUp();
      return;
    }
    if (isPaused) return;
    const timer = setInterval(() => {
      if (onTick && time > 0) onTick(time - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [time, isPaused, onTimeUp, onTick]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={time <= 300 ? "border-red-500" : ""}>
      <CardContent className="p-3 flex items-center gap-2">
        {time <= 300 ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-primary" />}
        <span className={`font-mono text-lg ${time <= 300 ? "text-red-500 font-bold" : ""}`}>
          {formatTime(time)}
        </span>
      </CardContent>
    </Card>
  )
}
