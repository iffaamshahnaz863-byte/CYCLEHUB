
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
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
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const checkBuckets = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        const requiredBuckets = ['product_images', 'category_images'];
        const existingBucketNames = buckets.map(b => b.name);
        const missingBuckets = requiredBuckets.filter(b => !existingBucketNames.includes(b));
        if (missingBuckets.length > 0) {
          setWarning(`The following storage buckets are missing: ${missingBuckets.join(', ')}. Image uploads will fail. Please ensure the initial schema.sql script has been run on your Supabase project.`);
        }
      } catch (err: any) {
        console.error("Error checking storage buckets:", err);
        if (err.message.includes('permission denied')) {
            setWarning("Could not verify storage buckets due to permission issues. Please check your RLS policies for storage.");
        } else {
            setWarning("Could not verify storage bucket configuration. Image uploads may fail.");
        }
      }
    };

    const fetchStats = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setWarning(prev => prev ? `${prev}\nCould not fetch dashboard stats.` : "Could not fetch dashboard stats.");
      }
    };

    const loadDashboard = async () => {
      setLoading(true);
      await Promise.all([checkBuckets(), fetchStats()]);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      {warning && (
        <div className="bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-300 p-4 mb-6 rounded-r-lg flex" role="alert">
          <AlertTriangle className="h-5 w-5 mr-3 mt-1 flex-shrink-0 text-yellow-400" />
          <div>
            <p className="font-bold">Configuration Notice</p>
            <p className="whitespace-pre-line">{warning}</p>
          </div>
        </div>
      )}

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
