"use client"

import { useState, useEffect } from "react"
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
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, collection, getDocs, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore"

export function TeamsList() {
  const { toast } = useToast()
  const [teams, setTeams] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false)
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false)
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<(typeof teams)[0] | null>(null)

  const [newTeam, setNewTeam] = useState({
    name: "",
    member1: "",
    member2: "",
    member3: "",
    status: "Registered",
  })

  // Add for registration
  const [teamEmail, setTeamEmail] = useState("")
  const [teamPassword, setTeamPassword] = useState("")
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "" }])
  const [isRegistering, setIsRegistering] = useState(false)

  // Fetch teams from Firestore on mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
        const teamsData: any[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.role === "participant") {
            teamsData.push({
              id: data.id,
              name: data.teamName,
              email: data.email,
              members: data.members ? data.members.map((m: any) => m.name).join(", ") : "",
              status: data.status || "Registered",
              score: data.score || null,
            })
          }
        })
        setTeams(teamsData)
    })
    return () => unsubscribe()
  }, [])

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const handleMemberChange = (idx: number, field: 'name' | 'email', value: string) => {
    setTeamMembers((prev) => {
      const updated = [...prev]
      updated[idx][field] = value
      return updated
    })
  }

  const addMember = () => {
    setTeamMembers((prev) => [...prev, { name: "", email: "" }])
  }

  const removeMember = (idx: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleRegisterTeam = async () => {
    if (!newTeam.name || !teamEmail || !teamPassword) {
      toast({ title: "All fields are required", variant: "destructive" })
      return
    }
    setIsRegistering(true)
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, teamEmail, teamPassword)
      const uid = userCredential.user.uid
      // Add team to Firestore
      await setDoc(doc(db, "users", uid), {
        id: uid,
        teamName: newTeam.name,
        email: teamEmail,
        role: "participant",
        members: teamMembers,
        status: newTeam.status,
      })
      toast({ title: "Team registered successfully!" })
      setIsAddTeamOpen(false)
      setNewTeam({ name: "", member1: "", member2: "", member3: "", status: "Registered" })
      setTeamEmail("")
      setTeamPassword("")
      setTeamMembers([{ name: "", email: "" }])
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" })
    } finally {
      setIsRegistering(false)
    }
  }

  const openEditTeam = (team: any) => {
    let membersArr = team.members
    if (typeof membersArr === "string") {
      // Convert comma-separated string to array of objects with empty emails
      membersArr = membersArr.split(",").map((name: string) => ({ name: name.trim(), email: "" }))
    }
    setSelectedTeam({ ...team, members: membersArr, email: team.email })
    setIsEditTeamOpen(true)
  }

  const handleEditTeam = async () => {
    if (!selectedTeam) return

    // Validate fields
    if (!selectedTeam.name || !selectedTeam.members || selectedTeam.members.some((m: string) => !m)) {
      toast({ title: "All fields are required", variant: "destructive" })
      return
    }
    try {
      // Update Firestore document
      const teamDoc = doc(db, "users", selectedTeam.id)
      await updateDoc(teamDoc, {
        teamName: selectedTeam.name,
        members: Array.isArray(selectedTeam.members)
          ? selectedTeam.members.map((member: any) =>
              typeof member === "string"
                ? { name: member, email: "" }
                : member
            )
          : [],
        status: selectedTeam.status,
      })
      // Send activation email if status is set to Active
      if (selectedTeam.status === "Active" && selectedTeam.email) {
        await fetch('/api/send-activation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selectedTeam.email,
            teamName: selectedTeam.name,
          }),
        })
      }
      toast({
        title: "Team Updated",
        description: `Team "${selectedTeam.name}" has been updated successfully.`,
      })
      setIsEditTeamOpen(false)
      setSelectedTeam(null)
      // Optionally, refresh teams list here
    } catch (error: any) {
      toast({ title: "Failed to update team", description: error.message, variant: "destructive" })
    }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "users", selectedTeam.id));

      // Remove from local state
      const updatedTeams = teams.filter((team) => team.id !== selectedTeam.id)
      setTeams(updatedTeams)
      setIsDeleteTeamOpen(false)

      toast({
        title: "Team Deleted",
        description: `Team "${selectedTeam.name}" has been deleted.`,
      })

      setSelectedTeam(null)
    } catch (error: any) {
      toast({
        title: "Failed to delete team",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
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
        <Button onClick={() => setIsAddTeamOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeams.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No teams found</p>
            ) : (
              filteredTeams.map((team) => (
                <Card key={team.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{team.name}</h3>
                          <Badge
                            variant={
                              team.status === "Active"
                                ? "default"
                                : team.status === "Completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {team.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Members: {team.members}</p>
                        {team.score !== null && (
                          <p className="text-sm">
                            Score: <span className="font-medium">{team.score}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditTeam(team)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTeam(team)
                            setIsDeleteTeamOpen(true)
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

      {/* Add Team Dialog */}
      <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
        <DialogContent className="modal w-[90vw] h-[90vh] max-w-none max-h-none overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle className="modal-title">Add New Team</DialogTitle>
            <DialogDescription className="modal-content">Register a new team in the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-email">Team Email (for login)</Label>
              <Input
                id="team-email"
                type="email"
                value={teamEmail}
                onChange={(e) => setTeamEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-password">Password</Label>
              <Input
                id="team-password"
                type="password"
                value={teamPassword}
                onChange={(e) => setTeamPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Team Members Full Name (Lastname, Firstname)</Label>
              {teamMembers.map((member, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Member Name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                  />
                  
                  {teamMembers.length > 1 && (
                    <Button type="button" variant="destructive" onClick={() => removeMember(idx)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addMember} className="mt-2">Add Member</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newTeam.status} onValueChange={(value) => setNewTeam({ ...newTeam, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Registered">Registered</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTeamOpen(false)} className="modal-button">
              Cancel
            </Button>
            <Button
              onClick={handleRegisterTeam}
              disabled={isRegistering}
              className="modal-button"
            >
              {isRegistering ? "Registering..." : "Register Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
        <DialogContent className="modal w-[90vw] h-[90vh] max-w-none max-h-none overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update the team details</DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-team-name">Team Name</Label>
                <Input
                  id="edit-team-name"
                  value={selectedTeam.name}
                  onChange={(e) => setSelectedTeam({ ...selectedTeam, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Team Members Full name</Label>
                {Array.isArray(selectedTeam.members) && selectedTeam.members.map((member: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Member Name"
                      value={member.name}
                      onChange={(e) => {
                        const updatedMembers = [...selectedTeam.members]
                        updatedMembers[idx].name = e.target.value
                        setSelectedTeam({ ...selectedTeam, members: updatedMembers })
                      }}
                    />
                  
                    {selectedTeam.members.length > 1 && (
                      <Button type="button" variant="destructive" onClick={() => {
                        const updatedMembers = selectedTeam.members.filter((_: any, i: number) => i !== idx)
                        setSelectedTeam({ ...selectedTeam, members: updatedMembers })
                      }}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={() => {
                  setSelectedTeam({
                    ...selectedTeam,
                    members: [...selectedTeam.members, { name: "", email: "" }],
                  })
                }} className="mt-2">Add Member</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedTeam.status}
                  onValueChange={(value) => setSelectedTeam({ ...selectedTeam, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Registered">Registered</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-score">Score (optional)</Label>
                <Input
                  id="edit-score"
                  type="number"
                  min="0"
                  max="100"
                  value={selectedTeam.score !== null ? selectedTeam.score : ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                    setSelectedTeam({ ...selectedTeam, score: value })
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTeamOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditTeam}
              disabled={!selectedTeam || !selectedTeam.name || !Array.isArray(selectedTeam.members) || selectedTeam.members.some((m: any) => !m)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={isDeleteTeamOpen} onOpenChange={setIsDeleteTeamOpen}>
        <DialogContent className="modal w-[90vw] h-[90vh] max-w-none max-h-none overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="py-4">
              <p>
                Team: <span className="font-medium">{selectedTeam.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Members: {
                  Array.isArray(selectedTeam.members)
                    ? selectedTeam.members.map((m: any) => m.name).join(", ")
                    : selectedTeam.members || "N/A"
                }
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTeamOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
