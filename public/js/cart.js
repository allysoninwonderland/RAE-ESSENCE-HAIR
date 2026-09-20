// Client-side cart, stored in localStorage. The server never reads this directly -
// it's only sent (as productId + quantity) when the customer checks out.

const CART_KEY = "raeEssenceLuxeCart";

const Cart = {
  getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    Cart.renderCartBadge();
  },

  addToCart(product, quantity) {
    const cart = Cart.getCart();
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        unitPriceNaira: product.price_naira,
        quantity,
        imagePath: product.image_path,
      });
    }
    Cart.saveCart(cart);
  },

  updateQuantity(productId, quantity) {
    const cart = Cart.getCart();
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;
    if (quantity < 1) {
      Cart.removeFromCart(productId);
      return;
    }
    item.quantity = quantity;
    Cart.saveCart(cart);
  },

  removeFromCart(productId) {
    const cart = Cart.getCart().filter((i) => i.productId !== productId);
    Cart.saveCart(cart);
  },

  clearCart() {
    localStorage.removeItem(CART_KEY);
    Cart.renderCartBadge();
  },

  getCartTotalNaira() {
    return Cart.getCart().reduce((sum, item) => sum + item.unitPriceNaira * item.quantity, 0);
  },

  getCartCount() {
    return Cart.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  renderCartBadge() {
    const badge = document.querySelector(".nav__cart-count");
    if (!badge) return;
    const count = Cart.getCartCount();
    badge.textContent = String(count);
    badge.hidden = count === 0;
  },
};
