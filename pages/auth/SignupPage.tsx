
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
        if(data.user.identities && data.user.identities.length === 0) {
            setError("User already exists with this email.");
        } else {
            setMessage("Registration successful! Please check your email to confirm your account.");
            // Optionally redirect after a delay
            setTimeout(() => navigate('/login'), 5000);
        }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-dark px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-brand-dark-light rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-orange">DAR CYCLE HUB</h1>
          <p className="mt-2 text-gray-300">Create your account to start shopping.</p>
        </div>
        {message ? (
          <div className="text-center p-4 bg-green-900/50 text-green-300 rounded-md">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your Name"
            />
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
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button type="submit" isLoading={loading} className="w-full">
              Sign Up
            </Button>
          </form>
        )}
        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-orange hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
