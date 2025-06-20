

async function registerUser() {
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!fullName || !email || !password || !confirmPassword) {
        errorMsg.textContent = "All fields are required.";
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match.";
        return;
    }
    const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
    });

    if (!res.ok) {
        const err = await res.json();
        errorMsg.textContent = err.message;
    } else {
        window.location.href = "users.html";
    }
}

// --------------- Login Form ---------------

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const loginError = document.getElementById("loginError");

  if (!email || !password) {
    loginError.textContent = "Email and password are required.";
    return;
  }

  fetch("http://localhost:5000/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(data => { throw new Error(data.message || "Login failed"); });
    }
    return res.json();
  })
  .then(() => {
    // Redirect directly after successful login
    window.location.href = "users.html";
  })
  .catch(err => {
    loginError.textContent = err.message;
  });
}

// ------------- User List -------------
const apiBase = 'http://localhost:5000/api/users';
const userTableBody = document.getElementById("userTableBody");
if (userTableBody) {
  fetch(apiBase)
    .then(res => res.json())
    .then(users => {
      users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.fullName}</td>
          <td>${user.email}</td>
          <td>
            <a href="edit-user.html?id=${user._id}" class="text-primary text-decoration-none">Edit</a> |
            <a href="#" onclick="showDeleteModal('${user._id}')" class="text-danger text-decoration-none">Delete</a>
          </td>
        `;
        userTableBody.appendChild(row);
      });
    });
}

// ---------- Delete User ----------
let userToDeleteId = null;

function showDeleteModal(id) {
  userToDeleteId = id;
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteModal"));
  modal.show();
}

const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", () => {
    if (userToDeleteId) {
      fetch(`${apiBase}/${userToDeleteId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          userToDeleteId = null;
          const modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
          modal.hide();
          window.location.reload();
        });
    }
  });
}
const editForm = document.getElementById("editForm");
const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

if (editForm && userId) {
  // Fetch user details from API
  fetch(`${apiBase}/${userId}`)
    .then(res => res.json())
    .then(user => {
      document.getElementById("editFullName").value = user.fullName;
      document.getElementById("editEmail").value = user.email;
    })
    .catch(err => {
      document.getElementById("editErrorMsg").textContent = "User not found.";
      editForm.style.display = "none";
    });

  // Submit updated user info
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const fullName = document.getElementById("editFullName").value.trim();
    const email = document.getElementById("editEmail").value.trim();

    if (!fullName || !email) {
      document.getElementById("editErrorMsg").textContent = "All fields are required.";
      return;
    }

    fetch(`${apiBase}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email })
    })
      .then(res => res.json())
      .then(() => {
        window.location.href = "users.html";
      })
      .catch(err => {
        document.getElementById("editErrorMsg").textContent = "Failed to update user.";
      });
  });
}