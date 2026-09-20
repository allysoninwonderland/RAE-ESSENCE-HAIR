document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav__toggle");
  const list = document.querySelector(".nav__list");

  if (toggle && list) {
    toggle.addEventListener("click", () => {
      list.classList.toggle("is-open");
    });
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link").forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("is-active");
    }
  });

  if (typeof Cart !== "undefined") {
    Cart.renderCartBadge();
  }
});
