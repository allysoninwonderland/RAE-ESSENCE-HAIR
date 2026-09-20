const express = require("express");
const productsRepo = require("../db/productsRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await productsRepo.getAllActive();
  const filtered = req.query.category
    ? products.filter((p) => p.category === req.query.category)
    : products;
  res.json(filtered);
});

router.get("/:id", async (req, res) => {
  const product = await productsRepo.getById(Number(req.params.id));
  if (!product || !product.is_active) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

module.exports = router;
