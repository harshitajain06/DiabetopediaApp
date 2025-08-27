import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDs1RjxcDY4iBNE-cZnMm6r2LlM5VEdL6E",
  authDomain: "diabetopedia-dbddb.firebaseapp.com",
  projectId: "diabetopedia-dbddb",
  storageBucket: "diabetopedia-dbddb.firebasestorage.app",
  messagingSenderId: "866476322176",
  appId: "1:866476322176:web:deb42be0cc96a3546e6565",
  measurementId: "G-XGH3W6HPWG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Use correct auth initialization based on platform
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app); // Use standard web auth
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

export const db = getFirestore(app);
export const storage = getStorage(app);
export const usersRef = collection(db, 'users');
