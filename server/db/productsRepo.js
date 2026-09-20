const db = require("./connection");

async function getAllActive() {
  return (await db.execute("SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC")).rows;
}

async function getAllForAdmin() {
  return (await db.execute("SELECT * FROM products ORDER BY created_at DESC")).rows;
}

async function getById(id) {
  return (await db.execute({ sql: "SELECT * FROM products WHERE id = ?", args: [id] })).rows[0];
}

async function create(product) {
  const result = await db.execute({
    sql: `INSERT INTO products (name, description, price_naira, image_path, stock_quantity, category, hair_type, length_inches, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    args: [
      product.name,
      product.description,
      product.priceNaira,
      product.imagePath,
      product.stockQuantity,
      product.category,
      product.hairType,
      product.lengthInches,
    ],
  });
  return getById(Number(result.lastInsertRowid));
}

async function update(id, product) {
  await db.execute({
    sql: `UPDATE products
          SET name = ?, description = ?, price_naira = ?, image_path = ?,
              stock_quantity = ?, category = ?, hair_type = ?, length_inches = ?
          WHERE id = ?`,
    args: [
      product.name,
      product.description,
      product.priceNaira,
      product.imagePath,
      product.stockQuantity,
      product.category,
      product.hairType,
      product.lengthInches,
      id,
    ],
  });
  return getById(id);
}

async function countOrderItemsForProduct(id) {
  return (await db.execute({ sql: "SELECT COUNT(*) AS count FROM order_items WHERE product_id = ?", args: [id] })).rows[0].count;
}

async function softDelete(id) {
  await db.execute({ sql: "UPDATE products SET is_active = 0 WHERE id = ?", args: [id] });
}

async function hardDelete(id) {
  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
}

async function decrementStock(id, quantity) {
  await db.execute({ sql: "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?", args: [quantity, id] });
}

module.exports = {
  getAllActive,
  getAllForAdmin,
  getById,
  create,
  update,
  countOrderItemsForProduct,
  softDelete,
  hardDelete,
  decrementStock,
};
