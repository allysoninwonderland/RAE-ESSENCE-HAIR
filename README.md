# RAE ESSENCE HAIR

A full-stack storefront and booking site for a luxury wig, hair, and hair-services brand.

## 💡 Idea

RAE ESSENCE HAIR sells wigs, bundles, and hair extensions, and also offers hands-on services (wig revamping, hair installation, hand-tied and machine wigging, wig styling, and glueless styling). Customers browse the shop and add wigs/hair to a cart, or browse services and request a booking. There's no online payment gateway yet — every order or booking is recorded as "pending" and the owner follows up directly with the customer to confirm details and arrange payment (bank transfer or pay on delivery).

## ✨ Features

- Product catalog (wigs, bundles, extensions) with category filtering and detail pages
- Client-side shopping cart (persists in the browser via `localStorage`)
- Checkout that collects delivery details and creates a pending order — no payment gateway required
- Service catalog (revamping, installation, hand/machine wigging, styling, glueless styling) with booking requests
- Order and booking confirmation pages with a reference number
- Admin dashboard: manage products and services, view orders and bookings, update their status
- About, Contact, and FAQ pages

## 🛠 Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite, via Node's built-in `node:sqlite` module (no native build step, no external service)
- **Frontend**: Plain HTML, CSS, and JavaScript — no frameworks, no bundler
- **Auth**: Single admin account (`express-session` + `bcryptjs`), no user accounts for customers
- **Payments**: none yet — orders/bookings are confirmed and paid for manually (see Status below)

## 🚀 Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values:
   ```
   SESSION_SECRET=<any long random string>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=<see below>
   ```
3. Generate a password hash for your admin login:
   ```
   node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
   ```
   Paste the output into `ADMIN_PASSWORD_HASH` in `.env`.
4. Start the server:
   ```
   npm start
   ```
5. Visit `http://localhost:3000` for the storefront, or `http://localhost:3000/admin/login.html` for the admin dashboard.

The database file (`data/rae-essence-hair.sqlite`) is created automatically on first run and seeded with 6 placeholder products and 6 placeholder services.

## 🔐 Admin Access

There's a single admin account, configured entirely through environment variables (`ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`) — there's no sign-up flow or user database for admins.

## 📦 Project Structure

```
server/     Express app, routes, database access
public/     Static frontend (HTML/CSS/JS) served directly by Express
data/       SQLite database file (created at runtime, gitignored)
```

## 📌 Status

- ✅ Shop, cart, service bookings, order/booking confirmation, admin dashboard all working
- ✅ Server-side stock validation on checkout
- 🔜 Real product photos and copy (currently placeholder wigs/services + generated SVG art)
- 🔜 Image upload in the admin panel (currently image is a pasted path/URL)
- 🔜 Real contact details on the Contact page (currently placeholders — edit `public/contact.html`)
- 🔜 Connect a real payment gateway (e.g. Paystack) once ready to accept online payment
- 🔜 Deploy to a host (Render, Railway, etc.) once ready to go live
