"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Award, Clock, LogOut, User, BarChart, Settings, Play, Pause, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "./admin-header"
import { TeamsList } from "./teams-list"
import { CompetitionControls } from "./competition-controls"
import { ResultsTable } from "./results-table"
import AdminQuestions from "../questions"
import { collection, onSnapshot, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [teamCount, setTeamCount] = useState(0)
  const [judgeCount, setJudgeCount] = useState(0)
  const [competitionStatus, setCompetitionStatus] = useState("Waiting for teams")
  const [progressTeamCount, setProgressTeamCount] = useState(0)
  const [roundProgress, setRoundProgress] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [questionsByRound, setQuestionsByRound] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [registeredTeamIds, setRegisteredTeamIds] = useState<string[]>([]);
  const [activeTeamIds, setActiveTeamIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch number of questions per round
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "questions"));
      const byRound = { easy: 0, medium: 0, hard: 0 };
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.difficulty === "easy") byRound.easy++;
        if (data.difficulty === "medium") byRound.medium++;
        if (data.difficulty === "hard") byRound.hard++;
      });
      setQuestionsByRound(byRound);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Listen for real-time updates to the users collection for teams and judges
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (querySnapshot) => {
      let teamCounter = 0
      let judgeCounter = 0
      const teamIds: string[] = [];
      const activeIds: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.role === "participant") {
          teamCounter++
          if (data.id) teamIds.push(data.id)
          if (data.id && String(data.status).toLowerCase() === "active") activeIds.push(data.id)
        }
        if (data.role === "judge") {
          judgeCounter++
        }
      })
      setTeamCount(teamCounter)
      setJudgeCount(judgeCounter)
      setRegisteredTeamIds(teamIds)
      setActiveTeamIds(activeIds)
    })
    // Listen for real-time updates to participant_progress for unique teams and round completion
    const unsubscribeProgress = onSnapshot(collection(db, "participant_progress"), (querySnapshot) => {
      // For round completion
      const roundTeamMap: { [round: string]: { [teamId: string]: Set<number> } } = {
        easy: {},
        medium: {},
        hard: {},
      };
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.teamId && activeTeamIds.includes(data.teamId)) {
          if (data.status && String(data.status).toLowerCase() === "correct" && data.round && data.order !== undefined) {
            const round = String(data.round).toLowerCase();
            const orderNum = typeof data.order === "number" ? data.order : Number(data.order);
            if (!roundTeamMap[round]) roundTeamMap[round] = {};
            if (!roundTeamMap[round][data.teamId]) roundTeamMap[round][data.teamId] = new Set();
            roundTeamMap[round][data.teamId].add(orderNum);
          }
        }
      })
      // For each round, count teams that have completed all questions
      setRoundProgress({
        easy: Object.entries(roundTeamMap.easy).filter(([teamId, set]) => set.size === questionsByRound.easy && questionsByRound.easy > 0 && activeTeamIds.includes(teamId)).length,
        medium: Object.entries(roundTeamMap.medium).filter(([teamId, set]) => set.size === questionsByRound.medium && questionsByRound.medium > 0 && activeTeamIds.includes(teamId)).length,
        hard: Object.entries(roundTeamMap.hard).filter(([teamId, set]) => set.size === questionsByRound.hard && questionsByRound.hard > 0 && activeTeamIds.includes(teamId)).length,
      });
    })
    return () => {
      unsubscribeUsers()
      unsubscribeProgress()
    }
  }, [questionsByRound])

  useEffect(() => {
    if (teamCount === 0) {
      setCompetitionStatus("Waiting for teams")
    } else if (progressTeamCount > 0) {
      setCompetitionStatus("In Progress")
    } else {
      setCompetitionStatus("Ready")
    }
  }, [teamCount, progressTeamCount])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-transparent">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-6 text-cyan-100">
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
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Admin Dashboard</span>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  <Button
                    variant={activeTab === "overview" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("overview")}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "teams" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("teams")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Teams
                  </Button>
                  <Button
                    variant={activeTab === "questions" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("questions")}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-cyan-200 drop-shadow">Dashboard Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Registered Teams</p>
                          <p className="text-2xl font-bold">{teamCount}</p>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Judges</p>
                          <p className="text-2xl font-bold">{judgeCount}</p>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Competition Status</p>
                          <p className="text-2xl font-bold">{competitionStatus}</p>
                        </div>
                        <div className={`bg-green-100 dark:bg-green-900/20 p-2 rounded-full`}>
                          <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Competition Progress</CardTitle>
                    <CardDescription>Current status of the competition rounds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(['easy', 'medium', 'hard'] as const).map((roundKey, idx) => {
                        type RoundKey = 'easy' | 'medium' | 'hard';
                        const round: RoundKey = roundKey;
                        const roundNames: Record<RoundKey, string> = { easy: 'Easy Round', medium: 'Medium Round', hard: 'Hard Round' };
                        const roundColors: Record<RoundKey, string> = {
                          easy: 'bg-green-500',
                          medium: 'bg-yellow-500',
                          hard: 'bg-gray-500',
                        };
                        const roundIcons: Record<RoundKey, JSX.Element> = {
                          easy: <Play className="h-4 w-4 text-green-600 dark:text-green-400" />,
                          medium: <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
                          hard: <Pause className="h-4 w-4 text-gray-500" />,
                        };
                        const completed = roundProgress[round];
                        const total = activeTeamIds.length;
                        const percent = total > 0 ? (completed / total) * 100 : 0;
                        return (
                          <div key={round} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-full ${round === 'easy' ? 'bg-green-100 dark:bg-green-900/20' : round === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>{roundIcons[round]}</div>
                              <span className="font-medium">{roundNames[round]}</span>
                            </div>
                            <div className="flex items-center gap-2 w-56">
                              <span className="text-sm text-muted-foreground min-w-[70px] text-right">{completed}/{total} Teams</span>
                              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full ${roundColors[round]}`} style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions in the competition</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Team "Code Wizards" registered</p>
                          <p className="text-xs text-muted-foreground">10 minutes ago</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Judge "John Smith" assigned to Easy Round</p>
                          <p className="text-xs text-muted-foreground">25 minutes ago</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full mt-0.5">
                          <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Easy Round started</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-100 dark:bg-yellow-900/20 p-1 rounded-full mt-0.5">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Team "Binary Beasts" requested assistance</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "teams" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Teams Management</h1>
                <TeamsList />
              </div>
            )}

            {activeTab === "competition" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Competition Controls</h1>
                <CompetitionControls />
              </div>
            )}

            {activeTab === "results" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Competition Results</h1>
                <ResultsTable />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <Card>
                  <CardHeader>
                    <CardTitle>Competition Settings</CardTitle>
                    <CardDescription>Configure competition parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Settings panel is under development.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "questions" && (
              <AdminQuestions />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
