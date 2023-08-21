import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

import { currentAuth, db } from '../firebaseConfig';

export async function logInWithEmailAndPassword(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(currentAuth, email, password);
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}

export async function registerWithEmailAndPassword(name: string, email: string, password: string): Promise<void> {
  try {
    const res = await createUserWithEmailAndPassword(currentAuth, email, password);
    const user = res.user;
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      name,
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
    signOut(currentAuth);
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}
