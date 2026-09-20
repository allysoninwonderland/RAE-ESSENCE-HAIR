const db = require("./connection");

async function getAllActive() {
  return (await db.execute("SELECT * FROM services WHERE is_active = 1 ORDER BY created_at DESC")).rows;
}

async function getAllForAdmin() {
  return (await db.execute("SELECT * FROM services ORDER BY created_at DESC")).rows;
}

async function getById(id) {
  return (await db.execute({ sql: "SELECT * FROM services WHERE id = ?", args: [id] })).rows[0];
}

async function create(service) {
  const result = await db.execute({
    sql: `INSERT INTO services (name, description, price_naira, duration_estimate, image_path, is_active)
          VALUES (?, ?, ?, ?, ?, 1)`,
    args: [service.name, service.description, service.priceNaira, service.durationEstimate, service.imagePath],
  });
  return getById(Number(result.lastInsertRowid));
}

async function update(id, service) {
  await db.execute({
    sql: `UPDATE services
          SET name = ?, description = ?, price_naira = ?, duration_estimate = ?, image_path = ?
          WHERE id = ?`,
    args: [service.name, service.description, service.priceNaira, service.durationEstimate, service.imagePath, id],
  });
  return getById(id);
}

async function countBookingsForService(id) {
  return (await db.execute({ sql: "SELECT COUNT(*) AS count FROM bookings WHERE service_id = ?", args: [id] })).rows[0].count;
}

async function softDelete(id) {
  await db.execute({ sql: "UPDATE services SET is_active = 0 WHERE id = ?", args: [id] });
}

async function hardDelete(id) {
  await db.execute({ sql: "DELETE FROM services WHERE id = ?", args: [id] });
}

module.exports = {
  getAllActive,
  getAllForAdmin,
  getById,
  create,
  update,
  countBookingsForService,
  softDelete,
  hardDelete,
};
