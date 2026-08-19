import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCnc6kvG_6NxmPuFRRyQPFS3AyAulEgz8Y",
  authDomain: "cloud-placement-1959e.firebaseapp.com",
  projectId: "cloud-placement-1959e",
  storageBucket: "cloud-placement-1959e.firebasestorage.app",
  messagingSenderId: "1008387493341",
  appId: "1:1008387493341:web:5eea5f0acf7eaa2d37fa34"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
