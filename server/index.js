const path = require("node:path");
const express = require("express");
const session = require("express-session");
const env = require("./config/env");

const dbReady = require("./db/init");

const productsRoutes = require("./routes/products");
const servicesRoutes = require("./routes/services");
const checkoutRoutes = require("./routes/checkout");
const bookingsRoutes = require("./routes/bookings");
const ordersRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(express.json());
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

dbReady
  .then(() => {
    app.listen(env.port, () => {
      console.log(`RAE ESSENCE LUXE running at ${env.publicBaseUrl}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
