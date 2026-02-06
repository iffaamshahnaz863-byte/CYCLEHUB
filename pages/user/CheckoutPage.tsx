
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { CartItemWithProduct, Profile } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const CheckoutPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadCheckoutData = useCallback(async () => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }
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

      if (isMounted.current) {
        if (!data || data.length === 0) {
          navigate('/cart');
          return;
        }
        setCartItems(data as CartItemWithProduct[]);
        setShippingAddress({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          pincode: profile.pincode,
        });
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error("Failed to load checkout data:", err);
      if (err.name === 'AbortError') {
        setError('The request took too long. Please try again.');
      } else {
        setError('Failed to load your information. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  const handlePlaceOrder = async () => {
    if (!user || !shippingAddress.full_name || !shippingAddress.address || !shippingAddress.phone || !shippingAddress.pincode) {
        alert("Please fill in all address details in your profile before placing an order.");
        navigate('/profile');
        return;
    }
    
    setPlacingOrder(true);

    try {
        const total_amount = cartTotal;

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount,
                shipping_address: {
                    full_name: shippingAddress.full_name,
                    phone: shippingAddress.phone,
                    address: shippingAddress.address,
                    pincode: shippingAddress.pincode
                },
                payment_method: 'cod'
            })
            .select()
            .single();
        
        if (orderError) throw orderError;

        const orderItems = cartItems.map(item => ({
            order_id: orderData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.products?.discount_price ?? item.products?.price ?? 0
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        const { error: cartClearError } = await supabase.from('cart').delete().eq('user_id', user.id);
        if (cartClearError) {
            console.error("Failed to clear cart, but order was placed:", cartClearError);
        }

        alert('Order placed successfully!');
        navigate('/orders');

    } catch (err: any) {
        console.error("Error placing order:", err);
        alert(`Failed to place order: ${err.message}`);
    } finally {
        setPlacingOrder(false);
    }
  };
  
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.products?.discount_price ?? item.products?.price ?? 0;
    return total + price * item.quantity;
  }, 0);

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  
  if (error) {
    return (
        <div className="container mx-auto text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadCheckoutData}>Retry</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Shipping Details */}
        <div className="lg:w-2/3 bg-brand-dark-light p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-brand-orange">Shipping Address</h2>
          <div className="space-y-4">
            <div><strong>Name:</strong> {shippingAddress.full_name}</div>
            <div><strong>Phone:</strong> {shippingAddress.phone}</div>
            <div><strong>Address:</strong> {shippingAddress.address}</div>
            <div><strong>Pincode:</strong> {shippingAddress.pincode}</div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/profile')} className="mt-6">Edit Address</Button>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3 bg-brand-dark-light p-6 rounded-lg h-fit sticky top-24">
          <h2 className="text-2xl font-semibold mb-4">Your Order</h2>
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
            {cartItems.map(item => item.products && (
                <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.products.name} x {item.quantity}</span>
                    <span>₹{( (item.products.discount_price ?? item.products.price) * item.quantity ).toLocaleString()}</span>
                </div>
            ))}
          </div>
          <div className="flex justify-between py-2 border-t border-b border-brand-gray">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Payment Method</span>
            <span className="font-semibold text-brand-orange">Cash on Delivery (COD)</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-xl mt-4 border-t border-brand-gray">
            <span>Total</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <Button onClick={handlePlaceOrder} isLoading={placingOrder} className="w-full mt-6">
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
