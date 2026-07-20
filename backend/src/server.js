const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { nanoid } = require("nanoid");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("quickchat.db");

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Production URL
const BASE_URL =
  process.env.BASE_URL ||
  "https://scoremark-quickchat-api.onrender.com";

// ==========================
// Create Database Table
// ==========================
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

// ==========================
// Home Route
// ==========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ScoreMark QuickChat API is running 🚀",
    version: "1.0.0",
  });
});

// ==========================
// Generate WhatsApp Link
// ==========================
app.post("/generate", (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      message: "Phone and message are required",
    });
  }

  const code = nanoid(6);

  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  db.prepare(`
    INSERT INTO links(code, phone, message, url, clicks)
    VALUES (?, ?, ?, ?, 0)
  `).run(code, phone, message, whatsappLink);

  res.json({
    success: true,
    shortUrl: `${BASE_URL}/${code}`,
  });
});

// ==========================
// Redirect Short Link
// ==========================
app.get("/:code", (req, res) => {
  const { code } = req.params;

  const link = db
    .prepare("SELECT * FROM links WHERE code = ?")
    .get(code);

  if (!link) {
    return res.status(404).send("Link not found");
  }

  db.prepare(
    "UPDATE links SET clicks = clicks + 1 WHERE code = ?"
  ).run(code);

  res.redirect(link.url);
});

// ==========================
// Analytics Dashboard
// ==========================
app.get("/analytics/all", (req, res) => {
  const links = db.prepare(`
    SELECT *
    FROM links
    ORDER BY id DESC
  `).all();

  res.json(links);
});

// ==========================
// Delete Link
// ==========================
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

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Base URL: ${BASE_URL}`);
});