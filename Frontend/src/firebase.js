// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCI3KD419QfznRgwmYdlwimDN85vNi0FJk",
  authDomain: "mernstack-bfba8.firebaseapp.com",
  projectId: "mernstack-bfba8",
  storageBucket: "mernstack-bfba8.firebasestorage.app",
  messagingSenderId: "767478636891",
  appId: "1:767478636891:web:7da134bde9e88b4878ba7e",
  measurementId: "G-38Z769NKW0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};