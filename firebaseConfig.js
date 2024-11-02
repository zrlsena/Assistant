// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore'u kullanacaksan bunu ekle

const firebaseConfig = {
  apiKey: "AIzaSyAfEbbDauowyAxxwJ_-X-qMJfHGhsyo-dA",
  authDomain: "assistant-50200.firebaseapp.com",
  projectId: "assistant-50200",
  storageBucket: "assistant-50200.firebasestorage.app",
  messagingSenderId: "470755271523",
  appId: "1:470755271523:web:2635162d8d3d3e85786956",
  measurementId: "G-LM0FDCLSGN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore için db referansı

export { db }; // db'yi dışa aktar
