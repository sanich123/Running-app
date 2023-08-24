import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { ToastAndroid } from 'react-native';

import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { errorHandler } from '../../utils/error-handler';

export async function logInWithEmailAndPassword(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    return user;
  } catch (err) {
    errorHandler(err);
  }
}

export async function registerWithEmailAndPassword(username: string, email: string, password: string): Promise<void> {
  try {
    const { user } = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    await addDoc(collection(FIREBASE_DB, 'users'), {
      uid: user.uid,
      name: username,
      authProvider: 'local',
      email,
    });
    console.log(user);
  } catch (err) {
    errorHandler(err);
  }
}

export function logOut() {
  try {
    signOut(FIREBASE_AUTH);
  } catch (err) {
    errorHandler(err);
  }
}

export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(FIREBASE_AUTH, email);
    ToastAndroid.show('Password reset link sent!', ToastAndroid.SHORT);
  } catch (err) {
    errorHandler(err);
  }
}
