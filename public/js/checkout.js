document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const cart = Cart.getCart();
    const alertContainer = document.getElementById("alertContainer");
    const button = document.getElementById("checkoutButton");

    if (cart.length === 0) {
      showAlert(alertContainer, "Your cart is empty.", "error");
      return;
    }

    button.disabled = true;
    button.textContent = "Placing order...";

    try {
      const { reference } = await fetchJson("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          customer: {
            name: document.getElementById("customerName").value.trim(),
            email: document.getElementById("customerEmail").value.trim(),
            phone: document.getElementById("customerPhone").value.trim(),
            address: document.getElementById("customerAddress").value.trim(),
            notes: document.getElementById("customerNotes").value.trim(),
          },
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });

      Cart.clearCart();
      window.location.href = `order-confirmation.html?reference=${encodeURIComponent(reference)}`;
    } catch (err) {
      showAlert(alertContainer, err.message, "error");
      button.disabled = false;
      button.textContent = "Place Order";
    }
  });
});
