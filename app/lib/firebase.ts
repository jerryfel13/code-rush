import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYuyHFcdTRNxSHc_9kMZblb5HonZ_qdRE",
  authDomain: "code-rush-14751.firebaseapp.com",
  projectId: "code-rush-14751",
  storageBucket: "code-rush-14751.firebasestorage.app",
  messagingSenderId: "56866034089",
  appId: "1:56866034089:web:35ac3450b1de7c5f18b4b8",
  measurementId: "G-KSMMJLKMW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 