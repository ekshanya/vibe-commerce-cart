const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // In-memory for demo; use file path for persistence

db.serialize(() => {
  db.run(`CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    userId INTEGER NOT NULL DEFAULT 1
  )`);
});

module.exports = db;