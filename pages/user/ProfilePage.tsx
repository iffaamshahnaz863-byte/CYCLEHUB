
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const ProfilePage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setPincode(profile.pincode || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        address,
        pincode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Profile updated successfully!');
    }
    setLoading(false);
  };

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>
      <div className="bg-brand-dark-light p-8 rounded-lg shadow-lg">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <p className="text-gray-400 p-2 rounded-md bg-brand-dark">{user?.email}</p>
          </div>
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <Input
            label="Pincode"
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
          {message && <p className="text-sm text-green-400">{message}</p>}
          <div className="pt-2">
            <Button type="submit" isLoading={loading} className="w-full md:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
