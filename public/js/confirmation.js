document.addEventListener("DOMContentLoaded", async () => {
  const alertContainer = document.getElementById("alertContainer");
  const container = document.getElementById("receiptContainer");
  const reference = getQueryParam("reference");

  if (!reference) {
    showAlert(alertContainer, "No order reference was provided.", "error");
    return;
  }

  try {
    const order = await fetchJson(`/api/orders/${encodeURIComponent(reference)}`);
    container.appendChild(buildReceipt(order));
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
});

function buildReceipt(order) {
  const card = document.createElement("div");
  card.className = "receipt__card";

  const header = document.createElement("div");
  header.className = "receipt__header";

  const title = document.createElement("h1");
  title.textContent = "Order Received";

  const badge = document.createElement("span");
  badge.className = `badge badge--${order.status}`;
  badge.textContent = order.status;

  header.append(title, badge);

  const orderId = document.createElement("p");
  orderId.className = "form__hint";
  orderId.textContent = `Order #${order.id} · Reference ${order.reference} · ${order.customer_email}`;

  const itemsList = document.createElement("div");
  for (const item of order.items) {
    const row = document.createElement("div");
    row.className = "receipt__item";
    const label = document.createElement("span");
    label.textContent = `${item.product_name} × ${item.quantity}`;
    const amount = document.createElement("span");
    amount.textContent = formatNaira(item.unit_price_naira * item.quantity);
    row.append(label, amount);
    itemsList.appendChild(row);
  }

  const total = document.createElement("div");
  total.className = "receipt__total";
  const totalLabel = document.createElement("span");
  totalLabel.textContent = "Total";
  const totalAmount = document.createElement("span");
  totalAmount.textContent = formatNaira(order.total_naira);
  total.append(totalLabel, totalAmount);

  const note = document.createElement("p");
  note.className = "receipt__note";
  note.textContent = "Thank you for your order! RAE ESSENCE LUXE will contact you within 24 hours by phone or email to confirm delivery details and arrange payment (bank transfer or pay on delivery).";

  card.append(header, orderId, itemsList, total, note);

  return card;
}
