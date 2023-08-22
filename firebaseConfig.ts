import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDnyP44gzUApSZKnLZihdVMHhzt_gL0GF0',
  authDomain: 'runich-6be07.firebaseapp.com',
  projectId: 'runich-6be07',
  storageBucket: 'runich-6be07.appspot.com',
  messagingSenderId: '335123904905',
  appId: '1:335123904905:web:22dd72162fb091b9920958',
  measurementId: 'G-3TE0WYH8JX',
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage),
});
