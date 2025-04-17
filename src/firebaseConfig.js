// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJxQv_3wlc3HZbc-oq2fneNrYOL5oX98k",

  authDomain: "rechnungsgenerator-66078.firebaseapp.com",

  projectId: "rechnungsgenerator-66078",

  storageBucket: "rechnungsgenerator-66078.firebasestorage.app",

  messagingSenderId: "290281232472",

  appId: "1:290281232472:web:f7b80421d8075d9a1b522d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
