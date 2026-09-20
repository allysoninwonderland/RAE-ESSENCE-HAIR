document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.getElementById("featuredProducts");
  const serviceGrid = document.getElementById("featuredServices");
  const alertContainer = document.getElementById("alertContainer");

  try {
    const products = await fetchJson("/api/products");
    productGrid.innerHTML = "";
    for (const product of products.slice(0, 3)) {
      productGrid.appendChild(buildProductCard(product));
    }
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }

  try {
    const services = await fetchJson("/api/services");
    serviceGrid.innerHTML = "";
    for (const service of services.slice(0, 3)) {
      serviceGrid.appendChild(buildServiceCard(service));
    }
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
});
