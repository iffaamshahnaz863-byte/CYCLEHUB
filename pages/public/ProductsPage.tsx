
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Product, Category } from '../../types';
import Spinner from '../../components/ui/Spinner';
import ProductCard from '../../components/ProductCard';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCategory = searchParams.get('category');
  const sortOption = searchParams.get('sort') || 'created_at-desc';

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const [sortKey, sortOrder] = sortOption.split('-');
      if (sortKey && sortOrder) {
        query = query.order(sortKey, { ascending: sortOrder === 'asc' });
      }

      const { data, error } = await query;

      if (data) setProducts(data);
      if(error) console.error(error);
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory, sortOption]);
  
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-white mb-10">All Our Cycles</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
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
        
        {/* Product Grid */}
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
          {loading ? (
            <div className="flex justify-center items-center h-96"><Spinner /></div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-20">No products found for this selection.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
