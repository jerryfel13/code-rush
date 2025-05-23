"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Maximize2, Minimize2, Trophy, Target, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Team {
  id: string
  name: string
  score: number
  status: string
  members: string[]
  lastUpdated: number
  problems?: {
    [key: string]: {
      status: "solved" | "attempted" | "not_started"
      attempts: number
      lastAttempt: number
    }
  }
  achievements?: {
    id: string
    name: string
    description: string
    timestamp: number
  }[]
}

interface Problem {
  id: string
  title: string
  points: number
  difficulty: "easy" | "medium" | "hard"
}

// Mock problems data - replace with actual data from your backend
const PROBLEMS: Problem[] = [
  { id: "p1", title: "Array Manipulation", points: 100, difficulty: "easy" },
  { id: "p2", title: "Dynamic Programming", points: 200, difficulty: "medium" },
  { id: "p3", title: "Graph Algorithms", points: 300, difficulty: "hard" },
  { id: "p4", title: "String Processing", points: 150, difficulty: "medium" },
  { id: "p5", title: "Binary Search", points: 250, difficulty: "hard" },
]

export default function LiveContestPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showAchievements, setShowAchievements] = useState(true)

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Subscribe to teams collection
    const teamsQuery = query(
      collection(db, "teams"),
      orderBy("score", "desc")
    )

    const unsubscribe = onSnapshot(teamsQuery, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: Date.now()
      })) as Team[]
      setTeams(teamsData)
    })

    return () => {
      clearInterval(timer)
      unsubscribe()
    }
  }, [])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  const getProblemCompletionStats = () => {
    const stats = {
      total: PROBLEMS.length,
      solved: 0,
      attempted: 0,
      notStarted: 0
    }

    teams.forEach(team => {
      if (team.problems) {
        Object.values(team.problems).forEach(problem => {
          if (problem.status === "solved") stats.solved++
          else if (problem.status === "attempted") stats.attempted++
          else stats.notStarted++
        })
      }
    })

    return stats
  }

  const getTeamProgress = (team: Team) => {
    if (!team.problems) return 0
    const solved = Object.values(team.problems).filter(p => p.status === "solved").length
    return (solved / PROBLEMS.length) * 100
  }

  const getRecentAchievements = () => {
    const achievements: { team: string; achievement: any }[] = []
    teams.forEach(team => {
      if (team.achievements) {
        team.achievements.forEach(achievement => {
          achievements.push({ team: team.name, achievement })
        })
      }
    })
    return achievements.sort((a, b) => b.achievement.timestamp - a.achievement.timestamp).slice(0, 5)
  }

  const stats = getProblemCompletionStats()
  const recentAchievements = getRecentAchievements()

  return (
    <div className={`min-h-screen bg-[#181c24] p-8 transition-all duration-300 ${isFullScreen ? 'p-0' : ''}`}>
      <div className={`max-w-7xl mx-auto space-y-8 ${isFullScreen ? 'p-8' : ''}`}>
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 bg-black/40 hover:bg-cyan-900/20 shadow-[0_0_10px_rgba(0,255,247,0.2)] text-shadow-cyber transition-all font-semibold">
            <ArrowLeft className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,247,0.5)]" />
            Back to Admin Dashboard
          </Link>
        </div>

        {/* Header with Logos */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-6">
            <h1 className="text-4xl font-bold text-cyan-400 text-shadow-cyber whitespace-nowrap">
              CodeRush 2025
            </h1>
            <img
              src="/cc-logo.png.jpg"
              alt="Coders Club Logo"
              className="h-12 w-auto rounded-xl border-2 border-cyan-400 shadow-[0_0_20px_0_rgba(0,255,247,0.5)] bg-black/30 p-1"
            />
            <img
              src="/cs-logo.png.jpg"
              alt="Computer Society Logo"
              className="h-12 w-auto rounded-xl border-2 border-purple-400 shadow-[0_0_20px_0_rgba(168,85,247,0.5)] bg-black/30 p-1"
            />
          </div>
          <div className="text-cyan-300 text-shadow-cyber text-sm font-medium tracking-wide opacity-80">
            In partnership with <span className="text-purple-300">Coders Club</span> & <span className="text-purple-300">Computer Society</span>
          </div>
          <div className="text-2xl text-purple-300 text-shadow-cyber">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Problem Completion Stats */}
        <Card className="bg-black/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,247,0.1)]">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400 text-center text-shadow-cyber">
              Problem Completion Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-black/30 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,255,247,0.1)]">
                <div className="text-3xl font-bold text-cyan-400 text-shadow-cyber">{stats.solved}</div>
                <div className="text-sm text-cyan-200">Solved</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-black/30 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                <div className="text-3xl font-bold text-purple-400 text-shadow-cyber">{stats.attempted}</div>
                <div className="text-sm text-purple-200">Attempted</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-black/30 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,255,247,0.1)]">
                <div className="text-3xl font-bold text-cyan-400 text-shadow-cyber">{stats.notStarted}</div>
                <div className="text-sm text-cyan-200">Not Started</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-black/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,247,0.1)]">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400 text-center text-shadow-cyber">
              Live Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,255,247,0.1)] hover:shadow-[0_0_15px_rgba(0,255,247,0.2)] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-cyan-400 w-8 text-shadow-cyber">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-cyan-300 text-shadow-cyber">
                          {team.name}
                        </h3>
                        <p className="text-sm text-purple-200/70">
                          {team.members.join(", ")}
                        </p>
                        <div className="mt-2 w-48">
                          <Progress 
                            value={getTeamProgress(team)} 
                            className="h-2 bg-cyan-900/30" 
                            indicatorClassName="bg-gradient-to-r from-cyan-500 to-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          team.status === "Active"
                            ? "default"
                            : team.status === "Completed"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-shadow-cyber"
                      >
                        {team.status}
                      </Badge>
                      <div className="text-2xl font-bold text-cyan-400 text-shadow-cyber">
                        {team.score || 0}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Section Title: All Participating Teams & Progress */}
        <div className="mt-8 mb-2 text-center">
          <h2 className="text-3xl font-extrabold text-cyan-400 text-shadow-cyber tracking-wide drop-shadow-[0_0_10px_rgba(0,255,247,0.5)]">
            All Participating Teams & Progress
          </h2>
        </div>

        {/* Achievement Highlights */}
        {showAchievements && recentAchievements.length > 0 && (
          <Card className="bg-black/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,247,0.1)]">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400 text-center text-shadow-cyber">
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {recentAchievements.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-black/30 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,255,247,0.1)] hover:shadow-[0_0_15px_rgba(0,255,247,0.2)] transition-all"
                    >
                      <Trophy className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,247,0.5)]" />
                      <div>
                        <h4 className="text-lg font-semibold text-cyan-300 text-shadow-cyber">
                          {item.achievement.name}
                        </h4>
                        <p className="text-sm text-purple-200/70">
                          {item.team} - {item.achievement.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 