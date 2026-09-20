const express = require("express");
const crypto = require("node:crypto");
const productsRepo = require("../db/productsRepo");
const ordersRepo = require("../db/ordersRepo");
const emailService = require("../services/email");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No payment gateway is wired up yet: an order is recorded as "pending" and
// RAE ESSENCE HAIR follows up with the customer directly to arrange payment.
router.post("/", async (req, res) => {
  const { customer, items } = req.body || {};

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty or customer details are missing" });
  }

  const { name, email, phone, address, notes } = customer;
  if (!name || !email || !phone || !address) {
    return res.status(400).json({ error: "Please provide your name, email, phone, and delivery address" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address" });
  }

  const resolvedItems = [];
  let totalNaira = 0;

  for (const item of items) {
    const product = await productsRepo.getById(Number(item.productId));
    const quantity = Number(item.quantity);

    if (!product || !product.is_active) {
      return res.status(400).json({ error: `Product ${item.productId} is no longer available` });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: `Invalid quantity for ${product.name}` });
    }
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: `${product.name} only has ${product.stock_quantity} left in stock` });
    }

    resolvedItems.push({
      productId: product.id,
      productName: product.name,
      quantity,
      unitPriceNaira: product.price_naira,
    });
    totalNaira += product.price_naira * quantity;
  }

  const reference = `rae_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const orderId = await ordersRepo.createOrder({
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    customerAddress: address,
    notes: notes || null,
    reference,
    totalNaira,
  });
  await ordersRepo.addOrderItems(orderId, resolvedItems);

  for (const item of resolvedItems) {
    await productsRepo.decrementStock(item.productId, item.quantity);
  }

  // Awaited (not fire-and-forget) so it still completes on serverless hosts,
  // which can suspend the function as soon as the response is sent.
  await emailService.notifyNewOrder(
    { reference, customerName: name, customerEmail: email, customerPhone: phone, customerAddress: address, notes, totalNaira },
    resolvedItems
  );

  res.status(201).json({ reference });
});

module.exports = router;
