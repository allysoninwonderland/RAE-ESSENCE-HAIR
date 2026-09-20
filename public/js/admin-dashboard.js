document.addEventListener("DOMContentLoaded", async () => {
  try {
    const session = await fetchJson("/api/admin/session");
    if (!session.isAdmin) {
      window.location.href = "login.html";
      return;
    }
  } catch {
    window.location.href = "login.html";
    return;
  }

  setupTabs();
  setupLogout();
  document.dispatchEvent(new CustomEvent("admin:products-tab-selected"));
});

function setupTabs() {
  const buttons = document.querySelectorAll(".admin-tabs__button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");

      document.querySelectorAll("[data-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.panel !== button.dataset.tab;
      });

      document.dispatchEvent(new CustomEvent(`admin:${button.dataset.tab}-tab-selected`));
    });
  });
}

function setupLogout() {
  document.getElementById("logoutButton").addEventListener("click", async () => {
    await fetchJson("/api/admin/logout", { method: "POST" });
    window.location.href = "login.html";
  });
}
