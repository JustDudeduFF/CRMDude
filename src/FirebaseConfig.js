import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import axios from "axios";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);

export const API_ORIGIN = (process.env.REACT_APP_API_URL || 'http://192.168.0.161:5001').replace(/\/$/, '');
export const api2 = `${API_ORIGIN}/api`;
export const mobile_api = `${API_ORIGIN}/mobile`;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_ORIGIN;
export const whatsappServiceUrl = port => { const url = new URL(process.env.REACT_APP_WHATSAPP_ORIGIN || API_ORIGIN); url.port = String(port); return url.origin; };
export const API = axios.create({ baseURL: api2 });
if (process.env.REACT_APP_FIREBASE_EMULATORS === 'true') {
  const host = process.env.REACT_APP_FIREBASE_EMULATOR_HOST || 'localhost';
  connectDatabaseEmulator(db, host, Number(process.env.REACT_APP_FIREBASE_DATABASE_EMULATOR_PORT || 9000));
  connectStorageEmulator(storage, host, Number(process.env.REACT_APP_FIREBASE_STORAGE_EMULATOR_PORT || 9199));
}

// Request Interceptor: Attach Token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle Token Expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Check if it's a 401 error
    if (error.response && error.response.status === 401) {
      // 2. Don't redirect if we are already on the login/home page
      // This prevents the infinite reload loop
      if (window.location.pathname !== "/") {
        localStorage.clear();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);
export default app;
