
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Category, Product } from '../../types';
import Spinner from '../../components/ui/Spinner';
import ProductCard from '../../components/ProductCard';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(4);

      if (categoriesData) setCategories(categoriesData);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (productsData) setFeaturedProducts(productsData);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="bg-brand-dark">
      {/* Hero Section */}
      <section className="bg-brand-dark-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Find Your <span className="bg-gradient-to-r from-brand-orange to-brand-pink bg-clip-text text-transparent">Perfect Ride</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our premium collection of cycles for every terrain and adventure. Quality, performance, and style, delivered.
          </p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-brand-orange to-brand-pink text-white font-bold py-3 px-8 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-300 text-lg"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-10">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`} className="group block">
                <div className="relative aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                  <img
                    src={category.image_url || `https://picsum.photos/seed/${category.id}/500/500`}
                    alt={category.name}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center group-hover:bg-opacity-60 transition-all duration-300">
                    <h3 className="text-2xl font-semibold text-white">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-24 bg-brand-dark-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-10">Featured Cycles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
