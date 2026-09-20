document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
});

function renderCartPage() {
  const itemsContainer = document.getElementById("cartItems");
  const checkoutSection = document.getElementById("checkoutSection");
  const cart = Cart.getCart();

  itemsContainer.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart__empty";
    empty.textContent = "Your cart is empty. Browse the shop to add some wigs or hair.";
    itemsContainer.appendChild(empty);
    checkoutSection.hidden = true;
    return;
  }

  for (const item of cart) {
    itemsContainer.appendChild(buildCartItemRow(item));
  }

  document.getElementById("cartTotal").textContent = formatNaira(Cart.getCartTotalNaira());
  checkoutSection.hidden = false;
}

function buildCartItemRow(item) {
  const row = document.createElement("div");
  row.className = "cart-item";

  const img = document.createElement("img");
  img.className = "cart-item__image";
  img.src = item.imagePath || "assets/favicon.svg";
  img.alt = item.name;

  const info = document.createElement("div");
  const name = document.createElement("p");
  name.className = "cart-item__name";
  name.textContent = item.name;
  const price = document.createElement("p");
  price.className = "cart-item__price";
  price.textContent = formatNaira(item.unitPriceNaira);
  info.append(name, price);

  const quantityWrap = document.createElement("div");
  quantityWrap.className = "cart-item__quantity";
  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.value = String(item.quantity);
  quantityInput.addEventListener("change", () => {
    Cart.updateQuantity(item.productId, Math.max(1, Number(quantityInput.value) || 1));
    renderCartPage();
  });
  quantityWrap.appendChild(quantityInput);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn btn--danger btn--sm";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    Cart.removeFromCart(item.productId);
    renderCartPage();
  });

  row.append(img, info, quantityWrap, removeButton);
  return row;
}
