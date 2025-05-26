"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { loginUser } from "@/services/auth-service"
import { useAuth } from "@/context/auth-context"
import { useParticipantAuth } from "@/app/participant/context/participant-auth-context"
import Image from "next/image"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const { login: loginParticipant } = useParticipantAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await loginUser(email, password)

      if (response.error) {
        toast({
          title: "Login Failed, Please check your credentials",
          variant: "destructive",
        })
        return
      }

      if (response.user) {
        // Store user data in appropriate context based on role
        if (response.user.role === "participant") {
          if (response.user.status !== "Active") {
            toast({
              title: "Account Not Yet Activated",
              description: "Your team registration is pending approval. Please wait for an admin to activate your account.",
              variant: "destructive",
            });
            return;
          }
          loginParticipant({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            teamId: response.user.id,
            teamName: response.user.teamName ?? "",
            status: response.user.status,
            role: response.user.role
          })
        } else {
          login(response.user)
        }
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.user.name}!`,
        })
        // Redirect based on role
        switch (response.user.role) {
          case "admin":
            router.push("/admin")
            break
          case "participant":
            router.push("/participant")
            break
          case "judge":
            router.push("/judge")
            break
          default:
            toast({
              title: "Access Denied",
              description: "Invalid user role.",
              variant: "destructive",
            })
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed, Please check your credentials",
        variant: "destructive",
      })
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
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-center text-cyan-300 drop-shadow">Login</CardTitle>
          <CardDescription className="text-center text-cyan-100">Enter your credentials to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-cyan-200">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-cyan-200">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition shadow-sm bg-[#232526]/80 text-cyan-100 placeholder-cyan-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 border-2 border-cyan-400"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-6 text-center">
         
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 