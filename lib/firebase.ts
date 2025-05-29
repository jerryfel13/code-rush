import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBkpU34Vzh9KkaWq2z9wyESn4vndLu_CCI",
  authDomain: "code-rush-1c293.firebaseapp.com",
  projectId: "code-rush-1c293",
  storageBucket: "code-rush-1c293.firebasestorage.app",
  messagingSenderId: "360331473648",
  appId: "1:360331473648:web:802c83d372df9e22f68835",
  measurementId: "G-70E6XQQR9P"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db } 