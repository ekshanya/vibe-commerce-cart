const db = require('../db');

class CartItem {
  static add(productId, qty = 1) {
    return new Promise((resolve, reject) => {
      db.run('INSERT OR REPLACE INTO cart_items (productId, qty, userId) VALUES (?, ?, 1)', 
        [productId, qty], function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, productId, qty });
        });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM cart_items WHERE userId = 1', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM cart_items WHERE id = ? AND userId = 1', [id], function(err) {
        if (err) reject(err);
        resolve({ deleted: this.changes > 0 });
      });
    });
  }
}

module.exports = CartItem;