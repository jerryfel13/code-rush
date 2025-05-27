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
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showAchievements, setShowAchievements] = useState(true)
  const [progress, setProgress] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Subscribe to participant_progress collection
    const unsubscribeProgress = onSnapshot(collection(db, "participant_progress"), (snapshot) => {
      setProgress(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      clearInterval(timer)
      unsubscribeProgress()
    }
  }, [])

  // Use only the teams array built from participant_progress aggregation
  // Build teams array from participantMap and teamMap
  const participantMap: Record<string, any> = {};
  progress.forEach(p => {
    if (!participantMap[p.participantId]) {
      participantMap[p.participantId] = {
        participantId: p.participantId,
        name: p.participantName || p.name || "Unknown",
        teamId: p.teamId,
        teamName: p.teamName,
        points: 0,
      };
    }
    participantMap[p.participantId].points += p.points || 0;
  });
  const participants = Object.values(participantMap);
  const teamMap: Record<string, any> = {};
  participants.forEach(p => {
    if (!teamMap[p.teamId]) {
      teamMap[p.teamId] = {
        teamId: p.teamId,
        teamName: p.teamName,
        members: [],
        points: 0,
      };
    }
    teamMap[p.teamId].members.push(p);
    teamMap[p.teamId].points += p.points;
  });
  const teams = Object.values(teamMap).sort((a, b) => b.points - a.points);

  // Aggregate problem completion statistics from participant_progress
  const problemMap: Record<string, { title: string, status: "solved" | "attempted" | "not_started" }> = {};
  progress.forEach(p => {
    if (!problemMap[p.questionId]) {
      problemMap[p.questionId] = {
        title: p.questionTitle || p.title || "Untitled",
        status: "not_started"
      };
    }
    if (p.status === "correct") {
      problemMap[p.questionId].status = "solved";
    } else if (
      ["pending", "wrong", "in progress", "skipped"].includes(p.status) &&
      problemMap[p.questionId].status !== "solved"
    ) {
      problemMap[p.questionId].status = "attempted";
    }
  });
  const problems = Object.values(problemMap);
  const stats = {
    total: problems.length,
    solved: problems.filter(p => p.status === "solved").length,
    attempted: problems.filter(p => p.status === "attempted").length,
    notStarted: problems.filter(p => p.status === "not_started").length,
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
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

  const recentAchievements = getRecentAchievements()

  return (
    <div className={`min-h-screen bg-[#181c24] p-8 transition-all duration-300 ${isFullScreen ? 'p-0' : ''}`}>
      <div className={`max-w-7xl mx-auto space-y-8 ${isFullScreen ? 'p-8' : ''}`}>
        {/* Full Screen Toggle Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleFullScreen}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 bg-black/40 hover:bg-cyan-900/20 shadow-[0_0_10px_rgba(0,255,247,0.2)] text-shadow-cyber transition-all font-semibold"
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="h-5 w-5 text-cyan-400" /> Exit Full Screen
              </>
            ) : (
              <>
                <Maximize2 className="h-5 w-5 text-cyan-400" /> Full Screen
              </>
            )}
          </button>
        </div>

        {/* Back Button */}
        <div className="mb-4">
          <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 bg-black/40 hover:bg-cyan-900/20 shadow-[0_0_10px_rgba(0,255,247,0.2)] text-shadow-cyber transition-all font-semibold">
            <ArrowLeft className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,247,0.5)]" />
            Back to Admin Dashboard
          </Link>
        </div>

        {/* Header with Logos */}
        <div className="flex flex-col items-center space-y-2 mb-8">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl font-extrabold text-cyan-400 text-shadow-cyber whitespace-nowrap drop-shadow-lg">
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
          <div className="text-cyan-300 text-shadow-cyber text-lg font-semibold tracking-wide opacity-80">
            In partnership with <span className="text-purple-300">Coders Club</span> & <span className="text-purple-300">Computer Society</span>
          </div>
          <div className="text-3xl text-purple-300 text-shadow-cyber font-bold">
            {mounted ? currentTime.toLocaleTimeString() : ""}
          </div>
        </div>

        {/* After the header, use a flex layout for main content and sidebar */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content: Leaderboard and Teams Table */}
          <div className="flex-1">
            {/* 1. Live Leaderboard */}
            <Card className="bg-black/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,247,0.1)] mb-8">
              <CardHeader>
                <CardTitle className="text-4xl text-cyan-400 text-center text-shadow-cyber font-extrabold tracking-wide mb-4">
                  Live Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {teams.map((team, index) => (
                      <motion.div
                        key={team.teamId}
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
                              {team.teamName}
                            </h3>
                            <div className="text-cyan-400 font-bold">Team Points: <span className="text-green-400">{team.points}</span></div>
                            <ul className="text-sm text-purple-200/80 mt-1">
                              {team.members.map((member: any) => (
                                <li key={member.participantId} className="text-purple-200">
                                  {member.name}: <span className="text-cyan-100">{member.points} pts</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-cyan-400 text-shadow-cyber">
                            {team.points}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
            {/* 2. All Participating Teams & Progress */}
            <div className="mt-12 mb-4 text-center">
              <h2 className="text-4xl font-extrabold text-cyan-400 text-shadow-cyber tracking-wide drop-shadow-[0_0_10px_rgba(0,255,247,0.5)]">
                All Participating Teams & Progress
              </h2>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-black/30 border border-cyan-500/30 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-cyan-300">#</th>
                    <th className="px-4 py-2 text-cyan-300">Team</th>
                    <th className="px-4 py-2 text-cyan-300">Total Points</th>
                    <th className="px-4 py-2 text-cyan-300">Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, idx) => (
                    <tr key={team.teamId} className="border-t border-cyan-700/30">
                      <td className="px-4 py-2 text-center text-cyan-200">{idx + 1}</td>
                      <td className="px-4 py-2 text-cyan-200 font-bold">{team.teamName}</td>
                      <td className="px-4 py-2 text-green-400 font-semibold">{team.points}</td>
                      <td className="px-4 py-2">
                        <ul>
                          {team.members.map((member: any) => (
                            <li key={member.participantId} className="text-purple-200">
                              {member.name}: <span className="text-cyan-100">{member.points} pts</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Sidebar: Problem Completion Statistics (hidden on small screens) */}
          <div className="hidden md:block w-full md:w-1/4">
            <Card className="bg-black/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,247,0.1)] mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-400 text-center text-shadow-cyber">
                  Problem Completion Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  )
} 