import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* -----------------------------
   SWITCH LOGIN / REGISTER
----------------------------- */

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

document.getElementById("showRegister").addEventListener("click", () => {

    loginSection.style.display = "none";
    registerSection.style.display = "block";

});

document.getElementById("showLogin").addEventListener("click", () => {

    registerSection.style.display = "none";
    loginSection.style.display = "block";

});


/* -----------------------------
   REGISTER
----------------------------- */

document.getElementById("registerBtn").addEventListener("click", async () => {

    const name =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    const role =
        document.getElementById("registerRole").value;

    const message =
        document.getElementById("registerMessage");


    if (!name || !email || !password) {

        message.textContent =
            "Please fill all fields.";

        return;
    }


    if (password.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        return;
    }


    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            userCredential.user;


        /* Save user information */

        await setDoc(
            doc(db, "users", user.uid),
            {
                name: name,
                email: email,
                role: role,
                createdAt: new Date().toISOString()
            }
        );


        message.textContent =
            "Account created successfully!";


        setTimeout(() => {

            if (role === "student") {

                window.location.href =
                    "student-dashboard.html";

            } else {

                window.location.href =
                    "company-dashboard.html";

            }

        }, 1000);


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message;

    }

});


/* -----------------------------
   LOGIN
----------------------------- */

document.getElementById("loginBtn").addEventListener("click", async () => {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    const selectedRole =
        document.getElementById("loginRole").value;

    const message =
        document.getElementById("loginMessage");


    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        return;
    }


    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            userCredential.user;


        /* Get role from Firestore */

        const userDoc =
            await getDoc(
                doc(db, "users", user.uid)
            );


        if (!userDoc.exists()) {

            message.textContent =
                "User profile not found.";

            return;
        }


        const userData =
            userDoc.data();


        if (userData.role !== selectedRole) {

            message.textContent =
                "Incorrect role selected.";

            return;
        }


        message.textContent =
            "Login successful!";


        /* Redirect */

        if (userData.role === "student") {

            window.location.href =
                "student-dashboard.html";

        }

        else if (userData.role === "company") {

            window.location.href =
                "company-dashboard.html";

        }

        else if (userData.role === "admin") {

            window.location.href =
                "admin-dashboard.html";

        }


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message;

    }

});