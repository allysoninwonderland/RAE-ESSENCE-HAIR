document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("serviceDetail");
  const alertContainer = document.getElementById("alertContainer");
  const bookingSection = document.getElementById("bookingSection");
  const id = getQueryParam("id");

  if (!id) {
    showAlert(alertContainer, "No service specified.", "error");
    return;
  }

  let service;
  try {
    service = await fetchJson(`/api/services/${encodeURIComponent(id)}`);
    document.title = `${service.name} — RAE ESSENCE LUXE`;
    container.appendChild(buildDetail(service));
    bookingSection.hidden = false;
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
    return;
  }

  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("bookingButton");
    const formAlert = document.getElementById("bookingAlert");

    button.disabled = true;
    button.textContent = "Submitting...";

    try {
      const { reference } = await fetchJson("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service.id,
          customer: {
            name: document.getElementById("bookingName").value.trim(),
            email: document.getElementById("bookingEmail").value.trim(),
            phone: document.getElementById("bookingPhone").value.trim(),
          },
          preferredDate: document.getElementById("bookingDate").value,
          notes: document.getElementById("bookingNotes").value.trim(),
        }),
      });

      window.location.href = `booking-confirmation.html?reference=${encodeURIComponent(reference)}`;
    } catch (err) {
      showAlert(formAlert, err.message, "error");
      button.disabled = false;
      button.textContent = "Request Booking";
    }
  });
});

function buildDetail(service) {
  const wrapper = document.createElement("div");
  wrapper.className = "service-detail";

  const img = document.createElement("img");
  img.className = "service-detail__image";
  img.src = service.image_path || "assets/favicon.svg";
  img.alt = service.name;

  const info = document.createElement("div");

  const name = document.createElement("h1");
  name.className = "service-detail__name";
  name.textContent = service.name;

  const price = document.createElement("p");
  price.className = "service-detail__price";
  price.textContent = `From ${formatNaira(service.price_naira)}`;

  const duration = document.createElement("p");
  duration.className = "service-detail__duration";
  duration.textContent = service.duration_estimate ? `Estimated time: ${service.duration_estimate}` : "";

  const description = document.createElement("p");
  description.className = "service-detail__description";
  description.textContent = service.description;

  info.append(name, price, duration, description);
  wrapper.append(img, info);
  return wrapper;
}
