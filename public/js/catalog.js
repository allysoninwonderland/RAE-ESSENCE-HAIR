document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const alertContainer = document.getElementById("alertContainer");
  const categorySelect = document.getElementById("categoryFilter");

  let allProducts = [];

  try {
    allProducts = await fetchJson("/api/products");
    populateCategoryFilter(allProducts);
    renderGrid(allProducts);
  } catch (err) {
    showAlert(alertContainer, err.message, "error");
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      const category = categorySelect.value;
      const filtered = category ? allProducts.filter((p) => p.category === category) : allProducts;
      renderGrid(filtered);
    });
  }

  function populateCategoryFilter(products) {
    if (!categorySelect) return;
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    }
  }

  function renderGrid(products) {
    grid.innerHTML = "";

    if (products.length === 0) {
      const empty = document.createElement("p");
      empty.className = "cart__empty";
      empty.textContent = "No products available right now — check back soon.";
      grid.appendChild(empty);
      return;
    }

    for (const product of products) {
      grid.appendChild(buildProductCard(product));
    }
  }
});

function buildProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const link = document.createElement("a");
  link.className = "product-card__link";
  link.href = `product.html?id=${product.id}`;

  const img = document.createElement("img");
  img.className = "product-card__image";
  img.src = product.image_path || "assets/favicon.svg";
  img.alt = product.name;
  link.appendChild(img);

  const body = document.createElement("div");
  body.className = "product-card__body";

  const name = document.createElement("h2");
  name.className = "product-card__name";
  name.textContent = product.name;

  const notes = document.createElement("p");
  notes.className = "product-card__notes";
  notes.textContent = product.hair_type || "";

  const price = document.createElement("p");
  price.className = "product-card__price";
  price.textContent = formatNaira(product.price_naira);

  const stock = document.createElement("p");
  stock.className = "product-card__stock";
  if (product.stock_quantity <= 0) {
    stock.textContent = "Out of stock";
    stock.classList.add("is-low");
  } else if (product.stock_quantity <= 3) {
    stock.textContent = `Only ${product.stock_quantity} left`;
    stock.classList.add("is-low");
  } else {
    stock.textContent = "In stock";
  }

  body.append(name, notes, price, stock);
  link.appendChild(body);
  card.appendChild(link);

  return card;
}
