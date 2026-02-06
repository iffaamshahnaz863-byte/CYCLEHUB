
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-dark px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-brand-dark-light rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-yellow">DAR CYCLE HUB</h1>
          <p className="mt-2 text-gray-300">Welcome back! Please login to your account.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          <div className="flex items-center justify-between">
            <div/>
            <Link to="/forgot-password" className="text-sm text-brand-yellow hover:underline">
              Forgot Password?
            </Link>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" isLoading={loading} className="w-full">
            Login
          </Button>
        </form>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-brand-yellow hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
