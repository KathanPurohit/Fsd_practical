// === Firebase SDKs (v10 modular) ===
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// === 1) Fill YOUR Firebase config here ===
const firebaseConfig = {
  apiKey: "AIzaSyAFMbKgKlSJEWIBeeE1p9iBoFnAr0HYunE",
  authDomain: "pactical11.firebaseapp.com",
  projectId: "pactical11",
  storageBucket: "pactical11.firebasestorage.app",
  messagingSenderId: "309800263557",
  appId: "1:309800263557:web:000279269e1b0da62eaeec",
  measurementId: "G-TCH2GBE4KF"
};

// === 2) Initialize Firebase and export instances ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };