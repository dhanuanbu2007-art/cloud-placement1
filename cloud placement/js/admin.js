import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* AUTH CHECK */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    const userDoc =
        await getDoc(
            doc(db, "users", user.uid)
        );


    if (!userDoc.exists()) {

        window.location.href = "login.html";

        return;
    }


    const userData =
        userDoc.data();


    if (userData.role !== "admin") {

        alert("Admin access required.");

        window.location.href =
            "login.html";

        return;
    }


    loadStatistics();

    loadJobs();

    loadApplications();

});


/* STATISTICS */

async function loadStatistics() {

    const usersSnapshot =
        await getDocs(
            collection(db, "users")
        );


    let students = 0;

    let companies = 0;


    usersSnapshot.forEach((userDoc) => {

        const user =
            userDoc.data();


        if (user.role === "student") {

            students++;

        }


        if (user.role === "company") {

            companies++;

        }

    });


    const jobsSnapshot =
        await getDocs(
            collection(db, "jobs")
        );


    const applicationsSnapshot =
        await getDocs(
            collection(db, "applications")
        );


    document.getElementById("studentCount").textContent =
        students;


    document.getElementById("companyCount").textContent =
        companies;


    document.getElementById("jobCount").textContent =
        jobsSnapshot.size;


    document.getElementById("applicationCount").textContent =
        applicationsSnapshot.size;

}


/* JOBS */

async function loadJobs() {

    const container =
        document.getElementById("jobsContainer");


    const snapshot =
        await getDocs(
            collection(db, "jobs")
        );


    container.innerHTML = "";


    if (snapshot.empty) {

        container.innerHTML =
            "<p>No jobs available.</p>";

        return;
    }


    snapshot.forEach((jobDoc) => {

        const job =
            jobDoc.data();


        const div =
            document.createElement("div");


        div.className =
            "job-card";


        div.innerHTML = `

            <h3>${job.jobTitle}</h3>

            <p>
                <strong>Company:</strong>
                ${job.companyName}
            </p>

            <p>
                ${job.description}
            </p>

            <p>
                <strong>Salary:</strong>
                ${job.salary}
            </p>

            <p>
                <strong>Minimum CGPA:</strong>
                ${job.minimumCGPA}
            </p>

        `;


        container.appendChild(div);

    });

}


/* APPLICATIONS */

async function loadApplications() {

    const table =
        document.getElementById("applicationsTable");


    const snapshot =
        await getDocs(
            collection(db, "applications")
        );


    table.innerHTML = "";


    snapshot.forEach((applicationDoc) => {

        const application =
            applicationDoc.data();


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${application.studentName}</td>

            <td>${application.companyName}</td>

            <td>${application.jobTitle}</td>

            <td>${application.status}</td>

        `;


        table.appendChild(row);

    });

}


/* LOGOUT */

document.getElementById("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

    window.location.href =
        "login.html";

});