const db = require("./connection");

async function createOrder(order) {
  const result = await db.execute({
    sql: `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, notes, status, reference, total_naira)
          VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    args: [order.customerName, order.customerEmail, order.customerPhone, order.customerAddress, order.notes, order.reference, order.totalNaira],
  });
  return Number(result.lastInsertRowid);
}

async function addOrderItems(orderId, items) {
  for (const item of items) {
    await db.execute({
      sql: `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price_naira)
            VALUES (?, ?, ?, ?, ?)`,
      args: [orderId, item.productId, item.productName, item.quantity, item.unitPriceNaira],
    });
  }
}

async function getByReference(reference) {
  return (await db.execute({ sql: "SELECT * FROM orders WHERE reference = ?", args: [reference] })).rows[0];
}

async function getById(id) {
  return (await db.execute({ sql: "SELECT * FROM orders WHERE id = ?", args: [id] })).rows[0];
}

async function getItemsForOrder(orderId) {
  return (await db.execute({ sql: "SELECT * FROM order_items WHERE order_id = ?", args: [orderId] })).rows;
}

async function getOrderWithItems(order) {
  if (!order) return null;
  return { ...order, items: await getItemsForOrder(order.id) };
}

async function updateStatus(id, status) {
  await db.execute({ sql: "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?", args: [status, id] });
}

async function listAll() {
  return (await db.execute("SELECT * FROM orders ORDER BY created_at DESC")).rows;
}

module.exports = {
  createOrder,
  addOrderItems,
  getByReference,
  getById,
  getItemsForOrder,
  getOrderWithItems,
  updateStatus,
  listAll,
};
