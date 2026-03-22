// reusable login function
async function loginUser(email, password) {
    try {
        const res = await fetch("http://localhost:3000/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "dashboard.html"; // redirect
        } else {
            return data.error;
        }
    } catch (err) {
        console.error(err);
        return "Network error";
    }
}

// login form submit
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const error = await loginUser(email, password);
    if (error) {
        document.getElementById("loginError").innerText = error;
        document.getElementById("loginError").style.display = "block";
    }
});

// register form submit
document.getElementById("registerForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const res = await fetch("http://localhost:3000/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // registration successful, automatically login
            const loginError = await loginUser(email, password);
            if (loginError) {
                document.getElementById("registerError").innerText = loginError;
                document.getElementById("registerError").style.display = "block";
            }
        } else {
            document.getElementById("registerError").innerText = data.error;
            document.getElementById("registerError").style.display = "block";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("registerError").innerText = "Network error";
        document.getElementById("registerError").style.display = "block";
    }
});

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
document.getElementById("errorMsg").innerHTML = "";
loginTab.onclick = () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
};

registerTab.onclick = () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
};