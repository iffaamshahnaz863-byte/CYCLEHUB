
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}#/` // This should point to your reset password page in your app. Supabase requires a real page. For now, pointing to home.
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("If an account exists for this email, you will receive a password reset link.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-dark px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-brand-dark-light rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-yellow">Reset Password</h1>
          <p className="mt-2 text-gray-300">Enter your email to receive a reset link.</p>
        </div>
        {message ? (
           <div className="text-center p-4 bg-green-900/50 text-green-300 rounded-md">
            {message}
          </div>
        ) : (
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button type="submit" isLoading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>
        )}
        <p className="text-sm text-center text-gray-400">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-brand-yellow hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
