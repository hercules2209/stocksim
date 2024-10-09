import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBFcF7_-7aIXe3lY9JRH4fautvnSjiu8e4",
  authDomain: "stocksim-432707.firebaseapp.com",
  projectId: "stocksim-432707",
  storageBucket: "stocksim-432707.appspot.com",
  messagingSenderId: "9311700366",
  appId: "1:9311700366:web:835f9ea5980ea8379950df",
  measurementId: "G-L8GXK43XL7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { app, auth, firestore, storage };