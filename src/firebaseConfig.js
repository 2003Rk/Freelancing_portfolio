// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNuuhnaJ-qbWv4hshC1_q2JkLVGMKnNlY",
  authDomain: "tiktok-f228d.firebaseapp.com",
  projectId: "tiktok-f228d",
  storageBucket: "tiktok-f228d.firebasestorage.app",
  messagingSenderId: "584507510307",
  appId: "1:584507510307:web:47f8b9b5a5f9d28779eb96",
  measurementId: "G-TCWB02C96Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;