import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAnHNt_CkEPOXfJQMGqobfhnseqk5IbGo0",
    authDomain: "trialcrmdude.firebaseapp.com",
    projectId: "trialcrmdude",
    storageBucket: "trialcrmdude.appspot.com",
    messagingSenderId: "779519878434",
    appId: "1:779519878434:web:54ac9568da5e2440fa317b",
    measurementId: "G-1PPH3J7LDK"
  };

const app = initializeApp(firebaseConfig)


export const db = getDatabase(app);
export const storage  = getStorage(app);

export default app;

