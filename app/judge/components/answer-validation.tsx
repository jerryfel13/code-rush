"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export function AnswerValidation() {
  const [pendingAnswers, setPendingAnswers] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingAnswers = async (isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    const snapshot = await getDocs(collection(db, "participant_progress"));
    const pending = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => item.status === "pending");
    setPendingAnswers(pending);
    if (isInitial) setInitialLoading(false);
  };

  useEffect(() => {
    fetchPendingAnswers(true); // Only show loading on first load
    const interval = setInterval(() => fetchPendingAnswers(false), 3000); // No loading spinner on poll
    return () => clearInterval(interval);
  }, []);

  const markCorrect = async (id: string) => {
    setProcessingId(id);
    await updateDoc(doc(db, "participant_progress", id), { status: "correct" });
    setPendingAnswers(prev => prev.filter(ans => ans.id !== id));
    setProcessingId(null);
  };

  const markWrong = async (id: string) => {
    setProcessingId(id);
    await updateDoc(doc(db, "participant_progress", id), { status: "wrong" });
    setPendingAnswers(prev => prev.filter(ans => ans.id !== id));
    setProcessingId(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pending Answers for Validation</h2>
      {initialLoading ? (
        <div>Loading...</div>
      ) : pendingAnswers.length === 0 ? (
        <div>No pending answers.</div>
      ) : (
        <ul className="space-y-4">
          {pendingAnswers.map(ans => (
            <li key={ans.id} className="border p-4 rounded bg-gray-900">
              <div>
                <strong>Participant:</strong> {ans.participantId}
              </div>
              <div>
                <strong>Question:</strong> {ans.questionId}
              </div>
              <div>
                <strong>Round:</strong> {ans.round}
              </div>
              <div>
                <strong>Order:</strong> {ans.order}
              </div>
              <div>
                <strong>Answer:</strong> <pre className="bg-gray-800 p-2 rounded">{ans.answer}</pre>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => markCorrect(ans.id)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={processingId === ans.id}
                >
                  {processingId === ans.id ? "Processing..." : "Mark as Correct"}
                </Button>
                <Button
                  onClick={() => markWrong(ans.id)}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={processingId === ans.id}
                >
                  {processingId === ans.id ? "Processing..." : "Mark as Wrong"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 