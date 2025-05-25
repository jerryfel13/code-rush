"use client";
import { AnswerValidation } from "./components/answer-validation";

export default function JudgePage() {
  return (
    <div className="min-h-screen bg-[#181c24] text-cyan-100 p-8">
      <h1 className="text-3xl font-bold text-cyan-300 mb-8">Judge Dashboard</h1>
      <AnswerValidation />
    </div>
  );
} 