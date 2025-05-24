import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCYuyHFcdTRNxSHc_9kMZblb5HonZ_qdRE", // Replace with your actual API key
  authDomain: "code-rush-14751.firebaseapp.com",
  projectId: "code-rush-14751",
  storageBucket: "code-rush-14751.firebasestorage.app",
  messagingSenderId: "56866034089",
  appId: "1:56866034089:web:35ac3450b1de7c5f18b4b8",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db } 