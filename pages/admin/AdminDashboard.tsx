
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; color: string }> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-brand-dark-light p-6 rounded-lg shadow-lg flex items-center">
    <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-400`}>
      <Icon className="w-8 h-8" />
    </div>
    <div className="ml-4">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const { count: products } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: orders, data: ordersData } = await supabase.from('orders').select('total_amount', { count: 'exact' });
      
      const revenue = ordersData?.reduce((acc, order) => acc + order.total_amount, 0) || 0;

      setStats({
        products: products || 0,
        users: users || 0,
        orders: orders || 0,
        revenue: revenue,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="green" />
        <StatCard icon={ShoppingCart} title="Total Orders" value={stats.orders} color="orange" />
        <StatCard icon={Package} title="Total Products" value={stats.products} color="blue" />
        <StatCard icon={Users} title="Total Users" value={stats.users} color="pink" />
      </div>

      <div className="mt-10 bg-brand-dark-light p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <p className="text-gray-400">Welcome to the DAR CYCLE HUB admin panel. From here you can manage products, categories, orders, and view users.</p>
        <p className="text-gray-400 mt-2">Use the navigation on the left to get started.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
