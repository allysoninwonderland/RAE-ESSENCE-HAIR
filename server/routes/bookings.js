const express = require("express");
const crypto = require("node:crypto");
const servicesRepo = require("../db/servicesRepo");
const bookingsRepo = require("../db/bookingsRepo");
const emailService = require("../services/email");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req, res) => {
  const { serviceId, customer, preferredDate, notes } = req.body || {};

  const service = await servicesRepo.getById(Number(serviceId));
  if (!service || !service.is_active) {
    return res.status(400).json({ error: "That service is no longer available" });
  }

  if (!customer) {
    return res.status(400).json({ error: "Your contact details are required" });
  }
  const { name, email, phone } = customer;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Please provide your name, email, and phone number" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address" });
  }
  if (!preferredDate) {
    return res.status(400).json({ error: "Please choose a preferred date" });
  }

  const reference = `rae_bk_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const bookingId = await bookingsRepo.createBooking({
    serviceId: service.id,
    serviceName: service.name,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    preferredDate,
    notes: notes || null,
    reference,
  });

  await emailService.notifyNewBooking({
    reference,
    serviceName: service.name,
    preferredDate,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    notes,
  });

  res.status(201).json({ reference, bookingId });
});

router.get("/:reference", async (req, res) => {
  const booking = await bookingsRepo.getByReference(req.params.reference);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  res.json(booking);
});

module.exports = router;
