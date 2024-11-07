import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCjiM-h-XCmnkasrTeiZDgNpb0_RZ-a4Os",
  authDomain: "crmdude-f417a.firebaseapp.com",
  databaseURL: "https://crmdude-f417a-default-rtdb.firebaseio.com",
  projectId: "crmdude-f417a",
  storageBucket: "crmdude-f417a.firebasestorage.app",
  messagingSenderId: "363259586787",
  appId: "1:363259586787:web:1928db06595a9f6e057dd6",
  measurementId: "G-GBLQY3H58T"
};

const app = initializeApp(firebaseConfig)


export const db = getDatabase(app);
export const storage  = getStorage(app);

export default app;

