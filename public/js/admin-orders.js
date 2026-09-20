let ordersLoaded = false;
const ORDER_STATUSES = ["pending", "confirmed", "paid", "fulfilled", "cancelled"];

document.addEventListener("admin:orders-tab-selected", async () => {
  if (ordersLoaded) return;
  ordersLoaded = true;
  await loadOrders();
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("closeOrderModalButton").addEventListener("click", () => {
    document.getElementById("orderModalOverlay").hidden = true;
  });
});

async function loadOrders() {
  const alertContainer = document.getElementById("alertContainer");
  try {
    const orders = await fetchJson("/api/admin/orders");
    const tbody = document.getElementById("ordersTableBody");
    tbody.innerHTML = "";
    for (const order of orders) {
      tbody.appendChild(buildOrderRow(order));
    }
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
}

function buildOrderRow(order) {
  const row = document.createElement("tr");

  const id = document.createElement("td");
  id.textContent = `#${order.id}`;

  const customer = document.createElement("td");
  customer.textContent = `${order.customer_name} (${order.customer_email})`;

  const total = document.createElement("td");
  total.textContent = formatNaira(order.total_naira);

  const status = document.createElement("td");
  const statusSelect = document.createElement("select");
  for (const value of ORDER_STATUSES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === order.status) option.selected = true;
    statusSelect.appendChild(option);
  }
  statusSelect.addEventListener("change", () => updateOrderStatus(order.id, statusSelect.value));
  status.appendChild(statusSelect);

  const date = document.createElement("td");
  date.textContent = new Date(order.created_at + "Z").toLocaleString();

  const actions = document.createElement("td");
  const viewBtn = document.createElement("button");
  viewBtn.type = "button";
  viewBtn.className = "btn btn--secondary btn--sm";
  viewBtn.textContent = "View";
  viewBtn.addEventListener("click", () => viewOrderDetail(order.id));
  actions.appendChild(viewBtn);

  row.append(id, customer, total, status, date, actions);
  return row;
}

async function updateOrderStatus(id, status) {
  const alertContainer = document.getElementById("alertContainer");
  try {
    await fetchJson(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
    await loadOrders();
  }
}

async function viewOrderDetail(id) {
  const content = document.getElementById("orderDetailContent");
  const overlay = document.getElementById("orderModalOverlay");
  content.innerHTML = "";
  overlay.hidden = false;

  try {
    const order = await fetchJson(`/api/admin/orders/${id}`);

    const info = document.createElement("p");
    info.className = "form__hint";
    info.textContent = `${order.customer_name} · ${order.customer_email} · ${order.customer_phone}`;

    const address = document.createElement("p");
    address.className = "form__hint";
    address.textContent = order.customer_address;

    const notes = document.createElement("p");
    notes.className = "form__hint";
    if (order.notes) notes.textContent = `Notes: ${order.notes}`;

    const itemsWrap = document.createElement("div");
    itemsWrap.style.marginTop = "1rem";
    for (const item of order.items) {
      const row = document.createElement("div");
      row.className = "order-detail__item";
      const label = document.createElement("span");
      label.textContent = `${item.product_name} × ${item.quantity}`;
      const amount = document.createElement("span");
      amount.textContent = formatNaira(item.unit_price_naira * item.quantity);
      row.append(label, amount);
      itemsWrap.appendChild(row);
    }

    const total = document.createElement("p");
    total.style.marginTop = "1rem";
    total.style.fontWeight = "700";
    total.textContent = `Total: ${formatNaira(order.total_naira)}`;

    content.append(info, address, notes, itemsWrap, total);
  } catch (err) {
    showAlert(content, err.message, "error");
  }
}
