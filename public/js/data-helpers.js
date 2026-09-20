// Shared helpers used across storefront and admin pages.

async function fetchJson(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

function formatNaira(naira) {
  return "₦" + Number(naira).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function showAlert(container, message, type) {
  if (!container) return;
  container.textContent = "";
  const div = document.createElement("div");
  div.className = `alert alert--${type}`;
  div.textContent = message;
  container.appendChild(div);
}
