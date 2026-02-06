
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import { ShoppingCart, User as UserIcon, LogOut, Settings, BarChart } from 'lucide-react';

const Header: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-brand-dark-light sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-brand-yellow">
              DAR CYCLE HUB
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="text-gray-300 hover:bg-brand-gray hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link to="/products" className="text-gray-300 hover:bg-brand-gray hover:text-white px-3 py-2 rounded-md text-sm font-medium">All Cycles</Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative text-gray-300 hover:text-white p-2 rounded-full hover:bg-brand-gray">
              <ShoppingCart size={24} />
              {/* Future: Add cart count badge here */}
            </Link>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2 rounded-full hover:bg-brand-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-white">
                  <UserIcon size={24} className="text-gray-300 hover:text-white" />
                </button>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-brand-dark-light ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-brand-gray">
                      Hi, {profile?.full_name || user.email}
                    </div>
                    {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-brand-gray">
                            <BarChart size={16} className="mr-2" />
                            Admin Panel
                        </Link>
                    )}
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-brand-gray">
                        <Settings size={16} className="mr-2" />
                        My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-brand-gray">
                        <ShoppingCart size={16} className="mr-2" />
                        My Orders
                    </Link>
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-brand-gray">
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-gray-300 hover:bg-brand-gray hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
