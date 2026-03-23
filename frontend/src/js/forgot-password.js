console.log("forgot-password.js loaded");

const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";

const forgotForm = document.getElementById("forgotPasswordForm");
const forgotError = document.getElementById("forgotError");
const forgotSuccess = document.getElementById("forgotSuccess");

if (!forgotForm) {
  console.error("forgotPasswordForm not found");
} else {
  forgotError.style.display = "none";
  forgotSuccess.style.display = "none";

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    forgotError.style.display = "none";
    forgotSuccess.style.display = "none";

    const emailInput = document.getElementById("forgotEmail");
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      forgotError.textContent = "Please enter your email.";
      forgotError.style.display = "block";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to request reset");
      }

      forgotSuccess.textContent =
        data.message || "If an account exists, a reset link has been sent.";
      forgotSuccess.style.display = "block";
      forgotForm.reset();
    } catch (err) {
      console.error("Forgot password error:", err);
      forgotError.textContent = err.message || "Something went wrong.";
      forgotError.style.display = "block";
    }
  });
}