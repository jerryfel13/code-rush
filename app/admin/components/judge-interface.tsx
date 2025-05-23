"use client"

import { useState } from "react"
import { useAuth } from "../context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Award, LogOut, User, CheckCircle, XCircle, FileText, MessageSquare, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "./admin-header"
import { useToast } from "@/hooks/use-toast"

// Mock data for assigned teams
const MOCK_ASSIGNED_TEAMS = [
  {
    id: "1",
    name: "Code Wizards",
    members: ["John Doe", "Jane Smith", "Bob Johnson"],
    status: "In Progress",
    round: "Easy",
    question: 1,
    submission: {
      code: `function findMax(arr) {
  if (arr.length === 0) return null;
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
      language: "JavaScript",
      submittedAt: "2024-05-24T10:15:00Z",
    },
  },
  {
    id: "2",
    name: "Binary Beasts",
    members: ["Alice Brown", "Charlie Davis", "Eve Wilson"],
    status: "Submitted",
    round: "Easy",
    question: 2,
    submission: {
      code: `def is_palindrome(s):
    s = s.lower()
    s = ''.join(c for c in s if c.isalnum())
    return s == s[::-1]`,
      language: "Python",
      submittedAt: "2024-05-24T10:30:00Z",
    },
  },
  {
    id: "3",
    name: "Algorithm Aces",
    members: ["Frank Miller", "Grace Lee", "Henry Taylor"],
    status: "Waiting",
    round: "Easy",
    question: 3,
    submission: null,
  },
]

export function JudgeInterface() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("assigned")
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [score, setScore] = useState<string>("0")
  const [feedback, setFeedback] = useState<string>("")
  const [chatMessage, setChatMessage] = useState<string>("")

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const handleSubmitScore = () => {
    toast({
      title: "Score Submitted",
      description: `You've submitted a score of ${score} for team ${selectedTeam}`,
    })
    setSelectedTeam(null)
    setScore("0")
    setFeedback("")
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    toast({
      title: "Message Sent",
      description: `Your message has been sent to team ${selectedTeam}`,
    })
    setChatMessage("")
  }

  const selectedTeamData = MOCK_ASSIGNED_TEAMS.find((team) => team.id === selectedTeam)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 py-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Judge Dashboard</span>
                  </div>
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  <Button
                    variant={activeTab === "assigned" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("assigned")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Assigned Teams
                  </Button>
                  <Button
                    variant={activeTab === "submissions" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("submissions")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Submissions
                  </Button>
                  <Button
                    variant={activeTab === "messages" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("messages")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {!selectedTeam ? (
              <>
                <h1 className="text-2xl font-bold mb-6">Judge Dashboard</h1>

                {activeTab === "assigned" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Assigned Teams</CardTitle>
                        <CardDescription>Teams you are responsible for judging</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {MOCK_ASSIGNED_TEAMS.map((team) => (
                            <Card key={team.id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">{team.name}</h3>
                                      <Badge
                                        variant={
                                          team.status === "In Progress"
                                            ? "secondary"
                                            : team.status === "Submitted"
                                              ? "default"
                                              : "outline"
                                        }
                                      >
                                        {team.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {team.round} Round - Question {team.question}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Members: {team.members.join(", ")}</p>
                                  </div>
                                  <div className="mt-4 md:mt-0">
                                    <Button
                                      size="sm"
                                      disabled={team.status === "Waiting"}
                                      onClick={() => setSelectedTeam(team.id)}
                                    >
                                      {team.status === "Submitted" ? "Review" : "View"}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "submissions" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>Latest code submissions from your assigned teams</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {MOCK_ASSIGNED_TEAMS.filter((team) => team.submission).map((team) => (
                            <Card key={team.id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="flex flex-col p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium">{team.name}</h3>
                                      <Badge>{team.submission?.language}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Submitted: {new Date(team.submission?.submittedAt || "").toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                                    <pre className="text-xs">
                                      <code>{team.submission?.code}</code>
                                    </pre>
                                  </div>
                                  <div className="mt-3 flex justify-end">
                                    <Button size="sm" onClick={() => setSelectedTeam(team.id)}>
                                      Review
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "messages" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Messages</CardTitle>
                        <CardDescription>Communication with your assigned teams</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {MOCK_ASSIGNED_TEAMS.map((team) => (
                            <Card key={team.id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-4">
                                  <div className="space-y-1">
                                    <h3 className="font-medium">{team.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {team.round} Round - Question {team.question}
                                    </p>
                                  </div>
                                  <div className="mt-4 md:mt-0">
                                    <Button size="sm" variant="outline" onClick={() => setSelectedTeam(team.id)}>
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      Message
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{selectedTeamData?.name}</h1>
                  <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                    Back to List
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Round</p>
                          <p className="font-medium">{selectedTeamData?.round}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Question</p>
                          <p className="font-medium">{selectedTeamData?.question}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium">{selectedTeamData?.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Members</p>
                          <p className="font-medium">{selectedTeamData?.members.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedTeamData?.submission && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Code Submission</CardTitle>
                      <CardDescription>
                        Submitted: {new Date(selectedTeamData.submission.submittedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge>{selectedTeamData.submission.language}</Badge>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                          <pre className="text-sm">
                            <code>{selectedTeamData.submission.code}</code>
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Evaluation</CardTitle>
                    <CardDescription>Score and provide feedback for this submission</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="score">Score (0-100)</Label>
                        <Input
                          id="score"
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                          id="feedback"
                          placeholder="Provide feedback on the submission..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSubmitScore}
                          disabled={!score || Number.parseInt(score) < 0 || Number.parseInt(score) > 100}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Submit Evaluation
                        </Button>
                        <Button variant="outline">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Submission
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Communication</CardTitle>
                    <CardDescription>Send messages to the team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 h-48 overflow-y-auto">
                        <div className="space-y-3">
                          <div className="flex flex-col">
                            <div className="bg-primary/10 text-primary-foreground p-2 rounded-md max-w-[80%] self-start">
                              <p className="text-sm">
                                Hello, we're having trouble with the second test case. Can you provide a hint?
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Team {selectedTeamData?.name} - 10:45 AM
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="bg-primary text-primary-foreground p-2 rounded-md max-w-[80%] self-end">
                              <p className="text-sm">Have you considered edge cases with empty arrays?</p>
                              <p className="text-xs text-primary-foreground/70 mt-1">You - 10:48 AM</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="min-h-[40px]"
                        />
                        <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
