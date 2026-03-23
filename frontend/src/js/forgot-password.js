console.log("forgot-password.js loaded");

const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";

const forgotForm = document.getElementById("forgotPasswordForm");
const forgotError = document.getElementById("forgotError");
const forgotSuccess = document.getElementById("forgotSuccess");

if (!forgotForm) {
  console.error("forgotPasswordForm not found");
}

forgotError.style.display = "none";
forgotSuccess.style.display = "none";

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Forgot password form submitted");

  forgotError.style.display = "none";
  forgotSuccess.style.display = "none";

  const email = document.getElementById("forgotEmail").value.trim();
  console.log("Sending forgot password request for:", email);

  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    console.log("Response status:", res.status);

    const text = await res.text();
    console.log("Raw response:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned invalid JSON");
    }

    if (!res.ok) {
      throw new Error(data.error || "Failed to request reset");
    }

    forgotSuccess.textContent = data.message || "Password reset email sent successfully.";
    forgotSuccess.style.display = "block";
    forgotForm.reset();
  } catch (err) {
    console.error("Forgot password error:", err);
    forgotError.textContent = err.message;
    forgotError.style.display = "block";
  }
});