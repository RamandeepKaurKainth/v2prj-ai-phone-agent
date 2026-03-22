
let token = localStorage.getItem("token"); // assuming JWT stored in localStorage

// Fetch current user info and remaining API calls
async function loadUserInfo() {
    if (!token) {
        document.getElementById("userInfo").innerText = "Not logged in";
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/v1/user/me", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            document.getElementById("userInfo").innerText = "Error fetching user info";
            return;
        }

        const fullResponse = await res.json();
        //console.log(fullResponse);
        const type = fullResponse.type;
        const self = fullResponse.self;
        document.getElementById("userInfo").innerText =
            `${self.email}(${type}) | Remaining API calls: ${self.remaining_calls}`;
        if (type == "admin") {
            const users = fullResponse.users;
            const container = document.getElementById("UserListForAdmin");
            // clear container
            container.innerHTML = "";

            // create table
            const table = document.createElement("table");
            table.border = "1";

            // create header
            const thead = document.createElement("thead");
            thead.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Email</th>
      <th>Role</th>
      <th>API Limit</th>
      <th>Used</th>
      <th>Remaining</th>
    </tr>
  `;
            table.appendChild(thead);

            // create body
            const tbody = document.createElement("tbody");

            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.role_name}</td>
      <td>${user.api_limit}</td>
      <td>${user.used_calls}</td>
      <td>${user.remaining_calls}</td>
    `;
                tbody.appendChild(row);
            });

            table.appendChild(tbody);

            // append table to container
            container.appendChild(table);
        }
    } catch (err) {
        console.error(err);
        document.getElementById("userInfo").innerText = "Error fetching user info";
    }
}

async function sendSMS() {
    const phone = document.getElementById("phone").value;
    const message = document.getElementById("message").value;

    if (!token) {
        document.getElementById("result").innerText = "Please log in first.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/send-sms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ phone, message })
        });

        const data = await response.json();

        if (response.status === 200) {
            document.getElementById("result").innerText = data.status;

            // Optionally refresh remaining calls
            loadUserInfo();
        } else {
            document.getElementById("result").innerText = data.error || "Error sending SMS";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("result").innerText = "Network error";
    }
}

loadUserInfo();