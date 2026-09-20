let bookingsLoaded = false;
const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

document.addEventListener("admin:bookings-tab-selected", async () => {
  if (bookingsLoaded) return;
  bookingsLoaded = true;
  await loadBookings();
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("closeBookingModalButton").addEventListener("click", () => {
    document.getElementById("bookingModalOverlay").hidden = true;
  });
});

async function loadBookings() {
  const alertContainer = document.getElementById("alertContainer");
  try {
    const bookings = await fetchJson("/api/admin/bookings");
    const tbody = document.getElementById("bookingsTableBody");
    tbody.innerHTML = "";
    for (const booking of bookings) {
      tbody.appendChild(buildBookingRow(booking));
    }
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
}

function buildBookingRow(booking) {
  const row = document.createElement("tr");

  const id = document.createElement("td");
  id.textContent = `#${booking.id}`;

  const customer = document.createElement("td");
  customer.textContent = `${booking.customer_name} (${booking.customer_email})`;

  const service = document.createElement("td");
  service.textContent = booking.service_name;

  const date = document.createElement("td");
  date.textContent = booking.preferred_date;

  const status = document.createElement("td");
  const statusSelect = document.createElement("select");
  for (const value of BOOKING_STATUSES) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === booking.status) option.selected = true;
    statusSelect.appendChild(option);
  }
  statusSelect.addEventListener("change", () => updateBookingStatus(booking.id, statusSelect.value));
  status.appendChild(statusSelect);

  const actions = document.createElement("td");
  const viewBtn = document.createElement("button");
  viewBtn.type = "button";
  viewBtn.className = "btn btn--secondary btn--sm";
  viewBtn.textContent = "View";
  viewBtn.addEventListener("click", () => viewBookingDetail(booking.id));
  actions.appendChild(viewBtn);

  row.append(id, customer, service, date, status, actions);
  return row;
}

async function updateBookingStatus(id, status) {
  const alertContainer = document.getElementById("alertContainer");
  try {
    await fetchJson(`/api/admin/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
    await loadBookings();
  }
}

async function viewBookingDetail(id) {
  const content = document.getElementById("bookingDetailContent");
  const overlay = document.getElementById("bookingModalOverlay");
  content.innerHTML = "";
  overlay.hidden = false;

  try {
    const booking = await fetchJson(`/api/admin/bookings/${id}`);

    const info = document.createElement("p");
    info.className = "form__hint";
    info.textContent = `${booking.customer_name} · ${booking.customer_email} · ${booking.customer_phone}`;

    const service = document.createElement("p");
    service.style.marginTop = "1rem";
    service.textContent = `Service: ${booking.service_name}`;

    const date = document.createElement("p");
    date.textContent = `Preferred date: ${booking.preferred_date}`;

    const notes = document.createElement("p");
    if (booking.notes) notes.textContent = `Notes: ${booking.notes}`;

    content.append(info, service, date, notes);
  } catch (err) {
    showAlert(content, err.message, "error");
  }
}
