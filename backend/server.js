const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const CartItem = require('./models/CartItem');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let cachedProducts = null; // Cache for Fake Store API

// GET /api/products - Fetch 5 mock items from Fake Store API
app.get('/api/products', async (req, res) => {
  try {
    if (!cachedProducts) {
      const response = await axios.get('https://fakestoreapi.com/products', { params: { limit: 5 } });
      cachedProducts = response.data.map(p => ({
  id: p.id,
  name: p.title,
  price: p.price,
  image: p.image
}));
    }
    res.json(cachedProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/cart - Add {productId, qty}
app.post('/api/cart', (req, res) => {
  const { productId, qty } = req.body;
  if (!productId) return res.status(400).json({ error: 'Product ID is required' });

  const quantityToAdd = qty || 1;

  // Check if this product is already in the cart
  db.get('SELECT * FROM cart_items WHERE productId = ?', [productId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (row) {
      // If already in cart, just update the quantity
      const newQty = row.qty + quantityToAdd;
      db.run('UPDATE cart_items SET qty = ? WHERE productId = ?', [newQty, productId], (err2) => {
        if (err2) return res.status(500).json({ error: 'Failed to update quantity' });
        res.json({ message: 'Quantity updated', productId, newQty });
      });
    } else {
      // If not in cart, add as new
      db.run('INSERT INTO cart_items (productId, qty) VALUES (?, ?)', [productId, quantityToAdd], (err3) => {
        if (err3) return res.status(500).json({ error: 'Failed to add to cart' });
        res.json({ message: 'Added to cart', productId });
      });
    }
  });
});



// DELETE /api/cart/:id - decrease qty or delete by row id
app.delete('/api/cart/:id', (req, res) => {
  const id = Number(req.params.id); // ensure numeric

  if (!id) return res.status(400).json({ error: 'Invalid id' });

  // Look up the cart row by its primary key (id)
  db.get('SELECT * FROM cart_items WHERE id = ? AND userId = 1', [id], (err, row) => {
    if (err) {
      console.error('DB get error (delete):', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (row.qty > 1) {
      const newQty = row.qty - 1;
      db.run('UPDATE cart_items SET qty = ? WHERE id = ? AND userId = 1', [newQty, id], function(updateErr) {
        if (updateErr) {
          console.error('DB update error (decrement):', updateErr);
          return res.status(500).json({ error: 'Failed to update quantity' });
        }
        return res.json({ message: 'Quantity decreased', id, newQty });
      });
    } else {
      db.run('DELETE FROM cart_items WHERE id = ? AND userId = 1', [id], function(deleteErr) {
        if (deleteErr) {
          console.error('DB delete error:', deleteErr);
          return res.status(500).json({ error: 'Failed to delete item' });
        }
        return res.json({ message: 'Item removed completely', id });
      });
    }
  });
});


// GET /api/cart - Get cart + total (fetches products for prices)
app.get('/api/cart', async (req, res) => {
  try {
    const cartItems = await CartItem.getAll();
    if (cartItems.length === 0) return res.json({ items: [], total: 0 });

    // Fetch products for pricing
    const productResponse = await axios.get('https://fakestoreapi.com/products');
    const productsMap = {};
    productResponse.data.forEach(p => {
      productsMap[p.id] = p.price;
    });

    const itemsWithPrice = cartItems.map(item => ({
      ...item,
      price: productsMap[item.productId] || 0
    }));

    const total = itemsWithPrice.reduce((sum, item) => sum + (item.price * item.qty), 0);

    res.json({ items: itemsWithPrice, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cart - Clear all cart items
app.delete('/api/cart', async (req, res) => {
  try {
    db.run('DELETE FROM cart_items WHERE userId = 1', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Cart cleared successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST /api/checkout - {cartItems} → mock receipt
app.post('/api/checkout', (req, res) => {
  try {
    const { cartItems, name, email } = req.body;
    if (!cartItems || !name || !email) return res.status(400).json({ error: 'Missing required fields' });

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const timestamp = new Date().toISOString();

    // Clear cart (bonus: persistence handled)
    db.run('DELETE FROM cart_items WHERE userId = 1');

    res.json({
      receipt: {
        total,
        timestamp,
        items: cartItems,
        customer: { name, email },
        message: 'Thank you for shopping at Vibe Commerce!'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});