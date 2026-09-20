const db = require("./connection");

async function createBooking(booking) {
  const result = await db.execute({
    sql: `INSERT INTO bookings (service_id, service_name, customer_name, customer_email, customer_phone, preferred_date, notes, status, reference)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    args: [
      booking.serviceId,
      booking.serviceName,
      booking.customerName,
      booking.customerEmail,
      booking.customerPhone,
      booking.preferredDate,
      booking.notes,
      booking.reference,
    ],
  });
  return Number(result.lastInsertRowid);
}

async function getByReference(reference) {
  return (await db.execute({ sql: "SELECT * FROM bookings WHERE reference = ?", args: [reference] })).rows[0];
}

async function getById(id) {
  return (await db.execute({ sql: "SELECT * FROM bookings WHERE id = ?", args: [id] })).rows[0];
}

async function updateStatus(id, status) {
  await db.execute({ sql: "UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?", args: [status, id] });
}

async function listAll() {
  return (await db.execute("SELECT * FROM bookings ORDER BY created_at DESC")).rows;
}

module.exports = {
  createBooking,
  getByReference,
  getById,
  updateStatus,
  listAll,
};
