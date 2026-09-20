let servicesLoaded = false;

document.addEventListener("admin:services-tab-selected", async () => {
  if (servicesLoaded) return;
  servicesLoaded = true;
  await loadServices();
});

document.addEventListener("DOMContentLoaded", () => {
  setupServiceModal();
});

async function loadServices() {
  const alertContainer = document.getElementById("alertContainer");
  try {
    const services = await fetchJson("/api/admin/services");
    const tbody = document.getElementById("servicesTableBody");
    tbody.innerHTML = "";
    for (const service of services) {
      tbody.appendChild(buildServiceRow(service));
    }
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
}

function buildServiceRow(service) {
  const row = document.createElement("tr");
  if (!service.is_active) row.classList.add("is-inactive");

  const name = document.createElement("td");
  name.textContent = service.name;

  const price = document.createElement("td");
  price.textContent = formatNaira(service.price_naira);

  const duration = document.createElement("td");
  duration.textContent = service.duration_estimate || "—";

  const status = document.createElement("td");
  status.textContent = service.is_active ? "Active" : "Inactive";

  const actions = document.createElement("td");
  actions.className = "admin-table__actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn--secondary btn--sm";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => openServiceModal(service));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn--danger btn--sm";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteService(service));

  actions.append(editBtn, deleteBtn);
  row.append(name, price, duration, status, actions);
  return row;
}

async function deleteService(service) {
  if (!confirm(`Delete "${service.name}"?`)) return;
  const alertContainer = document.getElementById("alertContainer");
  try {
    await fetchJson(`/api/admin/services/${service.id}`, { method: "DELETE" });
    await loadServices();
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
}

function setupServiceModal() {
  document.getElementById("addServiceButton").addEventListener("click", () => openServiceModal(null));
  document.getElementById("cancelServiceButton").addEventListener("click", () => closeServiceModal());

  document.getElementById("serviceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const modalAlert = document.getElementById("serviceModalAlert");
    modalAlert.textContent = "";
    const id = document.getElementById("serviceId").value;

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const payload = {
      name: document.getElementById("serviceName").value.trim(),
      description: document.getElementById("serviceDescription").value.trim(),
      priceNaira: document.getElementById("servicePrice").value,
      durationEstimate: document.getElementById("serviceDuration").value.trim(),
      imagePath: document.getElementById("serviceImage").value.trim(),
    };

    try {
      if (id) {
        await fetchJson(`/api/admin/services/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchJson("/api/admin/services", { method: "POST", body: JSON.stringify(payload) });
      }
      closeServiceModal();
      await loadServices();
    } catch (err) {
      showAlert(modalAlert, err.message, "error");
    }
  });
}

function openServiceModal(service) {
  document.getElementById("serviceModalTitle").textContent = service ? "Edit Service" : "Add Service";
  document.getElementById("serviceId").value = service ? service.id : "";
  document.getElementById("serviceName").value = service ? service.name : "";
  document.getElementById("serviceDescription").value = service ? service.description : "";
  document.getElementById("servicePrice").value = service ? service.price_naira : "";
  document.getElementById("serviceDuration").value = service ? service.duration_estimate || "" : "";
  document.getElementById("serviceImage").value = service ? service.image_path || "" : "";
  document.getElementById("serviceModalOverlay").hidden = false;
}

function closeServiceModal() {
  document.getElementById("serviceModalOverlay").hidden = true;
  document.getElementById("serviceForm").reset();
}
