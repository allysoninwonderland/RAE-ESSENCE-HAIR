document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("serviceGrid");
  if (!grid) return;

  const alertContainer = document.getElementById("alertContainer");

  try {
    const services = await fetchJson("/api/services");

    if (services.length === 0) {
      const empty = document.createElement("p");
      empty.className = "cart__empty";
      empty.textContent = "No services available right now — check back soon.";
      grid.appendChild(empty);
      return;
    }

    for (const service of services) {
      grid.appendChild(buildServiceCard(service));
    }
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
});

function buildServiceCard(service) {
  const card = document.createElement("article");
  card.className = "service-card";

  const link = document.createElement("a");
  link.className = "service-card__link";
  link.href = `service.html?id=${service.id}`;

  const img = document.createElement("img");
  img.className = "service-card__image";
  img.src = service.image_path || "assets/favicon.svg";
  img.alt = service.name;
  link.appendChild(img);

  const body = document.createElement("div");
  body.className = "service-card__body";

  const name = document.createElement("h2");
  name.className = "service-card__name";
  name.textContent = service.name;

  const description = document.createElement("p");
  description.className = "service-card__description";
  description.textContent = service.description;

  const meta = document.createElement("div");
  meta.className = "service-card__meta";

  const price = document.createElement("span");
  price.className = "service-card__price";
  price.textContent = `From ${formatNaira(service.price_naira)}`;

  const duration = document.createElement("span");
  duration.className = "service-card__duration";
  duration.textContent = service.duration_estimate || "";

  meta.append(price, duration);
  body.append(name, description, meta);
  link.appendChild(body);
  card.appendChild(link);

  return card;
}
