let productsLoaded = false;

document.addEventListener("admin:products-tab-selected", async () => {
  if (productsLoaded) return;
  productsLoaded = true;
  await loadProducts();
});

document.addEventListener("DOMContentLoaded", () => {
  setupProductModal();
});

async function loadProducts() {
  const alertContainer = document.getElementById("alertContainer");
  try {
    const products = await fetchJson("/api/admin/products");
    const tbody = document.getElementById("productsTableBody");
    tbody.innerHTML = "";
    for (const product of products) {
      tbody.appendChild(buildProductRow(product));
    }
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
}

function buildProductRow(product) {
  const row = document.createElement("tr");
  if (!product.is_active) row.classList.add("is-inactive");

  const name = document.createElement("td");
  name.textContent = product.name;

  const price = document.createElement("td");
  price.textContent = formatNaira(product.price_naira);

  const stock = document.createElement("td");
  stock.textContent = product.stock_quantity;

  const category = document.createElement("td");
  category.textContent = product.category || "—";

  const status = document.createElement("td");
  status.textContent = product.is_active ? "Active" : "Inactive";

  const actions = document.createElement("td");
  actions.className = "admin-table__actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn--secondary btn--sm";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => openProductModal(product));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn--danger btn--sm";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteProduct(product));

  actions.append(editBtn, deleteBtn);
  row.append(name, price, stock, category, status, actions);
  return row;
}

async function deleteProduct(product) {
  if (!confirm(`Delete "${product.name}"?`)) return;
  const alertContainer = document.getElementById("alertContainer");
  try {
    await fetchJson(`/api/admin/products/${product.id}`, { method: "DELETE" });
    await loadProducts();
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
}

function setupProductModal() {
  document.getElementById("addProductButton").addEventListener("click", () => openProductModal(null));
  document.getElementById("cancelProductButton").addEventListener("click", () => closeProductModal());

  document.getElementById("productForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const modalAlert = document.getElementById("productModalAlert");
    modalAlert.textContent = "";
    const id = document.getElementById("productId").value;

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const payload = {
      name: document.getElementById("productName").value.trim(),
      description: document.getElementById("productDescription").value.trim(),
      priceNaira: document.getElementById("productPrice").value,
      stockQuantity: document.getElementById("productStock").value,
      category: document.getElementById("productCategory").value.trim(),
      hairType: document.getElementById("productHairType").value.trim(),
      lengthInches: document.getElementById("productLength").value,
      imagePath: document.getElementById("productImage").value.trim(),
    };

    try {
      if (id) {
        await fetchJson(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchJson("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
      }
      closeProductModal();
      await loadProducts();
    } catch (err) {
      showAlert(modalAlert, err.message, "error");
    }
  });
}

function openProductModal(product) {
  document.getElementById("productModalTitle").textContent = product ? "Edit Product" : "Add Product";
  document.getElementById("productId").value = product ? product.id : "";
  document.getElementById("productName").value = product ? product.name : "";
  document.getElementById("productDescription").value = product ? product.description : "";
  document.getElementById("productPrice").value = product ? product.price_naira : "";
  document.getElementById("productStock").value = product ? product.stock_quantity : "";
  document.getElementById("productCategory").value = product ? product.category || "" : "";
  document.getElementById("productHairType").value = product ? product.hair_type || "" : "";
  document.getElementById("productLength").value = product ? product.length_inches || "" : "";
  document.getElementById("productImage").value = product ? product.image_path || "" : "";
  document.getElementById("productModalOverlay").hidden = false;
}

function closeProductModal() {
  document.getElementById("productModalOverlay").hidden = true;
  document.getElementById("productForm").reset();
}
