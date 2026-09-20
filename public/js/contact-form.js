document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showAlert(document.getElementById("formStatus"), "Thanks for reaching out! (Demo form — no message was actually sent.)", "success");
    form.reset();
  });
});
