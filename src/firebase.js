import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC834ewC9kVW-L_udcwyrobtdzf01HBy7E",
  authDomain: "pulsenergy.firebaseapp.com",
  projectId: "pulsenergy",
  storageBucket: "pulsenergy.appspot.com",
  messagingSenderId: "697816199522",
  appId: "1:697816199522:web:4b3139abd2e9893d697c3b"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
export const db = getFirestore(app);
export { app, auth };