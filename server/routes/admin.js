const express = require("express");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const adminSession = require("../lib/adminSession");
const productsRepo = require("../db/productsRepo");
const servicesRepo = require("../db/servicesRepo");
const ordersRepo = require("../db/ordersRepo");
const bookingsRepo = require("../db/bookingsRepo");
const requireAdminAuth = require("../middleware/requireAdminAuth");

const router = express.Router();

const ORDER_STATUSES = ["pending", "confirmed", "paid", "fulfilled", "cancelled"];
const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const validUsername = username === env.adminUsername;
  const validPassword = typeof password === "string" && bcrypt.compareSync(password, env.adminPasswordHash);

  if (!validUsername || !validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.setHeader("Set-Cookie", adminSession.createCookie());
  res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  res.setHeader("Set-Cookie", adminSession.clearCookie());
  res.json({ ok: true });
});

router.get("/session", (req, res) => {
  res.json({ isAdmin: adminSession.isValid(req) });
});

router.use(requireAdminAuth);

// ---- Products ----

router.get("/products", async (req, res) => {
  res.json(await productsRepo.getAllForAdmin());
});

function parseProductBody(body) {
  return {
    name: body.name,
    description: body.description,
    priceNaira: Math.round(Number(body.priceNaira)),
    imagePath: body.imagePath || null,
    stockQuantity: Number(body.stockQuantity) || 0,
    category: body.category || null,
    hairType: body.hairType || null,
    lengthInches: body.lengthInches ? Number(body.lengthInches) : null,
  };
}

router.post("/products", async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.description || !body.priceNaira) {
    return res.status(400).json({ error: "Name, description, and price are required" });
  }
  const product = await productsRepo.create(parseProductBody(body));
  res.status(201).json(product);
});

router.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await productsRepo.getById(id);
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }
  const body = req.body || {};
  if (!body.name || !body.description || !body.priceNaira) {
    return res.status(400).json({ error: "Name, description, and price are required" });
  }
  const product = await productsRepo.update(id, parseProductBody(body));
  res.json(product);
});

router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await productsRepo.getById(id);
  if (!existing) {
    return res.status(404).json({ error: "Product not found" });
  }
  if ((await productsRepo.countOrderItemsForProduct(id)) > 0) {
    await productsRepo.softDelete(id);
    return res.json({ ok: true, mode: "deactivated" });
  }
  await productsRepo.hardDelete(id);
  res.json({ ok: true, mode: "deleted" });
});

// ---- Services ----

router.get("/services", async (req, res) => {
  res.json(await servicesRepo.getAllForAdmin());
});

function parseServiceBody(body) {
  return {
    name: body.name,
    description: body.description,
    priceNaira: Math.round(Number(body.priceNaira)),
    durationEstimate: body.durationEstimate || null,
    imagePath: body.imagePath || null,
  };
}

router.post("/services", async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.description || !body.priceNaira) {
    return res.status(400).json({ error: "Name, description, and price are required" });
  }
  const service = await servicesRepo.create(parseServiceBody(body));
  res.status(201).json(service);
});

router.put("/services/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await servicesRepo.getById(id);
  if (!existing) {
    return res.status(404).json({ error: "Service not found" });
  }
  const body = req.body || {};
  if (!body.name || !body.description || !body.priceNaira) {
    return res.status(400).json({ error: "Name, description, and price are required" });
  }
  const service = await servicesRepo.update(id, parseServiceBody(body));
  res.json(service);
});

router.delete("/services/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await servicesRepo.getById(id);
  if (!existing) {
    return res.status(404).json({ error: "Service not found" });
  }
  if ((await servicesRepo.countBookingsForService(id)) > 0) {
    await servicesRepo.softDelete(id);
    return res.json({ ok: true, mode: "deactivated" });
  }
  await servicesRepo.hardDelete(id);
  res.json({ ok: true, mode: "deleted" });
});

// ---- Orders ----

router.get("/orders", async (req, res) => {
  res.json(await ordersRepo.listAll());
});

router.get("/orders/:id", async (req, res) => {
  const order = await ordersRepo.getById(Number(req.params.id));
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(await ordersRepo.getOrderWithItems(order));
});

router.patch("/orders/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const order = await ordersRepo.getById(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
  }
  await ordersRepo.updateStatus(id, status);
  res.json(await ordersRepo.getOrderWithItems(await ordersRepo.getById(id)));
});

// ---- Bookings ----

router.get("/bookings", async (req, res) => {
  res.json(await bookingsRepo.listAll());
});

router.get("/bookings/:id", async (req, res) => {
  const booking = await bookingsRepo.getById(Number(req.params.id));
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  res.json(booking);
});

router.patch("/bookings/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const booking = await bookingsRepo.getById(id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  const { status } = req.body || {};
  if (!BOOKING_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${BOOKING_STATUSES.join(", ")}` });
  }
  await bookingsRepo.updateStatus(id, status);
  res.json(await bookingsRepo.getById(id));
});

module.exports = router;
