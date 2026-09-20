document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("productDetail");
  const alertContainer = document.getElementById("alertContainer");
  const id = getQueryParam("id");

  if (!id) {
    showAlert(alertContainer, "No product specified.", "error");
    return;
  }

  try {
    const product = await fetchJson(`/api/products/${encodeURIComponent(id)}`);
    document.title = `${product.name} — RAE ESSENCE HAIR`;
    container.appendChild(buildDetail(product));
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }
});

function buildDetail(product) {
  const wrapper = document.createElement("div");
  wrapper.className = "product-detail";

  const img = document.createElement("img");
  img.className = "product-detail__image";
  img.src = product.image_path || "assets/favicon.svg";
  img.alt = product.name;

  const info = document.createElement("div");
  info.className = "product-detail__info";

  const category = document.createElement("p");
  category.className = "product-detail__category";
  category.textContent = product.category || "Hair";

  const name = document.createElement("h1");
  name.className = "product-detail__name";
  name.textContent = product.name;

  const price = document.createElement("p");
  price.className = "product-detail__price";
  price.textContent = formatNaira(product.price_naira);

  const description = document.createElement("p");
  description.className = "product-detail__description";
  description.textContent = product.description;

  const meta = document.createElement("dl");
  meta.className = "product-detail__meta";
  if (product.hair_type) {
    const dt = document.createElement("dt");
    dt.textContent = "Hair type";
    const dd = document.createElement("dd");
    dd.textContent = product.hair_type;
    meta.append(dt, dd);
  }
  if (product.length_inches) {
    const dt = document.createElement("dt");
    dt.textContent = "Length";
    const dd = document.createElement("dd");
    dd.textContent = `${product.length_inches}"`;
    meta.append(dt, dd);
  }

  info.append(category, name, price, description, meta);

  if (product.stock_quantity > 0) {
    const quantityRow = document.createElement("div");
    quantityRow.className = "product-detail__quantity";

    const label = document.createElement("label");
    label.setAttribute("for", "quantityInput");
    label.textContent = "Quantity";

    const input = document.createElement("input");
    input.type = "number";
    input.id = "quantityInput";
    input.min = "1";
    input.max = String(product.stock_quantity);
    input.value = "1";

    quantityRow.append(label, input);

    const actions = document.createElement("div");
    actions.className = "product-detail__actions";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "btn btn--primary";
    addButton.textContent = "Add to Cart";
    addButton.addEventListener("click", () => {
      const quantity = Math.max(1, Math.min(product.stock_quantity, Number(input.value) || 1));
      Cart.addToCart(product, quantity);
      addButton.textContent = "Added!";
      setTimeout(() => {
        addButton.textContent = "Add to Cart";
      }, 1200);
    });

    actions.appendChild(addButton);
    info.append(quantityRow, actions);
  } else {
    const outOfStock = document.createElement("p");
    outOfStock.className = "alert alert--error";
    outOfStock.textContent = "Out of stock";
    info.appendChild(outOfStock);
  }

  wrapper.append(img, info);
  return wrapper;
}
