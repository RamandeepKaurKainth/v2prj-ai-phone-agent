const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";

const forgotForm = document.getElementById("forgotPasswordForm");
const forgotError = document.getElementById("forgotError");
const forgotSuccess = document.getElementById("forgotSuccess");

forgotError.style.display = "none";
forgotSuccess.style.display = "none";

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  forgotError.style.display = "none";
  forgotSuccess.style.display = "none";

  const email = document.getElementById("forgotEmail").value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const text = await res.text();
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
    forgotError.textContent = err.message;
    forgotError.style.display = "block";
  }
});