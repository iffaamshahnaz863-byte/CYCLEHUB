
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { Category } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formState, setFormState] = useState<Partial<Category>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
          isMounted.current = false;
        };
    }, []);

    const fetchCategories = useCallback(async () => {
        if (!isMounted.current) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
            if (dbError) throw dbError;
            if (isMounted.current) setCategories(data);
        } catch (err: any) {
            if (!isMounted.current) return;
            console.error("Error fetching categories:", err);
            setError("Could not load categories. Please try again.");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const openModal = (category: Category | null = null) => {
        setEditingCategory(category);
        setFormState(category || { name: '', image_url: '' });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name) return;
        
        try {
            let imageUrl = formState.image_url;
            if (imageFile) {
                const fileName = `${Date.now()}-${imageFile.name}`;
                const { data, error } = await supabase.storage.from('category_images').upload(fileName, imageFile);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage.from('category_images').getPublicUrl(data.path);
                imageUrl = publicUrl;
            }

            const categoryData = { name: formState.name, image_url: imageUrl };

            if (editingCategory) {
                const { error } = await supabase.from('categories').update(categoryData).eq('id', editingCategory.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('categories').insert(categoryData);
                if (error) throw error;
            }
            fetchCategories();
            closeModal();
        } catch(err: any) {
            console.error("Error saving category:", err);
            alert(`Failed to save category: ${err.message}`);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            const { error } = await supabase.from('categories').delete().eq('id', categoryId);
            if (error) alert("Could not delete category. It might be in use by some products.");
            else fetchCategories();
        }
    };

    const renderContent = () => {
        if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;
        if (error) {
            return (
              <div className="text-center py-20 bg-brand-dark-light rounded-lg">
                <p className="text-xl text-red-400">{error}</p>
                <Button className="mt-6" onClick={fetchCategories}>Retry</Button>
              </div>
            );
        }
        return (
            <div className="bg-brand-dark-light shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-gray">
                        <tr>
                            <th scope="col" className="px-6 py-3">Category Name</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id} className="border-b border-brand-gray hover:bg-brand-gray/50">
                                <td className="px-6 py-4 font-medium">{c.name}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button onClick={() => openModal(c)} className="text-blue-400 hover:text-blue-300"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
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
                <h1 className="text-3xl font-bold text-white">Manage Categories</h1>
                <Button onClick={() => openModal()}><Plus className="mr-2" />Add Category</Button>
            </div>
            {renderContent()}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-brand-dark-light p-8 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-6">{editingCategory ? 'Edit' : 'Add'} Category</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Category Name" name="name" value={formState.name || ''} onChange={handleFormChange} required />
                            <div>
                                <label className="block text-sm font-medium mb-1">Image</label>
                                <input type="file" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-orange file:text-brand-dark hover:file:bg-orange-500"/>
                                {formState.image_url && !imageFile && <img src={formState.image_url} alt="current" className="w-20 h-20 object-cover mt-2 rounded-md"/>}
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                                <Button type="submit">Save Category</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
