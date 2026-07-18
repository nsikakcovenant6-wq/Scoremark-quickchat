const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { nanoid } = require("nanoid");
const Database = require("better-sqlite3");


const app = express();
const db = new Database("quickchat.db");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ScoreMark QuickChat API is running 🚀",
    version: "1.0.0",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  app.get("/analytics", (req, res) => {
  const rows = db.prepare(`
    SELECT
      code,
      phone,
      message,
      clicks,
      created_at
    FROM links
    ORDER BY id DESC
  `).all();

  res.json(rows);
});
  console.log(`Server running on http://localhost:${PORT}`);
});
app.post("/generate", (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      error: "Phone and message are required",
    });
  }

  const code = nanoid(6);

  const whatsappLink =
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  db.prepare(`
    INSERT INTO links(code, phone, message, url, clicks)
    VALUES (?, ?, ?, ?, 0)
  `).run(code, phone, message, whatsappLink);

  res.json({
    shortUrl: `http://localhost:5000/${code}`,
  });
});
db.prepare(`
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    phone TEXT,
    message TEXT,
    url TEXT,
    clicks INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();
app.get("/:code", (req, res) => {
  const { code } = req.params;

  const link = db
    .prepare("SELECT * FROM links WHERE code = ?")
    .get(code);

  if (!link) {
    return res.status(404).json({
      error: "Link not found",
    });
  }

  db.prepare(
    "UPDATE links SET clicks = clicks + 1 WHERE code = ?"
  ).run(code);

  res.redirect(link.url);
});
app.get("/analytics/all", (req, res) => {
  const links = db.prepare("SELECT * FROM links").all();
  res.json(links);
});
app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  const result = db
    .prepare("DELETE FROM links WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      success: false,
      message: "Link not found",
    });
  }

  res.json({
    success: true,
    message: "Link deleted successfully",
  });
});
app.get("/:code", (req, res) => {
  const { code } = req.params;

  const link = db.prepare(
    "SELECT * FROM links WHERE code = ?"
  ).get(code);

  if (!link) {
    return res.status(404).send("Link not found");
  }

  db.prepare(
    "UPDATE links SET clicks = clicks + 1 WHERE code = ?"
  ).run(code);

  res.redirect(link.url);
});
app.delete("/delete/:code", (req, res) => {
  const { code } = req.params;

  db.prepare("DELETE FROM links WHERE code = ?").run(code);

  res.json({
    success: true,
  });
});