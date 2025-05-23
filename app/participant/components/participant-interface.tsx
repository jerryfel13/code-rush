"use client"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParticipantAuth } from "../context/participant-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Send, MessageSquare } from "lucide-react"
import { ParticipantHeader } from "./participant-header"
import { QuestionDisplay } from "./question-display"
import { Timer } from "./timer"
import { ProtectedParticipantRoute } from "./protected-participant-route"
import { mockQuestions } from "../data/mock-questions"

export function ParticipantInterface() {
  const { participant, logout } = useParticipantAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeRound, setActiveRound] = useState("easy")
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Get questions for the active round
  const roundQuestions = mockQuestions[activeRound as keyof typeof mockQuestions] || []
  const currentQuestion = roundQuestions[activeQuestionIndex]

  // Set initial time based on the round
  useEffect(() => {
    if (activeRound === "easy") {
      setTimeRemaining(30 * 60) // 30 minutes in seconds
    } else if (activeRound === "medium") {
      setTimeRemaining(15 * 60) // 15 minutes in seconds
    } else if (activeRound === "hard") {
      // For hard round, first two questions are 10 minutes, last is 5 minutes
      if (activeQuestionIndex < 2) {
        setTimeRemaining(10 * 60) // 10 minutes in seconds
      } else {
        setTimeRemaining(5 * 60) // 5 minutes in seconds
      }
    }
  }, [activeRound, activeQuestionIndex])

  const handleLogout = () => {
    logout()
    router.push("/participant/login")
  }

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "The time for this question has expired.",
      variant: "destructive",
    })
  }

  return (
    <ProtectedParticipantRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ParticipantHeader participant={participant} onLogout={handleLogout} />

        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold">Coding Competition</h1>
                <p className="text-muted-foreground">
                  Team: {participant?.teamName} | Participant: {participant?.name}
                </p>
              </div>

              {timeRemaining !== null && <Timer initialTime={timeRemaining} onTimeUp={handleTimeUp} />}
            </div>

            <Tabs value={activeRound} onValueChange={setActiveRound} className="mb-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="easy">Easy Round</TabsTrigger>
                <TabsTrigger value="medium">Medium Round</TabsTrigger>
                <TabsTrigger value="hard">Hard Round</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2 mb-4">
              {roundQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant={index === activeQuestionIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  Question {index + 1}
                </Button>
              ))}
            </div>
          </div>

          {currentQuestion ? (
            <div className="space-y-6">
              <QuestionDisplay question={currentQuestion} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Ask for Help
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input placeholder="Type your question here..." />
                    <Button variant="outline">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No questions available for this round.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedParticipantRoute>
  )
}
