import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPEqzhBH2WFK7CzXWgGrSw0kSEHHrspus",
  authDomain: "shopinspect-6db28.firebaseapp.com",
  projectId: "shopinspect-6db28",
  storageBucket: "shopinspect-6db28.firebasestorage.app",
  messagingSenderId: "231850703012",
  appId: "1:231850703012:web:87e849e52dede0b6008e31"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
