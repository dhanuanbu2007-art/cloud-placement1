import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let currentUser = null;
let companyName = "";


/* AUTH */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    currentUser = user;


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


    if (userData.role !== "company") {

        window.location.href = "login.html";

        return;
    }


    companyName =
        userData.name;


    document.getElementById("companyName").textContent =
        companyName;


    loadMyJobs();

    loadApplications();

});


/* POST JOB */

document.getElementById("postJobBtn").addEventListener("click", async () => {

    const jobTitle =
        document.getElementById("jobTitle").value.trim();

    const description =
        document.getElementById("jobDescription").value.trim();

    const salary =
        document.getElementById("salary").value.trim();

    const minimumCGPA =
        document.getElementById("minimumCGPA").value;

    const message =
        document.getElementById("jobMessage");


    if (
        !jobTitle ||
        !description ||
        !salary ||
        !minimumCGPA
    ) {

        message.textContent =
            "Please fill all fields.";

        return;
    }


    try {

        await addDoc(
            collection(db, "jobs"),
            {

                jobTitle: jobTitle,

                description: description,

                salary: salary,

                minimumCGPA:
                    Number(minimumCGPA),

                companyName:
                    companyName,

                companyId:
                    currentUser.uid,

                createdAt:
                    new Date().toISOString()

            }
        );


        message.textContent =
            "Job posted successfully!";


        document.getElementById("jobTitle").value = "";

        document.getElementById("jobDescription").value = "";

        document.getElementById("salary").value = "";

        document.getElementById("minimumCGPA").value = "";


        loadMyJobs();


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message;

    }

});


/* LOAD MY JOBS */

async function loadMyJobs() {

    const container =
        document.getElementById("myJobs");


    const q =
        query(
            collection(db, "jobs"),
            where(
                "companyId",
                "==",
                currentUser.uid
            )
        );


    const snapshot =
        await getDocs(q);


    document.getElementById("jobCount").textContent =
        snapshot.size;


    container.innerHTML = "";


    if (snapshot.empty) {

        container.innerHTML =
            "<p>No jobs posted yet.</p>";

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


    const q =
        query(
            collection(db, "applications"),
            where(
                "companyName",
                "==",
                companyName
            )
        );


    const snapshot =
        await getDocs(q);


    document.getElementById("applicationCount").textContent =
        snapshot.size;


    table.innerHTML = "";


    snapshot.forEach((applicationDoc) => {

        const application =
            applicationDoc.data();


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${application.studentName}</td>

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