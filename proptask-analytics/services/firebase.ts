import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase-konfig fra prosjektet ditt
const firebaseConfig = {
  apiKey: "AIzaSyDT08YVNkFxz3Eut4iFqNpD4TniaUZ-4BE",
  authDomain: "proptask-analytics.firebaseapp.com",
  projectId: "proptask-analytics",
  storageBucket: "proptask-analytics.firebasestorage.app",
  messagingSenderId: "801522438884",
  appId: "1:801522438884:web:de473bb50eb0af699352f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
