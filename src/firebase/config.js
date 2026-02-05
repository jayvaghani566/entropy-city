// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6tzeoijYVYRSGhAsMMPs6FfZDZ6seSgE",
    authDomain: "entropy-city.firebaseapp.com",
    // Standard Realtime Database URL pattern based on project ID
    databaseURL: "https://entropy-city-default-rtdb.firebaseio.com",
    projectId: "entropy-city",
    storageBucket: "entropy-city.firebasestorage.app",
    messagingSenderId: "660792049273",
    appId: "1:660792049273:web:740f012c525b76f10f9ea8",
    measurementId: "G-GLWSFPB3YX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database and export
const db = getDatabase(app);

export { db, app, analytics };
