const env = require("../config/env");

// Uses Resend's HTTP API directly (no SDK needed — Node has built-in fetch).
// Sends from Resend's shared testing address, which works without verifying
// a custom domain as long as the recipient is the Resend account's own email.
const FROM_ADDRESS = "RAE ESSENCE HAIR <onboarding@resend.dev>";

async function sendAdminNotification(subject, html) {
  if (!env.resendApiKey) {
    console.log(`[email] Skipped "${subject}" — RESEND_API_KEY not set`);
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: env.adminNotificationEmail,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[email] Failed to send "${subject}": ${response.status} ${body}`);
    }
  } catch (err) {
    console.error(`[email] Failed to send "${subject}":`, err.message);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatNaira(naira) {
  return "₦" + Number(naira).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

async function notifyNewOrder(order, items) {
  const rows = items
    .map((item) => `<tr><td>${escapeHtml(item.productName)}</td><td>${item.quantity}</td><td>${formatNaira(item.unitPriceNaira * item.quantity)}</td></tr>`)
    .join("");

  const html = `
    <h2>New order received</h2>
    <p><strong>Reference:</strong> ${escapeHtml(order.reference)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(order.customerName)} — ${escapeHtml(order.customerPhone)} — ${escapeHtml(order.customerEmail)}</p>
    <p><strong>Delivery address:</strong> ${escapeHtml(order.customerAddress)}</p>
    ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}
    <table cellpadding="6" style="border-collapse:collapse;border:1px solid #ddd;">
      <thead><tr><th align="left">Item</th><th align="left">Qty</th><th align="left">Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><strong>Total: ${formatNaira(order.totalNaira)}</strong></p>
    <p>Log into the admin dashboard to confirm and follow up with the customer.</p>
  `;

  await sendAdminNotification(`New Order (Ref: ${order.reference})`, html);
}

async function notifyNewBooking(booking) {
  const html = `
    <h2>New service booking request</h2>
    <p><strong>Reference:</strong> ${escapeHtml(booking.reference)}</p>
    <p><strong>Service:</strong> ${escapeHtml(booking.serviceName)}</p>
    <p><strong>Preferred date:</strong> ${escapeHtml(booking.preferredDate)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(booking.customerName)} — ${escapeHtml(booking.customerPhone)} — ${escapeHtml(booking.customerEmail)}</p>
    ${booking.notes ? `<p><strong>Notes:</strong> ${escapeHtml(booking.notes)}</p>` : ""}
    <p>Log into the admin dashboard to confirm the appointment with the customer.</p>
  `;

  await sendAdminNotification(`New Booking Request (Ref: ${booking.reference})`, html);
}

module.exports = { notifyNewOrder, notifyNewBooking };
