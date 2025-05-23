"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Trophy, Medal, Award } from "lucide-react"

// Mock results data
const MOCK_RESULTS = [
  {
    id: "1",
    rank: 1,
    teamName: "Algorithm Aces",
    members: ["Frank Miller", "Grace Lee", "Henry Taylor"],
    easyScore: 100,
    mediumScore: 95,
    hardScore: 90,
    totalScore: 285,
  },
  {
    id: "2",
    rank: 2,
    teamName: "Binary Beasts",
    members: ["Alice Brown", "Charlie Davis", "Eve Wilson"],
    easyScore: 100,
    mediumScore: 85,
    hardScore: 80,
    totalScore: 265,
  },
  {
    id: "3",
    rank: 3,
    teamName: "Code Wizards",
    members: ["John Doe", "Jane Smith", "Bob Johnson"],
    easyScore: 90,
    mediumScore: 85,
    hardScore: 75,
    totalScore: 250,
  },
  {
    id: "4",
    rank: 4,
    teamName: "Data Dragons",
    members: ["Ivy Chen", "Jack Robinson", "Kate Williams"],
    easyScore: 85,
    mediumScore: 80,
    hardScore: 70,
    totalScore: 235,
  },
  {
    id: "5",
    rank: 5,
    teamName: "Function Fellows",
    members: ["Leo Martinez", "Mia Johnson", "Noah Garcia"],
    easyScore: 80,
    mediumScore: 75,
    hardScore: 65,
    totalScore: 220,
  },
]

export function ResultsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("rank")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Filter and sort results
  const filteredResults = MOCK_RESULTS.filter(
    (result) =>
      result.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.members.some((member) => member.toLowerCase().includes(searchQuery.toLowerCase())),
  ).sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a]
    const bValue = b[sortBy as keyof typeof b]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="teamName">Team Name</SelectItem>
              <SelectItem value="easyScore">Easy Score</SelectItem>
              <SelectItem value="mediumScore">Medium Score</SelectItem>
              <SelectItem value="hardScore">Hard Score</SelectItem>
              <SelectItem value="totalScore">Total Score</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competition Results</CardTitle>
          <CardDescription>Final scores and rankings for all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Rank</th>
                  <th className="text-left p-3 font-medium">Team</th>
                  <th className="text-left p-3 font-medium">Easy</th>
                  <th className="text-left p-3 font-medium">Medium</th>
                  <th className="text-left p-3 font-medium">Hard</th>
                  <th className="text-left p-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {result.rank === 1 ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : result.rank === 2 ? (
                          <Medal className="h-5 w-5 text-gray-400" />
                        ) : result.rank === 3 ? (
                          <Award className="h-5 w-5 text-amber-700" />
                        ) : (
                          <span className="w-5 text-center">{result.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{result.teamName}</p>
                        <p className="text-xs text-muted-foreground">{result.members.join(", ")}</p>
                      </div>
                    </td>
                    <td className="p-3">{result.easyScore}</td>
                    <td className="p-3">{result.mediumScore}</td>
                    <td className="p-3">{result.hardScore}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="font-bold">
                        {result.totalScore}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  1st Place
                </h3>
                <p className="font-medium">{MOCK_RESULTS[0].teamName}</p>
                <p className="text-sm text-muted-foreground">{MOCK_RESULTS[0].members.join(", ")}</p>
              </div>
              <div className="text-2xl font-bold">{MOCK_RESULTS[0].totalScore}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Medal className="h-5 w-5 text-gray-400" />
                  2nd Place
                </h3>
                <p className="font-medium">{MOCK_RESULTS[1].teamName}</p>
                <p className="text-sm text-muted-foreground">{MOCK_RESULTS[1].members.join(", ")}</p>
              </div>
              <div className="text-2xl font-bold">{MOCK_RESULTS[1].totalScore}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-700" />
                  3rd Place
                </h3>
                <p className="font-medium">{MOCK_RESULTS[2].teamName}</p>
                <p className="text-sm text-muted-foreground">{MOCK_RESULTS[2].members.join(", ")}</p>
              </div>
              <div className="text-2xl font-bold">{MOCK_RESULTS[2].totalScore}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
