const fs = require("node:fs");
const path = require("node:path");
const db = require("./connection");

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await db.executeMultiple(schema);

  const productCount = (await db.execute("SELECT COUNT(*) AS count FROM products")).rows[0].count;

  if (productCount === 0) {
    const placeholders = [
      ["Glueless HD Lace Wig", "A pre-plucked HD lace wig with a natural hairline that installs in minutes — no glue needed.", 145000, "assets/images/glueless-hd-lace-wig.svg", 6, "Lace Wig", "100% Human Hair — Straight", 20],
      ["Bone Straight Bundle Deal (3 Bundles)", "Silky bone-straight bundles that hold a bounce and blend seamlessly with relaxed hair.", 65000, "assets/images/bone-straight-bundle.svg", 15, "Bundle", "100% Human Hair — Bone Straight", 18],
      ["Deep Wave Closure Wig", "A bouncy deep-wave wig built on a 5x5 closure for a versatile, natural-looking part.", 120000, "assets/images/deep-wave-closure-wig.svg", 8, "Closure Wig", "100% Human Hair — Deep Wave", 22],
      ["Body Wave Frontal Wig", "A 13x4 frontal wig with soft body-wave texture, ideal for sleek styles or voluminous curls.", 165000, "assets/images/body-wave-frontal-wig.svg", 5, "Frontal Wig", "100% Human Hair — Body Wave", 24],
      ["Kinky Curly Clip-In Extensions", "Instant length and volume that matches natural 4A–4C textures, no commitment required.", 55000, "assets/images/kinky-curly-clip-in.svg", 20, "Clip-In Extension", "100% Human Hair — Kinky Curly", 16],
      ["Honey Blonde Highlight Wig", "A hand-highlighted honey blonde wig over a natural base for dimension without the upkeep.", 175000, "assets/images/honey-blonde-highlight-wig.svg", 4, "Colored Wig", "100% Human Hair — Straight, Highlighted", 20],
    ];

    for (const p of placeholders) {
      await db.execute({
        sql: `INSERT INTO products (name, description, price_naira, image_path, stock_quantity, category, hair_type, length_inches)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: p,
      });
    }

    console.log(`Seeded ${placeholders.length} placeholder products.`);
  }

  const serviceCount = (await db.execute("SELECT COUNT(*) AS count FROM services")).rows[0].count;

  if (serviceCount === 0) {
    const placeholders = [
      ["Wig Revamping", "Bring an old or matted wig back to life — deep wash, condition, detangle, and re-style.", 15000, "2–3 hours", "assets/images/service-revamping.svg"],
      ["Hair Installation", "Professional sew-in, quick weave, or frontal install for a seamless, natural finish.", 20000, "2–4 hours", "assets/images/service-installation.svg"],
      ["Hand-Tied Wigging", "A custom, hand-wefted wig built strand by strand for the most natural density and part.", 35000, "1–2 days", "assets/images/service-hand-wigging.svg"],
      ["Machine Wigging", "A machine-wefted custom wig build — faster turnaround with a durable, secure cap.", 25000, "4–6 hours", "assets/images/service-machine-wigging.svg"],
      ["Wig Styling", "Cut, color, curl, or straighten an existing wig to match the look you want.", 12000, "1–2 hours", "assets/images/service-styling.svg"],
      ["Glueless Styling", "A secure, adjustable glueless install and customization — no glue, no lace tint, no fuss.", 18000, "1–2 hours", "assets/images/service-glueless.svg"],
    ];

    for (const s of placeholders) {
      await db.execute({
        sql: `INSERT INTO services (name, description, price_naira, duration_estimate, image_path)
              VALUES (?, ?, ?, ?, ?)`,
        args: s,
      });
    }

    console.log(`Seeded ${placeholders.length} placeholder services.`);
  }

  console.log("Database ready.");
}

module.exports = init();
