console.log("index.js loaded");

const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");

loginError.style.display = "none";
registerError.style.display = "none";
registerSuccess.style.display = "none";

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");

  loginForm.classList.add("active");
  registerForm.classList.remove("active");

  loginError.style.display = "none";
  registerError.style.display = "none";
  registerSuccess.style.display = "none";
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  registerForm.classList.add("active");
  loginForm.classList.remove("active");

  loginError.style.display = "none";
  registerError.style.display = "none";
  registerSuccess.style.display = "none";
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  loginError.style.display = "none";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    loginError.textContent = "Email and password are required.";
    loginError.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || `Login failed (${res.status})`);
    }

    if (!data.token) {
      throw new Error("Login succeeded but token was not returned.");
    }

    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Login error:", err);
    loginError.textContent = err.message || "Login failed.";
    loginError.style.display = "block";
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  registerError.style.display = "none";
  registerSuccess.style.display = "none";

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!email || !password) {
    registerError.textContent = "Email and password are required.";
    registerError.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Server returned invalid response (${res.status})`);
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || `Registration failed (${res.status})`);
    }

    registerSuccess.textContent = "Account created successfully. You can login now.";
    registerSuccess.style.display = "block";
    registerForm.reset();

    setTimeout(() => {
      loginTab.click();
    }, 1000);
  } catch (err) {
    console.error("Register error:", err);
    registerError.textContent = err.message || "Registration failed.";
    registerError.style.display = "block";
  }
});