"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  CheckCircle,
  Clock,
  Users,
  Menu,
  Calendar,
  Award,
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Mail,
  User,
  School,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { redirect } from "next/navigation"

// Remove these imports - they're not available in next-lite

// Type for registration form
type RegistrationFormData = {
  teamName: string
  teamLeaderName: string
  teamLeaderEmail: string
  teamLeaderYear: string
  member2Name: string
  member2Email: string
  member2Year: string
  member3Name: string
  member3Email: string
  member3Year: string
  additionalInfo: string
}

// Custom hook for countdown timer
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

// FAQ data
const faqData = [
  {
    question: "Who is eligible to participate?",
    answer:
      "Only SMS ITMAWD students and 1st to 3rd Year IT students are eligible to join the competition. All participants must form teams of exactly three members.",
  },
  {
    question: "How are the rounds structured?",
    answer:
      "The competition consists of three levels: Easy, Medium, and Hard. Each level has three coding questions with different time limits. The Easy round has 30-minute questions, Medium has 15-minute questions, and Hard has 10-minute questions for the first two and a 5-minute question for the final one.",
  },
  {
    question: "What programming languages can we use?",
    answer:
      "Participants can use any of the following programming languages: Python, Java, C++, JavaScript, and C#. The competition platform will support all these languages.",
  },
  {
    question: "Are there any prizes for the winners?",
    answer:
      "Yes! The top three teams will receive prizes. First place will receive certificates and tech gadgets, second place will receive certificates and gift cards, and third place will receive certificates and competition merchandise.",
  },
  {
    question: "How will teams be evaluated?",
    answer:
      "Teams will be evaluated based on the correctness of their solutions, the efficiency of their algorithms, and the time taken to solve each problem. The team with the highest score will be declared the winner.",
  },
]

export default function Home() {
  redirect("/login")
  return null
}
