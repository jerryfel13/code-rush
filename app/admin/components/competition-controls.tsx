"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Play, Pause, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CompetitionControls() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("easy")

  // Competition state
  const [easyRoundActive, setEasyRoundActive] = useState(true)
  const [mediumRoundActive, setMediumRoundActive] = useState(false)
  const [hardRoundActive, setHardRoundActive] = useState(false)

  // Timer state
  const [easyRoundTime, setEasyRoundTime] = useState(1800) // 30 minutes in seconds
  const [mediumRoundTime, setMediumRoundTime] = useState(900) // 15 minutes in seconds
  const [hardRoundTime, setHardRoundTime] = useState(600) // 10 minutes in seconds

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartRound = (round: string) => {
    if (round === "easy") {
      setEasyRoundActive(true)
      setMediumRoundActive(false)
      setHardRoundActive(false)
    } else if (round === "medium") {
      setEasyRoundActive(false)
      setMediumRoundActive(true)
      setHardRoundActive(false)
    } else if (round === "hard") {
      setEasyRoundActive(false)
      setMediumRoundActive(false)
      setHardRoundActive(true)
    }

    toast({
      title: "Round Started",
      description: `${round.charAt(0).toUpperCase() + round.slice(1)} round has been started.`,
    })
  }

  const handlePauseRound = (round: string) => {
    if (round === "easy") {
      setEasyRoundActive(false)
    } else if (round === "medium") {
      setMediumRoundActive(false)
    } else if (round === "hard") {
      setHardRoundActive(false)
    }

    toast({
      title: "Round Paused",
      description: `${round.charAt(0).toUpperCase() + round.slice(1)} round has been paused.`,
    })
  }

  const handleResetRound = (round: string) => {
    if (round === "easy") {
      setEasyRoundTime(1800)
    } else if (round === "medium") {
      setMediumRoundTime(900)
    } else if (round === "hard") {
      setHardRoundTime(600)
    }

    toast({
      title: "Round Reset",
      description: `${round.charAt(0).toUpperCase() + round.slice(1)} round timer has been reset.`,
    })
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Competition Controls</AlertTitle>
        <AlertDescription>
          Use these controls to manage the competition rounds. Make sure all judges and participants are ready before
          starting a round.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="easy">Easy Round</TabsTrigger>
          <TabsTrigger value="medium">Medium Round</TabsTrigger>
          <TabsTrigger value="hard">Hard Round</TabsTrigger>
        </TabsList>

        <TabsContent value="easy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant={easyRoundActive ? "default" : "outline"}>
                  {easyRoundActive ? "Active" : "Inactive"}
                </Badge>
                Easy Round Controls
              </CardTitle>
              <CardDescription>Manage the Easy round of the competition (30 minutes per question)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Round Status</h3>
                    <p className="text-sm text-muted-foreground">Toggle to activate or deactivate the round</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="easy-round-active" className="sr-only">
                      Easy Round Active
                    </Label>
                    <Switch
                      id="easy-round-active"
                      checked={easyRoundActive}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleStartRound("easy")
                        } else {
                          handlePauseRound("easy")
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Timer Controls</h3>
                  <div className="flex items-center justify-between bg-primary/10 p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-mono">{formatTime(easyRoundTime)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={easyRoundActive ? "destructive" : "default"}
                        onClick={() => {
                          if (easyRoundActive) {
                            handlePauseRound("easy")
                          } else {
                            handleStartRound("easy")
                          }
                        }}
                      >
                        {easyRoundActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResetRound("easy")}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Question Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Question 1</span>
                      </div>
                      <Badge variant="outline">24/24 Teams Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>Question 2</span>
                      </div>
                      <Badge variant="outline">18/24 Teams Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>Question 3</span>
                      </div>
                      <Badge variant="outline">0/24 Teams Completed</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Teams</Button>
              <Button>Next Question</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="medium">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant={mediumRoundActive ? "default" : "outline"}>
                  {mediumRoundActive ? "Active" : "Inactive"}
                </Badge>
                Medium Round Controls
              </CardTitle>
              <CardDescription>Manage the Medium round of the competition (15 minutes per question)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Round Status</h3>
                    <p className="text-sm text-muted-foreground">Toggle to activate or deactivate the round</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="medium-round-active" className="sr-only">
                      Medium Round Active
                    </Label>
                    <Switch
                      id="medium-round-active"
                      checked={mediumRoundActive}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleStartRound("medium")
                        } else {
                          handlePauseRound("medium")
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Timer Controls</h3>
                  <div className="flex items-center justify-between bg-primary/10 p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-mono">{formatTime(mediumRoundTime)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={mediumRoundActive ? "destructive" : "default"}
                        onClick={() => {
                          if (mediumRoundActive) {
                            handlePauseRound("medium")
                          } else {
                            handleStartRound("medium")
                          }
                        }}
                      >
                        {mediumRoundActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResetRound("medium")}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Question Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>Question 1</span>
                      </div>
                      <Badge variant="outline">0/24 Teams Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>Question 2</span>
                      </div>
                      <Badge variant="outline">0/24 Teams Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>Question 3</span>
                      </div>
                      <Badge variant="outline">0/24 Teams Completed</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Teams</Button>
              <Button>Next Question</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="hard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant={hardRoundActive ? "default" : "outline"}>
                  {hardRoundActive ? "Active" : "Inactive"}
                </Badge>
                Hard Round Controls
              </CardTitle>
              <CardDescription>
                Manage the Hard round of the competition (10 minutes for first two questions, 5 minutes for final)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Round Status</h3>
                    <p className="text-sm text-muted-foreground">Toggle to activate or deactivate the round</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hard-round-active" className="sr-only">
                      Hard Round Active
                    </Label>
                    <Switch
                      id="hard-round-active"
                      checked={hardRoundActive}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleStartRound("hard")
                        } else {
                          handlePauseRound("hard")
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Timer Controls</h3>
                  <div className="flex items-center justify-between bg-primary/10 p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-mono">{formatTime(hardRoundTime)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={hardRoundActive ? "destructive" : "default"}
                        onClick={() => {
                          if (hardRoundActive) {
                            handlePauseRound("hard")
                          } else {
                            handleStartRound("hard")
                          }
                        }}
                      >
                        {hardRoundActive ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResetRound("hard")}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Question Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>Question 1 (10 min)</span>
                      </div>
                      <Badge variant="outline">0/24 Teams Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>Question 2 (10 min)</span>
                      </div>
                      <Badge variant="outline">0/24 Teams Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>Question 3 (5 min)</span>
                      </div>
                      <Badge variant="outline">0/24 Teams Completed</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Teams</Button>
              <Button>Next Question</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
