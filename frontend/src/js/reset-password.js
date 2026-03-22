const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";

const resetForm = document.getElementById("resetPasswordForm");
const resetError = document.getElementById("resetError");
const resetSuccess = document.getElementById("resetSuccess");
const resetTokenInput = document.getElementById("resetToken");

resetError.style.display = "none";
resetSuccess.style.display = "none";

const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get("token");

if (tokenFromUrl) {
  resetTokenInput.value = tokenFromUrl;
}

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  resetError.style.display = "none";
  resetSuccess.style.display = "none";

  const token = document.getElementById("resetToken").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token, newPassword })
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned invalid JSON");
    }

    if (!res.ok) {
      throw new Error(data.error || "Failed to reset password");
    }

    resetSuccess.textContent = data.message || "Password reset successfully.";
    resetSuccess.style.display = "block";
    resetForm.reset();

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (err) {
    resetError.textContent = err.message;
    resetError.style.display = "block";
  }
});