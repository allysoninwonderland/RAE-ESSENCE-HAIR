const express = require("express");
const ordersRepo = require("../db/ordersRepo");

const router = express.Router();

router.get("/:reference", async (req, res) => {
  const order = await ordersRepo.getByReference(req.params.reference);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(await ordersRepo.getOrderWithItems(order));
});

module.exports = router;
