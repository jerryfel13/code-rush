import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { User } from "@/context/auth-context"
import { toast } from 'react-toastify'

export async function loginUser(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    if (!userDoc.exists()) {
      toast.error("User data not found");
      return { user: null, error: "User data not found" }
    }

    const userData = userDoc.data()
    
    // Create user object
    const user: User = {
      id: firebaseUser.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      teamName: userData.teamName,
      status: userData.status,
    }

    return { user }
  } catch (error: any) {
    console.error("Login error:", error)
    toast.error(error.message || "An error occurred during login");
    return { 
      user: null, 
      error: error.message || "An error occurred during login" 
    }
  }
} 