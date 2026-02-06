
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark-light mt-12">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} DAR CYCLE HUB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
