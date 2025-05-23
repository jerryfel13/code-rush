"use client"

import { useState } from "react"
import { useAuth } from "../context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Award, Clock, LogOut, User, BarChart, Settings, Play, Pause, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "./admin-header"
import { TeamsList } from "./teams-list"
import { JudgesList } from "./judges-list"
import { CompetitionControls } from "./competition-controls"
import { ResultsTable } from "./results-table"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
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
                    variant={activeTab === "judges" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("judges")}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Judges
                  </Button>
                  <Button
                    variant={activeTab === "competition" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("competition")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Competition
                  </Button>
                  <Button
                    variant={activeTab === "results" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("results")}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Results
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-none h-10"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
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
                          <p className="text-2xl font-bold">24</p>
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
                          <p className="text-2xl font-bold">8</p>
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
                          <p className="text-2xl font-bold">Ready</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full">
                            <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="font-medium">Easy Round</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">24/24 Teams</span>
                          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-full"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-yellow-100 dark:bg-yellow-900/20 p-1 rounded-full">
                            <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <span className="font-medium">Medium Round</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">18/24 Teams</span>
                          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 w-3/4"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                            <Pause className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="font-medium">Hard Round</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">0/24 Teams</span>
                          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-500 w-0"></div>
                          </div>
                        </div>
                      </div>
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

            {activeTab === "judges" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Judges Management</h1>
                <JudgesList />
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
          </div>
        </div>
      </main>
    </div>
  )
}
