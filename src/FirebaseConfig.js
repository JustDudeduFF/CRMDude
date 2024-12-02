import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_JRjCsNIVWO9unUcMNa8XorckOtqjAmU",
  authDomain: "loginandsignup-7a86c.firebaseapp.com",
  databaseURL: "https://loginandsignup-7a86c-default-rtdb.firebaseio.com",
  projectId: "loginandsignup-7a86c",
  storageBucket: "loginandsignup-7a86c.appspot.com",
  messagingSenderId: "203331983028",
  appId: "1:203331983028:web:3a884509fb8e8a9f3669e1",
  measurementId: "G-GS3SD0V0L4"
};
const app = initializeApp(firebaseConfig)


export const db = getDatabase(app);
export const storage  = getStorage(app);

export default app;

