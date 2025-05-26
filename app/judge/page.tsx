"use client";
import { AnswerValidation } from "./components/answer-validation";
import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

function JudgeHeader({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex items-center justify-between py-5 px-4 sm:px-8 bg-[#10131a] border-b-2 border-cyan-700/60 shadow-lg mb-8 rounded-b-xl">
      <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-wide drop-shadow-lg">
        Code Rush <span className="text-cyan-400">Judge Portal</span>
      </div>
      <div className="relative">
        <Button
          variant="ghost"
          className="rounded-full p-2 sm:p-3 border-2 border-cyan-700/60 bg-cyan-950/40 hover:bg-cyan-900/60 transition"
          onClick={() => setOpen((v) => !v)}
        >
          <User className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-200" />
        </Button>
        {open && (
          <div className="absolute right-0 mt-3 w-48 bg-[#181c24] border border-cyan-900/40 rounded shadow-2xl z-20">
            <button
              className="flex items-center w-full px-5 py-3 text-lg text-left text-cyan-200 hover:bg-cyan-900/30 font-semibold"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 mr-3" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function JudgePage() {
  // Dummy logout handler, replace with real auth logic if needed
  const handleLogout = () => {
    window.location.href = "/login";
  };
  return (
    <div className="min-h-screen bg-[#181c24] text-cyan-100 p-4 sm:p-8">
      <JudgeHeader onLogout={handleLogout} />
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300 mb-6 sm:mb-8">Judge Dashboard</h1>
      <AnswerValidation />
    </div>
  );
} 