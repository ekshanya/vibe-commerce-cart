import React, { useState, useEffect } from 'react';
import ProductGrid from './components/ProductGrid';
import CartView from './components/CartView';
import CheckoutForm from './components/CheckoutForm';

function App() {
  const [view, setView] = useState('products'); // 'products', 'cart', 'checkout'
  const [cart, setCart] = useState([]);
  const [receipt, setReceipt] = useState(null);

  // Fetch cart once on load
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    fetch('http://localhost:5000/api/cart')
      .then(res => res.json())
      .then(data => setCart(data.items || []));
  };

  const handleAddToCart = (productId, qty = 1) => {
    fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty })
    }).then(() => fetchCart());
  };

  const handleRemoveFromCart = (id) => {
    fetch(`http://localhost:5000/api/cart/${id}`, { method: 'DELETE' })
      .then(() => fetchCart());
  };

  const handleClearCart = () => {
    if (!window.confirm('Clear all items from your cart?')) return;
    fetch('http://localhost:5000/api/cart', { method: 'DELETE' })
      .then(() => fetchCart());
  };

  const handleCheckout = (formData) => {
    fetch('http://localhost:5000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems: cart, ...formData })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(`Checkout failed: ${data.error}`);
          return;
        }
        setReceipt(data.receipt);
        fetchCart();
      })
      .catch(err => {
        console.error("Checkout error:", err);
        alert("Checkout failed. Check console for details.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 p-4 text-white flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-semibold">Vibe Commerce 🛍️</h1>
        <div>
          <button onClick={() => setView('products')} className="mr-4 hover:underline">
            Products
          </button>
          <button
  onClick={() => {
    setView('cart');
    fetchCart();
  }}
  className="mr-4"
>
  Cart ({cart.reduce((sum, item) => sum + item.qty, 0)})
</button>

          {view === 'checkout' && (
            <button onClick={() => setView('cart')} className="hover:underline">Back to Cart</button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {view === 'products' && <ProductGrid onAddToCart={handleAddToCart} />}
        {view === 'cart' && (
          <CartView
            cart={cart}
            onRemove={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={() => setView('checkout')}
          />
        )}
        {view === 'checkout' && <CheckoutForm onSubmit={handleCheckout} />}
      </main>

      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4 text-center shadow-lg">
            <h2 className="text-2xl mb-4 font-semibold text-green-600">✅ Purchase Successful</h2>
            <p className="text-gray-700">Total: <span className="font-semibold">${receipt.total.toFixed(2)}</span></p>
            <p className="text-gray-700">Time: {new Date(receipt.timestamp).toLocaleString()}</p>
            <p className="mt-2">Thank you, <strong>{receipt.customer.name}</strong>!</p>
            <button
              onClick={() => { setReceipt(null); setView('products'); }}
              className="mt-5 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
