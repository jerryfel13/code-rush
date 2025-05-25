import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const questionsCol = collection(db, 'questions');
    const snapshot = await getDocs(questionsCol);
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions', details: error?.message }, { status: 500 });
  }
} 