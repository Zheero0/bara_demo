// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfGv--KCqa-JM7QY2UlM02hB3quAUwP1U",
  authDomain: "bara-test-a5632.firebaseapp.com",
  projectId: "bara-test-a5632",
  storageBucket: "bara-test-a5632.firebasestorage.app",
  messagingSenderId: "750307256700",
  appId: "1:750307256700:web:b98a7304b70c83314b9cf9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider, signInWithPopup };
