const express = require("express");
const servicesRepo = require("../db/servicesRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json(await servicesRepo.getAllActive());
});

router.get("/:id", async (req, res) => {
  const service = await servicesRepo.getById(Number(req.params.id));
  if (!service || !service.is_active) {
    return res.status(404).json({ error: "Service not found" });
  }
  res.json(service);
});

module.exports = router;
