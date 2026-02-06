
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Product } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingCart } from 'lucide-react';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const { data, error: dbError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
        .abortSignal(controller.signal);
      
      if (dbError) throw dbError;

      if (isMounted.current) {
        setProduct(data);
        setSelectedImage(data.images?.[0] || null);
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error("Failed to fetch product:", err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load product details. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product || product.stock < quantity) {
      alert("Not enough stock available.");
      return;
    }
    
    setAddingToCart(true);

    try {
      const { data: existingCartItem } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingCartItem) {
        const newQuantity = existingCartItem.quantity + quantity;
        const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existingCartItem.id);
        if (error) throw error;
        alert("Product quantity updated in cart.");
      } else {
        const { error } = await supabase
          .from('cart')
          .insert({ user_id: user.id, product_id: product.id, quantity: quantity });
        if (error) throw error;
        alert("Product added to cart.");
      }
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  if (error) {
    return (
      <div className="container mx-auto text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchProduct}>Retry</Button>
      </div>
    );
  }
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  const displayPrice = product.discount_price ?? product.price;
  const originalPrice = product.discount_price ? product.price : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-w-1 aspect-h-1 w-full bg-brand-dark-light rounded-lg overflow-hidden mb-4">
            <img 
              src={selectedImage || `https://picsum.photos/seed/${product.id}/600/600`} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((img, index) => (
              <button 
                key={index} 
                onClick={() => setSelectedImage(img)}
                className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden ring-2 ${selectedImage === img ? 'ring-brand-orange' : 'ring-transparent'}`}
              >
                <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="py-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">{product.name}</h1>
          <div className="mt-4 flex items-baseline">
            <p className="text-3xl font-bold text-brand-orange">₹{displayPrice.toLocaleString()}</p>
            {originalPrice && (
              <p className="ml-3 text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</p>
            )}
          </div>
          <p className="mt-6 text-gray-300">{product.description || "No description available."}</p>
          
          <div className="mt-8">
            <p className="text-sm text-gray-400">
              {product.stock > 0 ? `${product.stock} available in stock` : 'Out of Stock'}
            </p>
          </div>
          
          {product.stock > 0 && (
            <div className="mt-8 flex items-center space-x-4">
              <div className="flex items-center border border-brand-gray rounded-md">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-lg">-</button>
                <span className="px-4 py-2 border-l border-r border-brand-gray">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-lg">+</button>
              </div>
              <Button onClick={handleAddToCart} isLoading={addingToCart} className="flex-1">
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
