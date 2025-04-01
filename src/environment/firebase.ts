import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const PUBLIC_KEY = '6LfCjgYrAAAAAFZcAcDRNh73U3nKNR89aTIIiGbQ';

const firebaseConfig = {
    apiKey: "AIzaSyBCjTfzGYA_pDqEwy0EWN2PA0iNzpsdNJo",
    authDomain: "stanalitica-c1184.firebaseapp.com",
    projectId: "stanalitica-c1184",
    storageBucket: "stanalitica-c1184.firebasestorage.app",
    messagingSenderId: "143821589647",
    appId: "1:143821589647:web:e692a52fe3cb87e7b5b4fa"
};

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(PUBLIC_KEY),
    isTokenAutoRefreshEnabled: true
});
export const auth = getAuth(app);
export const firestore = getFirestore(app);