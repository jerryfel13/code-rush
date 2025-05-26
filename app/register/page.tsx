"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { auth, db, app } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import Image from "next/image"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getFunctions, httpsCallable } from "firebase/functions"

export default function Register() {
  const [teamName, setTeamName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [members, setMembers] = useState([{ name: "", email: "" }])
  const [status] = useState("Registered")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [open, setOpen] = useState(false)

  const handleMemberChange = (idx: number, field: 'name' | 'email', value: string) => {
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
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
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
        status: "Registered",
      })
      // Send registration email via API route
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, teamName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send registration email');
      }
      toast({ title: "Team registered successfully!" })
      router.push("/login")
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#232526] via-[#0f2027] to-[#2c5364] px-4">
      {/* Partnership Logos */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-6">
          <Image src="/cc-logo.png.jpg" alt="Coders Club Logo" width={80} height={80} className="rounded-full shadow-lg bg-[#232526] p-2 border-2 border-cyan-400" />
          <span className="text-2xl font-bold text-cyan-400">x</span>
          <Image src="/cs-logo.png.jpg" alt="Computer Society Logo" width={80} height={80} className="rounded-full shadow-lg bg-[#232526] p-2 border-2 border-purple-400" />
        </div>
        <div className="mt-2 text-center text-cyan-200 text-sm drop-shadow">
          Developed by <span className="font-semibold text-cyan-300">Coders Club</span> <br />
          in partnership with <span className="font-semibold text-purple-300">Computer Society Organization</span>
        </div>
      </div>
      <Card className="w-full max-w-lg bg-[#181c24]/80 backdrop-blur-md shadow-2xl border border-cyan-700/30 rounded-2xl p-8">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center text-cyan-300 drop-shadow">Register Team</CardTitle>
          <CardDescription className="text-center text-cyan-100">Sign up your team to participate in Code Rush</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-cyan-200">Team Name</label>
              <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-cyan-200">Team Email (for login)</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-cyan-200">Password</label>
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-cyan-200">Confirm Password</label>
              <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="showPassword" checked={showPassword} onChange={() => setShowPassword(v => !v)} className="accent-cyan-500 w-4 h-4" />
              <label htmlFor="showPassword" className="text-cyan-100 text-sm select-none">Show Password</label>
            </div>
            <div>
              <label className="text-sm font-medium text-cyan-200">Team Members Full Name (Lastname, Firstname)</label>
              {members.map((member, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Member Name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                    required
                    className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400"
                  />
                  <Input
                    placeholder="Member Email"
                    type="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                    required
                    className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400"
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="accent-cyan-500 w-4 h-4"
                required
              />
              <label htmlFor="agree" className="text-cyan-100 text-sm select-none">
                I have read and agree to the{' '}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-cyan-400 underline hover:text-cyan-300 font-semibold px-0 bg-transparent border-0" onClick={() => setOpen(true)}>
                      competition mechanics
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto bg-[#181c24] text-cyan-100 rounded-2xl shadow-2xl border border-cyan-700/40">
                    <DialogHeader>
                      <DialogTitle className="text-cyan-300">Competition Mechanics</DialogTitle>
                    </DialogHeader>
                    <div className="text-cyan-100 text-sm space-y-3">
                      <ol className="list-decimal ml-5 space-y-2">
                        <li>The competition consists of <span className="font-semibold text-cyan-200">three levels: Easy, Medium, and Hard</span>.</li>
                        <li>Each level will have <span className="font-semibold text-cyan-200">three coding questions</span> that test logic, problem-solving, and programming skills.</li>
                        <li>Participants must compete in <span className="font-semibold text-cyan-200">teams of three members</span>.</li>
                        <li>Only <span className="font-semibold text-cyan-200">SHS ITMAWD students and 1st to 3rd Year IT students</span> are eligible to join the competition.</li>
                        <li>
                          <span className="font-semibold text-cyan-200">Easy Round:</span>
                          <ol className="list-decimal ml-5 mt-1">
                            <li>Each question has a <span className="font-semibold text-cyan-200">30-minute time limit</span>.</li>
                            <li>Participants who complete the first question within 30 minutes move to the second question, then continue in the same manner until the third question of the Easy level.</li>
                          </ol>
                        </li>
                        <li>
                          <span className="font-semibold text-cyan-200">Medium Round:</span>
                          <ol className="list-decimal ml-5 mt-1">
                            <li>Each question has a <span className="font-semibold text-cyan-200">15-minute time limit</span>.</li>
                          </ol>
                        </li>
                        <li>
                          <span className="font-semibold text-cyan-200">Hard Round:</span>
                          <ul className="list-disc ml-5 mt-1">
                            <li>The first two questions have a <span className="font-semibold text-cyan-200">10-minute time limit each</span>.</li>
                            <li>The final question has a <span className="font-semibold text-cyan-200">5-minute time limit</span>.</li>
                          </ul>
                        </li>
                      </ol>
                    </div>
                  </DialogContent>
                </Dialog>
                .
              </label>
            </div>
            <Button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 border-2 border-cyan-400"
              disabled={isLoading || !agreed}
            >
              {isLoading ? "Registering..." : "Register Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 