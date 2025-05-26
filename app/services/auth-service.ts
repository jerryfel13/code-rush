import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import { toast } from 'react-toastify';

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    teamName: string;
    role: string;
    status: string;
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
    if (!userDoc.exists()) {
      toast.error('User data not found');
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
        role: userData.role,
        status: userData.status,
      },
      error: null
    };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/invalid-credential') {
      toast.error('Invalid email or password. Please try again.');
      return {
        user: null,
        error: 'Invalid email or password. Please try again.'
      };
    }
    toast.error(error.message || 'An error occurred during login');
    return {
      user: null,
      error: error.message || 'An error occurred during login'
    };
  }
}; 