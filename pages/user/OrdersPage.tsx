
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { OrderWithItems } from '../../types';
import Spinner from '../../components/ui/Spinner';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data as OrderWithItems[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-gray-500';
        case 'confirmed': return 'bg-blue-500';
        case 'packed': return 'bg-indigo-500';
        case 'shipped': return 'bg-purple-500';
        case 'delivered': return 'bg-green-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-700';
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-brand-dark-light rounded-lg">
          <p className="text-xl text-gray-400">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-brand-dark-light p-6 rounded-lg shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-brand-gray pb-4 mb-4">
                <div>
                  <p className="font-bold text-lg">Order ID: <span className="text-gray-400 font-mono text-sm">{order.id}</span></p>
                  <p className="text-sm text-gray-400">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                    <p className="text-xl font-bold text-brand-yellow">₹{order.total_amount.toLocaleString()}</p>
                    <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>
              </div>
              <div>
                {order.order_items.map(item => item.products && (
                    <div key={item.id} className="flex items-center py-2">
                        <img src={item.products.images?.[0] || ''} alt={item.products.name} className="w-16 h-16 object-cover rounded-md"/>
                        <div className="ml-4">
                            <p className="font-semibold">{item.products.name}</p>
                            <p className="text-sm text-gray-400">Qty: {item.quantity} | Price: ₹{item.price.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
