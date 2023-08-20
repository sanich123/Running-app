import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { query, getDocs, collection, where, addDoc } from 'firebase/firestore';

import { currentAuth, db } from '../firebaseConfig';

export async function signInWithSocialNetwork() {
  const provider = new GoogleAuthProvider();
  try {
    const { user } = await signInWithPopup(currentAuth, provider);
    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        name: user.displayName,
        authProvider: 'google',
        email: user.email,
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}
