import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const {
  EXPO_PUBLIC_FIREBASE_APIKEY,
  EXPO_PUBLIC_AUTH_DOMAIN,
  EXPO_PUBLIC_PROJECT_ID,
  EXPO_PUBLIC_STORAGE_BUCKET,
  EXPO_PUBLIC_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_APP_ID,
  EXPO_PUBLIC_MEASUREMENTID,
} = process.env;

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_APIKEY,
  authDomain: EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_APP_ID,
  measurementId: EXPO_PUBLIC_MEASUREMENTID,
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
export const auth = getAuth(FIREBASE_APP);
export const provider = new GoogleAuthProvider();
