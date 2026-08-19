import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    addDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


let currentUser = null;


/* ==========================================
   CHECK LOGIN
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    currentUser = user;


    try {

        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );


        if (!userDoc.exists()) {

            window.location.href = "login.html";

            return;
        }


        const userData = userDoc.data();


        /* Check role */

        if (userData.role !== "student") {

            alert("Student access required.");

            window.location.href = "login.html";

            return;
        }


        /* Display name */

        document.getElementById("studentName").textContent =
            userData.name || "Student";


        /* Load profile */

        loadProfile(userData);


        /* Load jobs */

        loadJobs();


        /* Load applications */

        loadApplications();


    } catch (error) {

        console.error(error);

    }

});


/* ==========================================
   LOAD STUDENT PROFILE
========================================== */

function loadProfile(userData) {

    document.getElementById("profileName").value =
        userData.name || "";


    document.getElementById("profileEmail").value =
        userData.email || "";


    document.getElementById("studentId").value =
        userData.studentId || "";


    document.getElementById("department").value =
        userData.department || "";


    document.getElementById("year").value =
        userData.year || "";


    document.getElementById("cgpa").value =
        userData.cgpa || "";


    document.getElementById("phone").value =
        userData.phone || "";


    document.getElementById("skills").value =
        userData.skills || "";

}


/* ==========================================
   SAVE PROFILE
========================================== */

document.getElementById("saveProfileBtn")
    .addEventListener("click", async () => {

        const name =
            document.getElementById("profileName")
                .value.trim();


        const studentId =
            document.getElementById("studentId")
                .value.trim();


        const department =
            document.getElementById("department")
                .value;


        const year =
            document.getElementById("year")
                .value;


        const cgpa =
            document.getElementById("cgpa")
                .value;


        const phone =
            document.getElementById("phone")
                .value.trim();


        const skills =
            document.getElementById("skills")
                .value.trim();


        const message =
            document.getElementById("profileMessage");


        /* Validation */

        if (
            !name ||
            !studentId ||
            !department ||
            !year ||
            !cgpa ||
            !phone ||
            !skills
        ) {

            message.textContent =
                "Please fill all profile fields.";

            return;
        }


        if (Number(cgpa) < 0 || Number(cgpa) > 10) {

            message.textContent =
                "CGPA must be between 0 and 10.";

            return;
        }


        try {

            await updateDoc(
                doc(db, "users", currentUser.uid),
                {

                    name: name,

                    studentId: studentId,

                    department: department,

                    year: year,

                    cgpa: Number(cgpa),

                    phone: phone,

                    skills: skills,

                    profileCompleted: true

                }
            );


            document.getElementById("studentName")
                .textContent = name;


            message.textContent =
                "Profile saved successfully!";


        } catch (error) {

            console.error(error);

            message.textContent =
                error.message;

        }

    });


/* ==========================================
   LOAD JOBS
========================================== */

async function loadJobs() {

    const jobsContainer =
        document.getElementById("jobsContainer");


    try {

        const snapshot =
            await getDocs(
                collection(db, "jobs")
            );


        document.getElementById("jobCount")
            .textContent = snapshot.size;


        jobsContainer.innerHTML = "";


        if (snapshot.empty) {

            jobsContainer.innerHTML =
                "<p>No placement drives available yet.</p>";

            return;
        }


        snapshot.forEach((jobDoc) => {

            const job = jobDoc.data();


            const div =
                document.createElement("div");


            div.className = "job-card";


            div.innerHTML = `

                <h3>
                    ${job.jobTitle}
                </h3>

                <p>
                    <strong>Company:</strong>
                    ${job.companyName}
                </p>

                <p>
                    <strong>Description:</strong>
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

                <button
                    class="btn"
                    onclick="applyForJob('${jobDoc.id}')">

                    Apply Now

                </button>

            `;


            jobsContainer.appendChild(div);

        });


    } catch (error) {

        console.error(error);

        jobsContainer.innerHTML =
            "<p>Unable to load jobs.</p>";

    }

}


/* ==========================================
   APPLY FOR JOB
========================================== */

window.applyForJob = async function(jobId) {

    try {

        const existingQuery =
            query(
                collection(db, "applications"),

                where(
                    "studentId",
                    "==",
                    currentUser.uid
                ),

                where(
                    "jobId",
                    "==",
                    jobId
                )
            );


        const existing =
            await getDocs(existingQuery);


        if (!existing.empty) {

            alert(
                "You have already applied for this job."
            );

            return;
        }


        /* Get job */

        const jobDoc =
            await getDoc(
                doc(db, "jobs", jobId)
            );


        if (!jobDoc.exists()) {

            alert("Job no longer exists.");

            return;
        }


        const job =
            jobDoc.data();


        /* Check CGPA */

        const studentDoc =
            await getDoc(
                doc(db, "users", currentUser.uid)
            );


        const student =
            studentDoc.data();


        const studentCGPA =
            Number(student.cgpa || 0);


        const minimumCGPA =
            Number(job.minimumCGPA || 0);


        if (studentCGPA < minimumCGPA) {

            alert(
                `You are not eligible. Minimum CGPA required: ${minimumCGPA}`
            );

            return;
        }


        /* Create application */

        await addDoc(
            collection(db, "applications"),
            {

                studentId:
                    currentUser.uid,

                studentName:
                    student.name,

                jobId:
                    jobId,

                jobTitle:
                    job.jobTitle,

                companyName:
                    job.companyName,

                status:
                    "Applied",

                appliedAt:
                    new Date().toISOString()

            }
        );


        alert(
            "Application submitted successfully!"
        );


        loadApplications();


    } catch (error) {

        console.error(error);

        alert(error.message);

    }

};


/* ==========================================
   LOAD APPLICATIONS
========================================== */

async function loadApplications() {

    const table =
        document.getElementById(
            "applicationsTable"
        );


    try {

        const q =
            query(
                collection(db, "applications"),

                where(
                    "studentId",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(q);


        document.getElementById(
            "applicationCount"
        ).textContent = snapshot.size;


        table.innerHTML = "";


        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="3">
                        No applications yet.
                    </td>
                </tr>
            `;

            return;
        }


        snapshot.forEach((applicationDoc) => {

            const application =
                applicationDoc.data();


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${application.jobTitle}
                </td>

                <td>
                    ${application.companyName}
                </td>

                <td>
                    ${application.status}
                </td>

            `;


            table.appendChild(row);

        });


    } catch (error) {

        console.error(error);

    }

}


/* ==========================================
   LOGOUT
========================================== */

document.getElementById("logoutBtn")
    .addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

            console.error(error);

        }

    });
