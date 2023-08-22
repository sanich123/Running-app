import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';

export async function logInWithEmailAndPassword(email: string, password: string) {
  try {
    const { user } = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    return user;
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}

export async function registerWithEmailAndPassword(email: string, password: string): Promise<void> {
  try {
    const res = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    console.log(res);
    const user = res.user;
    await addDoc(collection(FIREBASE_DB, 'users'), {
      uid: user.uid,
      authProvider: 'local',
      email,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}

export function logOut() {
  try {
    signOut(FIREBASE_AUTH);
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}
