import React, { useEffect, useState } from 'react';

const ProductGrid = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Product fetch error:', err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Available Products</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-40 object-contain mb-3"
              />
            )}
            <h3 className="font-medium mb-2">{p.name}</h3>
            <p className="text-gray-700 mb-2 font-semibold">${p.price}</p>
            <button
              onClick={() => onAddToCart(p.id)}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
