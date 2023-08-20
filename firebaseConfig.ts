import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

const FIREBASE_APP = initializeApp(firebaseConfig);
export const currentAuth = getAuth(FIREBASE_APP);
export const db = getFirestore(FIREBASE_APP);
