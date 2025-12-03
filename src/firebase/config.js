// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFYG__Lh09ANHXt24WqCEw1vvy8rfxYeg",
  authDomain: "zchutyeda.firebaseapp.com",
  projectId: "zchutyeda",
  storageBucket: "zchutyeda.firebasestorage.app",
  messagingSenderId: "584206459668",
  appId: "1:584206459668:web:46708ffd8d31184a021801",
  measurementId: "G-NNPR47C5WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;

