// Import individual Firebase services and modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDgGwFyzGMkk1PlsQxzMkeN0annOBNyCfY",
  authDomain: "ryan-62dcd.firebaseapp.com",
  projectId: "ryan-62dcd",
  storageBucket: "ryan-62dcd.appspot.com",
  messagingSenderId: "1059667736696",
  appId: "1:1059667736696:web:eb2a809bddd6d79a90558d",
  measurementId: "G-T995LLN5NL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore and Storage instances
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
