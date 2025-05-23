"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock judges data
const MOCK_JUDGES = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Head Judge",
    assignedRound: "All Rounds",
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    email: "michael.chen@example.com",
    role: "Judge",
    assignedRound: "Easy Round",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    role: "Judge",
    assignedRound: "Medium Round",
  },
  {
    id: "4",
    name: "Prof. David Kim",
    email: "david.kim@example.com",
    role: "Judge",
    assignedRound: "Hard Round",
  },
  {
    id: "5",
    name: "Dr. Lisa Patel",
    email: "lisa.patel@example.com",
    role: "Judge",
    assignedRound: "Easy Round",
  },
]

export function JudgesList() {
  const { toast } = useToast()
  const [judges, setJudges] = useState(MOCK_JUDGES)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddJudgeOpen, setIsAddJudgeOpen] = useState(false)
  const [isEditJudgeOpen, setIsEditJudgeOpen] = useState(false)
  const [isDeleteJudgeOpen, setIsDeleteJudgeOpen] = useState(false)
  const [selectedJudge, setSelectedJudge] = useState<(typeof MOCK_JUDGES)[0] | null>(null)

  const [newJudge, setNewJudge] = useState({
    name: "",
    email: "",
    role: "Judge",
    assignedRound: "Easy Round",
  })

  const filteredJudges = judges.filter(
    (judge) =>
      judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddJudge = () => {
    const id = (judges.length + 1).toString()
    const newJudgeData = {
      id,
      name: newJudge.name,
      email: newJudge.email,
      role: newJudge.role,
      assignedRound: newJudge.assignedRound,
    }

    setJudges([...judges, newJudgeData])
    setIsAddJudgeOpen(false)
    setNewJudge({
      name: "",
      email: "",
      role: "Judge",
      assignedRound: "Easy Round",
    })

    toast({
      title: "Judge Added",
      description: `Judge "${newJudge.name}" has been added successfully.`,
    })
  }

  const handleEditJudge = () => {
    if (!selectedJudge) return

    const updatedJudges = judges.map((judge) => {
      if (judge.id === selectedJudge.id) {
        return selectedJudge
      }
      return judge
    })

    setJudges(updatedJudges)
    setIsEditJudgeOpen(false)
    setSelectedJudge(null)

    toast({
      title: "Judge Updated",
      description: `Judge "${selectedJudge.name}" has been updated successfully.`,
    })
  }

  const handleDeleteJudge = () => {
    if (!selectedJudge) return

    const updatedJudges = judges.filter((judge) => judge.id !== selectedJudge.id)
    setJudges(updatedJudges)
    setIsDeleteJudgeOpen(false)

    toast({
      title: "Judge Deleted",
      description: `Judge "${selectedJudge.name}" has been deleted.`,
    })

    setSelectedJudge(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search judges..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddJudgeOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Judge
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Judges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredJudges.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No judges found</p>
            ) : (
              filteredJudges.map((judge) => (
                <Card key={judge.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{judge.name}</h3>
                          <Badge variant={judge.role === "Head Judge" ? "default" : "outline"}>{judge.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{judge.email}</p>
                        <p className="text-sm">
                          Assigned to: <span className="font-medium">{judge.assignedRound}</span>
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedJudge(judge)
                            setIsEditJudgeOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedJudge(judge)
                            setIsDeleteJudgeOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Judge Dialog */}
      <Dialog open={isAddJudgeOpen} onOpenChange={setIsAddJudgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Judge</DialogTitle>
            <DialogDescription>Enter the details for the new judge</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="judge-name">Full Name</Label>
              <Input
                id="judge-name"
                value={newJudge.name}
                onChange={(e) => setNewJudge({ ...newJudge, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judge-email">Email</Label>
              <Input
                id="judge-email"
                type="email"
                value={newJudge.email}
                onChange={(e) => setNewJudge({ ...newJudge, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judge-role">Role</Label>
              <Select value={newJudge.role} onValueChange={(value) => setNewJudge({ ...newJudge, role: value })}>
                <SelectTrigger id="judge-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Judge">Judge</SelectItem>
                  <SelectItem value="Head Judge">Head Judge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="judge-round">Assigned Round</Label>
              <Select
                value={newJudge.assignedRound}
                onValueChange={(value) => setNewJudge({ ...newJudge, assignedRound: value })}
              >
                <SelectTrigger id="judge-round">
                  <SelectValue placeholder="Select assigned round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy Round">Easy Round</SelectItem>
                  <SelectItem value="Medium Round">Medium Round</SelectItem>
                  <SelectItem value="Hard Round">Hard Round</SelectItem>
                  <SelectItem value="All Rounds">All Rounds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddJudgeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddJudge} disabled={!newJudge.name || !newJudge.email}>
              Add Judge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Judge Dialog */}
      <Dialog open={isEditJudgeOpen} onOpenChange={setIsEditJudgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Judge</DialogTitle>
            <DialogDescription>Update the judge details</DialogDescription>
          </DialogHeader>
          {selectedJudge && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-judge-name">Full Name</Label>
                <Input
                  id="edit-judge-name"
                  value={selectedJudge.name}
                  onChange={(e) => setSelectedJudge({ ...selectedJudge, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-judge-email">Email</Label>
                <Input
                  id="edit-judge-email"
                  type="email"
                  value={selectedJudge.email}
                  onChange={(e) => setSelectedJudge({ ...selectedJudge, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-judge-role">Role</Label>
                <Select
                  value={selectedJudge.role}
                  onValueChange={(value) => setSelectedJudge({ ...selectedJudge, role: value })}
                >
                  <SelectTrigger id="edit-judge-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Judge">Judge</SelectItem>
                    <SelectItem value="Head Judge">Head Judge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-judge-round">Assigned Round</Label>
                <Select
                  value={selectedJudge.assignedRound}
                  onValueChange={(value) => setSelectedJudge({ ...selectedJudge, assignedRound: value })}
                >
                  <SelectTrigger id="edit-judge-round">
                    <SelectValue placeholder="Select assigned round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy Round">Easy Round</SelectItem>
                    <SelectItem value="Medium Round">Medium Round</SelectItem>
                    <SelectItem value="Hard Round">Hard Round</SelectItem>
                    <SelectItem value="All Rounds">All Rounds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditJudgeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditJudge} disabled={!selectedJudge || !selectedJudge.name || !selectedJudge.email}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Judge Dialog */}
      <Dialog open={isDeleteJudgeOpen} onOpenChange={setIsDeleteJudgeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Judge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this judge? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedJudge && (
            <div className="py-4">
              <p>
                Judge: <span className="font-medium">{selectedJudge.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">{selectedJudge.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteJudgeOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteJudge}>
              Delete Judge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
