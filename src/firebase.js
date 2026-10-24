//getApps checks firebase has been initialized or not
//getApp returns the initialized app
import { initializeApp, getApps, getApp } from "firebase/app";
//firestore is used to store and retrieve data
import { getFirestore } from "firebase/firestore";
//auth is used to authenticate users
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
//If there are no initialized Firebase apps, initialize one using my configuration. Otherwise, reuse the existing app
const app1 = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app1);//db is the instance of firestore
export const auth = getAuth(app1);//auth is the instance of auth
//googleProvider is used to authenticate users using Google
export const googleProvider = new GoogleAuthProvider();
export default app1;    




