const API_BASE = window.location.origin;

const resetForm = document.getElementById("resetPasswordForm");
const resetError = document.getElementById("resetError");
const resetSuccess = document.getElementById("resetSuccess");
const resetTokenInput = document.getElementById("resetToken");
const newPasswordInput = document.getElementById("newPassword");

if (resetError) resetError.style.display = "none";
if (resetSuccess) resetSuccess.style.display = "none";

const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get("token");

if (tokenFromUrl && resetTokenInput) {
  resetTokenInput.value = tokenFromUrl;
}

if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    resetError.style.display = "none";
    resetSuccess.style.display = "none";

    const token = resetTokenInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    if (!token || !newPassword) {
      resetError.textContent = "Token and new password are required.";
      resetError.style.display = "block";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

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
      console.error("Reset password error:", err);
      resetError.textContent = err.message || "Something went wrong.";
      resetError.style.display = "block";
    }
  });
}