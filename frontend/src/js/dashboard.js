const API_BASE = "https://v2prj-ai-phone-agent-9bcp.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

function setCallState(state, message = "") {
  const callCore = document.getElementById("callCore");
  const callCoreText = document.getElementById("callCoreText");
  const recordingStatus = document.getElementById("recordingStatus");
  const result = document.getElementById("result");

  callCore.classList.remove("active");

  if (state === "ready") {
    callCoreText.textContent = "Ready";
    recordingStatus.textContent = message || "Press the button to record 5 seconds of audio.";
  }

  if (state === "recording") {
    callCore.classList.add("active");
    callCoreText.textContent = "Live";
    recordingStatus.textContent = message || "Recording... please speak now.";
  }

  if (state === "processing") {
    callCore.classList.add("active");
    callCoreText.textContent = "AI";
    recordingStatus.textContent = message || "Processing your audio...";
  }

  if (state === "done") {
    callCoreText.textContent = "Done";
    recordingStatus.textContent = message || "Voice request completed successfully.";
  }

  if (state === "error") {
    callCoreText.textContent = "Error";
    recordingStatus.textContent = message || "Something went wrong.";
    result.textContent = message || "Something went wrong.";
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

    renderUserInfo(data);
  } catch (err) {
    console.error("User info error:", err.message);
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }
}

function renderUserInfo(data) {
  const userInfoDiv = document.getElementById("userInfo");
  const adminListDiv = document.getElementById("UserListForAdmin");

  if (data.type === "user") {
    userInfoDiv.innerHTML = `
      <p><strong>User:</strong> ${data.self.email}</p>
      <p><strong>API Limit:</strong> ${data.self.api_limit}</p>
      <p><strong>Used Calls:</strong> ${data.self.used_calls}</p>
      <p><strong>Remaining Calls:</strong> ${data.self.remaining_calls}</p>
    `;
    adminListDiv.innerHTML = "";
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
}

async function recordAudio(seconds = 5) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onerror = (event) => {
      reject(event.error || new Error("Recording failed"));
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      resolve(audioBlob);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, seconds * 1000);
  });
}

async function recordAndSend() {
  const result = document.getElementById("result");
  const transcriptEl = document.getElementById("transcript");
  const replyEl = document.getElementById("agentReply");
  const replyAudio = document.getElementById("replyAudio");
  const recordBtn = document.getElementById("recordBtn");
  const sessionIdInput = document.getElementById("sessionId");

  result.textContent = "";
  transcriptEl.textContent = "Waiting for transcript...";
  replyEl.textContent = "Waiting for reply...";
  recordBtn.disabled = true;
  recordBtn.textContent = "Recording...";

  try {
    setCallState("recording");

    const audioBlob = await recordAudio(5);

    setCallState("processing", "Uploading audio and generating AI response...");

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("sessionId", sessionIdInput.value.trim() || "conversation-1");

    const res = await fetch(`${API_BASE}/api/phone-agent/full`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned invalid JSON");
    }

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    transcriptEl.textContent = data.text || "No transcript received.";
    replyEl.textContent = data.reply || "No reply received.";
    result.textContent = "Conversation completed successfully.";
    setCallState("done", "AI reply received successfully.");

    if (data.audio) {
      replyAudio.src = `data:audio/mpeg;base64,${data.audio}`;
      replyAudio.play().catch(() => {
        console.log("Autoplay blocked by browser.");
      });
    }

    await loadUserInfo();
  } catch (err) {
    console.error("Voice agent error:", err);
    setCallState("error", err.message || "Something went wrong.");
  } finally {
    recordBtn.disabled = false;
    recordBtn.textContent = "Start Recording";
  }
}

setCallState("ready");
loadUserInfo();