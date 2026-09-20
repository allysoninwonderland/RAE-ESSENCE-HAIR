document.addEventListener("DOMContentLoaded", async () => {
  const alertContainer = document.getElementById("alertContainer");
  const container = document.getElementById("receiptContainer");
  const reference = getQueryParam("reference");

  if (!reference) {
    showAlert(alertContainer, "No booking reference was provided.", "error");
    return;
  }

  try {
    const booking = await fetchJson(`/api/bookings/${encodeURIComponent(reference)}`);
    container.appendChild(buildReceipt(booking));
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
});

function buildReceipt(booking) {
  const card = document.createElement("div");
  card.className = "receipt__card";

  const header = document.createElement("div");
  header.className = "receipt__header";

  const title = document.createElement("h1");
  title.textContent = "Booking Received";

  const badge = document.createElement("span");
  badge.className = `badge badge--${booking.status}`;
  badge.textContent = booking.status;

  header.append(title, badge);

  const bookingId = document.createElement("p");
  bookingId.className = "form__hint";
  bookingId.textContent = `Booking #${booking.id} · Reference ${booking.reference} · ${booking.customer_email}`;

  const details = document.createElement("div");
  details.style.marginTop = "1rem";

  const serviceRow = document.createElement("div");
  serviceRow.className = "receipt__item";
  const serviceLabel = document.createElement("span");
  serviceLabel.textContent = "Service";
  const serviceValue = document.createElement("span");
  serviceValue.textContent = booking.service_name;
  serviceRow.append(serviceLabel, serviceValue);

  const dateRow = document.createElement("div");
  dateRow.className = "receipt__item";
  const dateLabel = document.createElement("span");
  dateLabel.textContent = "Preferred date";
  const dateValue = document.createElement("span");
  dateValue.textContent = booking.preferred_date;
  dateRow.append(dateLabel, dateValue);

  details.append(serviceRow, dateRow);

  const note = document.createElement("p");
  note.className = "receipt__note";
  note.textContent = "Thank you for your booking request! RAE ESSENCE LUXE will contact you within 24 hours by phone or email to confirm your appointment and arrange payment.";

  card.append(header, bookingId, details, note);

  return card;
}
