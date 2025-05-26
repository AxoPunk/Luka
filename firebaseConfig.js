import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDFCFT5kYJH8GmTqDbHI_fLAFG7X2ZBRYE',
  authDomain: 'mindcareia-cfdc2.firebaseapp.com',
  projectId: 'mindcareia-cfdc2',
  storageBucket: 'mindcareia-cfdc2.firebasestorage.app',
  messagingSenderId: '720356584620',
  appId: '1:720356584620:web:7ed39c2679d7eb923f4309',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
