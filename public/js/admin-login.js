document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alertContainer = document.getElementById("alertContainer");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await fetchJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          username: document.getElementById("username").value.trim(),
          password: document.getElementById("password").value,
        }),
      });
      window.location.href = "dashboard.html";
    } catch (err) {
      showAlert(alertContainer, err.message, "error");
    }
  });
});
