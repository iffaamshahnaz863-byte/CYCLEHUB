
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-brand-dark px-4">
      <h1 className="text-9xl font-extrabold text-brand-yellow tracking-widest">404</h1>
      <div className="bg-brand-dark-light px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <p className="mt-4 text-lg text-gray-300">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/" className="mt-8">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
