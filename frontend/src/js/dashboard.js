// const API_BASE = "http://localhost:3000";
const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

async function loadUserInfo() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned invalid JSON");
    }

    if (!res.ok) {
      throw new Error(data.error || "Failed to load user info");
    }

    const userInfoDiv = document.getElementById("userInfo");
    const adminListDiv = document.getElementById("UserListForAdmin");

    if (data.type === "user") {
      userInfoDiv.innerHTML = `
        <p><strong>User:</strong> ${data.self.email}</p>
        <p><strong>API Limit:</strong> ${data.self.api_limit}</p>
        <p><strong>Used Calls:</strong> ${data.self.used_calls}</p>
        <p><strong>Remaining Calls:</strong> ${data.self.remaining_calls}</p>
      `;
    } else if (data.type === "admin") {
      userInfoDiv.innerHTML = `
        <p><strong>Admin:</strong> ${data.self.email}</p>
        <p><strong>API Limit:</strong> ${data.self.api_limit}</p>
        <p><strong>Used Calls:</strong> ${data.self.used_calls}</p>
        <p><strong>Remaining Calls:</strong> ${data.self.remaining_calls}</p>
      `;

      let html = "<h3>All Users</h3>";

      data.users.forEach((user) => {
        html += `
          <div class="user-box">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role_name}</p>
            <p><strong>API Limit:</strong> ${user.api_limit}</p>
            <p><strong>Used Calls:</strong> ${user.used_calls}</p>
            <p><strong>Remaining Calls:</strong> ${user.remaining_calls}</p>
          </div>
        `;
      });

      adminListDiv.innerHTML = html;
    }
  } catch (err) {
    console.error("User info error:", err.message);
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }
}

async function sendSMS() {
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();
  const result = document.getElementById("result");

  if (!phone || !message) {
    result.textContent = "Please enter phone number and message.";
    return;
  }

  result.textContent = "SMS sending is not connected yet.";
}

loadUserInfo();