
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Product, Category } from '../../types';
import Spinner from '../../components/ui/Spinner';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/ui/Button';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const selectedCategory = searchParams.get('category');
  const sortOption = searchParams.get('sort') || 'created_at-desc';

  const fetchData = useCallback(async () => {
    console.log("ProductsPage: Starting data fetch...");
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log("ProductsPage: Fetch timed out.");
        controller.abort();
    }, 10000);

    try {
      const categoriesPromise = supabase.from('categories').select('*').abortSignal(controller.signal);
      
      let productsQuery = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .abortSignal(controller.signal);

      if (selectedCategory) {
        productsQuery = productsQuery.eq('category_id', selectedCategory);
      }
      const [sortKey, sortOrder] = sortOption.split('-');
      if (sortKey && sortOrder) {
        productsQuery = productsQuery.order(sortKey, { ascending: sortOrder === 'asc' });
      }

      const [categoriesResult, productsResult] = await Promise.allSettled([
          categoriesPromise,
          productsQuery
      ]);

      if (!isMounted.current) return;

      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.data) {
        setCategories(categoriesResult.value.data);
      } else if (categoriesResult.status === 'rejected') {
        console.error("ProductsPage: Error fetching categories:", categoriesResult.reason);
      }

      if (productsResult.status === 'fulfilled' && productsResult.value.data) {
        setProducts(productsResult.value.data);
      } else if (productsResult.status === 'rejected') {
        throw productsResult.reason;
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error("ProductsPage: Failed to fetch products:", err);
      if (err.name === 'AbortError') {
        setError('The request took too long. Please try again.');
      } else {
        setError('No data found / Database error. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setLoading(false);
        console.log("ProductsPage: Finished data fetch.");
      }
    }
  }, [selectedCategory, sortOption]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleCategoryChange = (categoryId: string) => {
    setSearchParams(prev => {
        if(categoryId === '') prev.delete('category');
        else prev.set('category', categoryId);
        return prev;
    });
  }
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams(prev => {
        prev.set('sort', e.target.value);
        return prev;
    });
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-96"><Spinner /></div>;
    }
    if (error) {
      return (
        <div className="text-center py-20 bg-brand-dark-light rounded-lg">
          <p className="text-xl text-red-400">{error}</p>
          <Button className="mt-6" onClick={fetchData}>Retry</Button>
        </div>
      );
    }
    if (products.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }
    return <p className="text-center text-gray-400 py-20">No cycles found for this selection.</p>;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-white mb-10">All Our Cycles</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <div className="sticky top-20">
            <h2 className="text-xl font-semibold text-brand-orange mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-md ${!selectedCategory ? 'bg-brand-orange text-white' : 'hover:bg-brand-gray'}`}
                >
                  All
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-md ${selectedCategory === cat.id ? 'bg-brand-orange text-white' : 'hover:bg-brand-gray'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
             <p className="text-gray-400">{products.length} products found</p>
             <select onChange={handleSortChange} value={sortOption} className="bg-brand-dark-light border border-brand-gray rounded-md p-2">
                <option value="created_at-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
             </select>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
