
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { Product, Category } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formState, setFormState] = useState<Partial<Product>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (dbError) throw dbError;
      if (isMounted.current) setProducts(data);
    } catch (err: any) {
        if (!isMounted.current) return;
        console.error("Error fetching products:", err);
        setError("Could not load products. Please try again.");
    } finally {
        if (isMounted.current) setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        if (isMounted.current) setCategories(data || []);
    } catch(err: any) {
        console.error("Error fetching categories:", err);
        alert("Could not load categories. Some functionality might be limited.");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setFormState(product || { name: '', price: 0, stock: 0, category_id: '', is_active: true, images: [] });
    setImageFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    const checked = isCheckbox ? e.target.checked : undefined;
    setFormState(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.price || !formState.category_id) {
        alert("Please fill all required fields");
        return;
    }

    try {
        let imageUrls = formState.images || [];

        if (imageFiles.length > 0) {
            const uploadPromises = imageFiles.map(async file => {
                const fileName = `${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage.from('product_images').upload(fileName, file);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage.from('product_images').getPublicUrl(data.path);
                return publicUrl;
            });
            const uploadedUrls = await Promise.all(uploadPromises);
            imageUrls.push(...uploadedUrls);
        }
        
        const productData = { ...formState, images: imageUrls };

        if (editingProduct) {
            const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('products').insert(productData);
            if (error) throw error;
        }
        fetchProducts();
        closeModal();
    } catch (err: any) {
        console.error("Error saving product:", err);
        alert(`Failed to save product: ${err.message}`);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) alert(error.message);
        else fetchProducts();
    }
  };
  
  const renderContent = () => {
    if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>
    if (error) {
        return (
          <div className="text-center py-20 bg-brand-dark-light rounded-lg">
            <p className="text-xl text-red-400">{error}</p>
            <Button className="mt-6" onClick={fetchProducts}>Retry</Button>
          </div>
        );
    }
    return (
        <div className="bg-brand-dark-light shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-brand-gray">
            <tr>
              <th scope="col" className="px-6 py-3">Product</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Stock</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-brand-gray hover:bg-brand-gray/50">
                <td className="px-6 py-4 font-medium">{p.name}</td>
                <td className="px-6 py-4">₹{p.price.toLocaleString()}</td>
                <td className="px-6 py-4">{p.stock}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.is_active ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-2">
                  <button onClick={() => openModal(p)} className="text-blue-400 hover:text-blue-300"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Products</h1>
        <Button onClick={() => openModal()}><Plus className="mr-2" />Add Product</Button>
      </div>
      {renderContent()}
      {isModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
           <div className="bg-brand-dark-light p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit' : 'Add'} Product</h2>
             <form onSubmit={handleSubmit} className="space-y-4">
               <Input label="Name" name="name" value={formState.name || ''} onChange={handleFormChange} required />
               <textarea name="description" value={formState.description || ''} onChange={handleFormChange} placeholder="Description" className="w-full h-24 p-2 bg-brand-dark border border-brand-gray rounded-md" />
               <div className="grid grid-cols-2 gap-4">
                    <Input label="Price" name="price" type="number" value={formState.price || ''} onChange={handleFormChange} required />
                    <Input label="Discount Price (Optional)" name="discount_price" type="number" value={formState.discount_price || ''} onChange={handleFormChange} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                    <Input label="Stock" name="stock" type="number" value={formState.stock || ''} onChange={handleFormChange} required />
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="category_id" value={formState.category_id || ''} onChange={handleFormChange} required className="w-full p-2 bg-brand-dark border border-brand-gray rounded-md">
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Images (multi-select)</label>
                  <input type="file" multiple onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-brand-dark hover:file:bg-orange-500"/>
                  {formState.images && <div className="mt-2 text-xs text-gray-500">{formState.images.length} existing images.</div>}
               </div>
               <div className="flex items-center space-x-2">
                 <input type="checkbox" name="is_active" checked={formState.is_active || false} onChange={handleFormChange} id="is_active_check"/>
                 <label htmlFor="is_active_check">Product is Active</label>
               </div>
               <div className="flex justify-end space-x-4 pt-4">
                 <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                 <Button type="submit">Save Product</Button>
               </div>
             </form>
           </div>
         </div>
      )}
    </div>
  )
}

export default AdminProducts;
