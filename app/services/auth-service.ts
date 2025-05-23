import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    teamName: string;
    role: string;
  } | null;
  error: string | null;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    console.log(userDoc.data());
    if (!userDoc.exists()) {
      return {
        user: null,
        error: 'User data not found'
      };
    }

    const userData = userDoc.data();

    return {
      user: {
        id: user.uid,
        name: userData.name,
        email: userData.email,
        teamName: userData.teamName,
        role: userData.role
      },
      error: null
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      user: null,
      error: error.message || 'An error occurred during login'
    };
  }
}; 