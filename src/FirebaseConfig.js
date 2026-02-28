import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyA_JRjCsNIVWO9unUcMNa8XorckOtqjAmU",
  authDomain: "loginandsignup-7a86c.firebaseapp.com",
  databaseURL: "https://loginandsignup-7a86c-default-rtdb.firebaseio.com",
  projectId: "loginandsignup-7a86c",
  storageBucket: "loginandsignup-7a86c.appspot.com",
  messagingSenderId: "203331983028",
  appId: "1:203331983028:web:3a884509fb8e8a9f3669e1",
  measurementId: "G-GS3SD0V0L4",
};
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);

export const api2 = "https://api.justdude.in:5000/api";
export const mobile_api = "https://api.justdude.in:5000/mobile";

export const API = axios.create({
  baseURL: "https://api.justdude.in:5000/api",
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
