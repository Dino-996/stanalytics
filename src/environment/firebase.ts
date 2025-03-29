import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBCjTfzGYA_pDqEwy0EWN2PA0iNzpsdNJo",
    authDomain: "stanalitica-c1184.firebaseapp.com",
    projectId: "stanalitica-c1184",
    storageBucket: "stanalitica-c1184.firebasestorage.app",
    messagingSenderId: "143821589647",
    appId: "1:143821589647:web:e692a52fe3cb87e7b5b4fa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);