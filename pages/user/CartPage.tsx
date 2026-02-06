
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { CartItemWithProduct } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { Trash2 } from 'lucide-react';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCartItems = useCallback(async () => {
    if (!user) return;
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const { data, error: dbError } = await supabase
        .from('cart')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .abortSignal(controller.signal);
      
      if (dbError) throw dbError;
      if (isMounted.current) setCartItems(data as CartItemWithProduct[]);

    } catch (err: any) {
      if (!isMounted.current) return;
      console.error("Failed to fetch cart:", err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load your cart. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);
  
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const { error } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', itemId);
      if (error) throw error;
      fetchCartItems();
    } catch (err: any) {
        console.error("Error updating quantity:", err);
        alert("Could not update cart quantity.");
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      const { error } = await supabase
          .from('cart')
          .delete()
          .eq('id', itemId);
      if (error) throw error;
      fetchCartItems();
    } catch(err: any) {
        console.error("Error removing item:", err);
        alert("Could not remove item from cart.");
    }
  }

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.products?.discount_price ?? item.products?.price ?? 0;
    return total + price * item.quantity;
  }, 0);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }
  
  if (error) {
    return (
      <div className="container mx-auto text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchCartItems}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Your Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-brand-dark-light rounded-lg">
          <p className="text-xl text-gray-400">Your cart is empty.</p>
          <Link to="/products">
            <Button className="mt-6">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="space-y-4">
              {cartItems.map(item => item.products && (
                <div key={item.id} className="flex items-center bg-brand-dark-light p-4 rounded-lg">
                  <img src={item.products.images?.[0] || ''} alt={item.products.name} className="w-24 h-24 object-cover rounded-md" />
                  <div className="flex-grow ml-4">
                    <h2 className="font-semibold text-lg">{item.products.name}</h2>
                    <p className="text-brand-orange">₹{(item.products.discount_price ?? item.products.price).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border border-brand-gray rounded-md">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border border-brand-gray rounded-md">+</button>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="ml-6 text-gray-400 hover:text-red-500">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="bg-brand-dark-light p-6 rounded-lg sticky top-24">
              <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between py-2 border-b border-brand-gray">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-xl mt-4">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <Link to="/checkout">
                <Button className="w-full mt-6">Proceed to Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
