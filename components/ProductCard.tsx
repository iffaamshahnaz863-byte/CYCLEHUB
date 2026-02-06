
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const displayPrice = product.discount_price ?? product.price;
  const originalPrice = product.discount_price ? product.price : null;

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-brand-dark-light rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
          <img
            src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/400`}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-200 truncate">{product.name}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-xl font-bold text-brand-orange">₹{displayPrice.toLocaleString()}</p>
            {originalPrice && (
              <p className="ml-2 text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString()}</p>
            )}
          </div>
          {product.stock <= 0 && <p className="text-sm text-red-400 mt-1">Out of Stock</p>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
