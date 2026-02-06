
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart, Package, ShoppingCart, Users, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

const AdminLayout: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      alert("Could not log out. Please try again.");
    } else {
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-brand-dark text-gray-200">
      <aside className="w-64 flex-shrink-0 bg-brand-dark-light p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">
            DAR CYCLE HUB
          </h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-orange text-white'
                      : 'hover:bg-brand-gray'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="space-y-4">
             <NavLink to="/" className="flex items-center px-4 py-2 rounded-md transition-colors hover:bg-brand-gray">
                <ArrowLeft className="w-5 h-5 mr-3" />
                <span>Back to Shop</span>
             </NavLink>
            <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 rounded-md transition-colors hover:bg-brand-gray"
            >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
