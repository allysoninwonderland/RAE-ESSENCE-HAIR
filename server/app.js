const path = require("node:path");
const express = require("express");

const dbReady = require("./db/init");

const productsRoutes = require("./routes/products");
const servicesRoutes = require("./routes/services");
const checkoutRoutes = require("./routes/checkout");
const bookingsRoutes = require("./routes/bookings");
const ordersRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(express.json());

// Serverless functions can be invoked before the first request finishes
// setting up the database (schema + seed data), so every request waits on
// the same init promise rather than assuming it already ran.
app.use((req, res, next) => {
  dbReady.then(() => next()).catch(next);
});

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
