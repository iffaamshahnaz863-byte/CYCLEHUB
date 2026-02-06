
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { OrderWithItems, OrderStatus, ALL_ORDER_STATUSES } from '../../types';
import Spinner from '../../components/ui/Spinner';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<(OrderWithItems & { profiles: { full_name: string, email: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name)), profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data as any);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    if (error) alert('Failed to update status: ' + error.message);
    else fetchOrders();
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-gray-500';
        case 'confirmed': return 'bg-brand-blue';
        case 'packed': return 'bg-indigo-500';
        case 'shipped': return 'bg-purple-500';
        case 'delivered': return 'bg-green-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-700';
    }
  }

  if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Manage Orders</h1>
      <div className="bg-brand-dark-light shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-brand-gray">
            <tr>
              <th scope="col" className="px-6 py-3">Order ID</th>
              <th scope="col" className="px-6 py-3">Customer</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Total</th>
              <th scope="col" className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-brand-gray hover:bg-brand-gray/50">
                <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                <td className="px-6 py-4">{order.profiles?.full_name || 'N/A'}</td>
                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">₹{order.total_amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`border-0 rounded-md p-1 text-xs text-white capitalize ${getStatusColor(order.status)}`}
                  >
                    {ALL_ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
