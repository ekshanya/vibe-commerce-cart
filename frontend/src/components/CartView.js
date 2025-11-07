import React from 'react';

const CartView = ({ cart, onRemove, onClearCart, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (cart.length === 0) {
    return <p className="text-gray-600 text-center mt-10">Your cart is empty 🛒</p>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id} className="flex justify-between items-center border-b py-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.qty}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center mt-6">
        <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
        <div>
          <button
            onClick={onCheckout}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded mr-2"
          >
            Checkout
          </button>
          <button
            onClick={onClearCart}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartView;
