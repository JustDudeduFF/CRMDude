import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyBAu9aTelNjuHFlpdtrZeMsrE_lQKdq9hw",
  authDomain: "crmdude-adeeb.firebaseapp.com",
  databaseURL: "https://crmdude-adeeb-default-rtdb.firebaseio.com",
  projectId: "crmdude-adeeb",
  storageBucket: "crmdude-adeeb.firebasestorage.app",
  messagingSenderId: "1002510519386",
  appId: "1:1002510519386:web:f842ae59ad7419f530dc63",
  measurementId: "G-JLTFZ8DD85"
};
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);

export const api2 = "https://dudeapi.justdude.in/api";
export const mobile_api = "https://dudeapi.justdude.in/mobile";

export const API = axios.create({
  baseURL: "https://dudeapi.justdude.in/api",
});

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
