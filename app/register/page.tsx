"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

export default function Register() {
  const [teamName, setTeamName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [members, setMembers] = useState([{ name: "", email: "" }])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleMemberChange = (idx: number, field: 'name', value: string) => {
    setMembers((prev) => {
      const updated = [...prev]
      updated[idx][field] = value
      return updated
    })
  }

  const addMember = () => {
    setMembers((prev) => [...prev, { name: "", email: "" }])
  }

  const removeMember = (idx: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName || !email || !password) {
      toast({ title: "All fields are required", variant: "destructive" })
      return
    }
    if (members.some((m) => !m.name || !m.email)) {
      toast({ title: "All team members must have a name and email", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid
      // Add team to Firestore
      await setDoc(doc(db, "users", uid), {
        id: uid,
        teamName,
        email,
        role: "participant",
        members,
      })
      toast({ title: "Team registered successfully!" })
      router.push("/login")
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Register Team</CardTitle>
          <CardDescription>Sign up your team to participate in Code Rush</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Team Name</label>
              <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Team Email (for login)</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium">Team Members Full Name</label>
              {members.map((member, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Member Name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                    required
                  />
                  
                  {members.length > 1 && (
                    <Button type="button" variant="destructive" onClick={() => removeMember(idx)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addMember} className="mt-2">Add Member</Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 