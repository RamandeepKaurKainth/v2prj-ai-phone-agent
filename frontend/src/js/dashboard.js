const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const recordBtn = document.getElementById("recordBtn");
const recordingStatus = document.getElementById("recordingStatus");
const transcript = document.getElementById("transcript");
const agentReply = document.getElementById("agentReply");
const replyAudio = document.getElementById("replyAudio");
const result = document.getElementById("result");
const callCoreText = document.getElementById("callCoreText");
const userInfoBox = document.getElementById("userInfo");
const adminListBox = document.getElementById("UserListForAdmin");
const recentCallsBox = document.getElementById("recentCalls");

function setCallState(state) {
  if (state === "recording") {
    callCoreText.textContent = "Listening";
    recordingStatus.textContent = "Recording 5 seconds of audio...";
    recordBtn.disabled = true;
    recordBtn.textContent = "Recording...";
  } else if (state === "processing") {
    callCoreText.textContent = "Processing";
    recordingStatus.textContent = "Sending audio to AI...";
    recordBtn.disabled = true;
    recordBtn.textContent = "Processing...";
  } else {
    callCoreText.textContent = "Ready";
    recordingStatus.textContent = "Press the button to record 5 seconds of audio.";
    recordBtn.disabled = false;
    recordBtn.textContent = "Start Recording";
  }
}

async function loadUserInfo() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load user info");
    }

    userInfoBox.innerHTML = `
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Role:</strong> ${data.is_admin ? "Admin" : "User"}</p>
      <p><strong>Remaining calls:</strong> ${data.remaining_calls}</p>
    `;

    if (data.is_admin) {
      loadAdminUsers();
    } else {
      adminListBox.innerHTML = "<p>Admin access only.</p>";
    }
  } catch (err) {
    console.error("User info error:", err);
    userInfoBox.innerHTML = `<p>${err.message}</p>`;
  }
}

async function loadAdminUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load admin data");
    }

    if (!Array.isArray(data) || data.length === 0) {
      adminListBox.innerHTML = "<p>No users found.</p>";
      return;
    }

    adminListBox.innerHTML = data.map(user => `
      <div class="user-box">
        <p><strong>${user.email}</strong></p>
        <p>Remaining calls: ${user.remaining_calls}</p>
      </div>
    `).join("");
  } catch (err) {
    console.error("Admin load error:", err);
    adminListBox.innerHTML = `<p>${err.message}</p>`;
  }
}

async function loadRecentCalls() {
  try {
    const res = await fetch(`${API_BASE}/api/phone-agent/recent-calls`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load recent calls");
    }

    if (!Array.isArray(data) || data.length === 0) {
      recentCallsBox.innerHTML = "<p>No recent calls found.</p>";
      return;
    }

    recentCallsBox.innerHTML = data.map(call => `
      <div class="user-box">
        <p><strong>Phone:</strong> ${call.phone_number || "N/A"}</p>
        <p><strong>Goal:</strong> ${call.goal || "N/A"}</p>
        <p><strong>Role:</strong> ${call.role || "N/A"}</p>
        <p><strong>Message:</strong> ${call.transcript || ""}</p>
        <p><strong>Time:</strong> ${call.created_at ? new Date(call.created_at).toLocaleString() : "N/A"}</p>
      </div>
    `).join("");
  } catch (err) {
    console.error("Recent calls error:", err);
    recentCallsBox.innerHTML = `<p>${err.message}</p>`;
  }
}

async function recordAndSend() {
  result.textContent = "";
  transcript.textContent = "Listening...";
  agentReply.textContent = "Waiting for response...";
  replyAudio.removeAttribute("src");
  replyAudio.load();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setCallState("processing");

      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("sessionId", document.getElementById("sessionId").value || "conversation-1");

      try {
        const res = await fetch(`${API_BASE}/api/phone-agent/full`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "AI request failed");
        }

        transcript.textContent = data.text || "No transcript returned.";
        agentReply.textContent = data.reply || "No reply returned.";

        if (data.audio) {
          replyAudio.src = `data:audio/mp3;base64,${data.audio}`;
        }

        if (data.usage && typeof data.usage.remaining_calls !== "undefined") {
          result.textContent = `Remaining calls: ${data.usage.remaining_calls}`;
        } else {
          result.textContent = "Request completed successfully.";
        }

        await loadUserInfo();
        await loadRecentCalls();
      } catch (err) {
        console.error("Pipeline error:", err);
        result.textContent = err.message;
        transcript.textContent = "No transcript yet.";
        agentReply.textContent = "No reply yet.";
      } finally {
        setCallState("ready");
        stream.getTracks().forEach(track => track.stop());
      }
    };

    setCallState("recording");
    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);
  } catch (err) {
    console.error("Recording error:", err);
    result.textContent = "Microphone access denied or unavailable.";
    setCallState("ready");
  }
}

async function startPhoneCall() {
  const phoneInput = document.getElementById("phoneNumber");
  const goalInput = document.getElementById("callGoal");
  const callResult = document.getElementById("callResult");
  const callBtn = document.getElementById("callBtn");

  const phoneNumber = phoneInput.value.trim();
  const goal = goalInput.value.trim();

  callResult.textContent = "";

  if (!phoneNumber || !goal) {
    callResult.textContent = "Please enter both phone number and call goal.";
    return;
  }

  callBtn.disabled = true;
  callBtn.textContent = "Starting Call...";

  try {
    const res = await fetch(`${API_BASE}/api/phone-agent/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        phoneNumber,
        goal
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to start phone call.");
    }

    callResult.textContent = `Call started successfully. Call SID: ${data.callSid}`;
    await loadUserInfo();
    await loadRecentCalls();
  } catch (err) {
    console.error("Phone call error:", err);
    callResult.textContent = err.message || "Failed to start phone call.";
  } finally {
    callBtn.disabled = false;
    callBtn.textContent = "Start Phone Call";
  }
}

setCallState("ready");
loadUserInfo();
loadRecentCalls();