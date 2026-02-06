
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import Spinner from '../../components/ui/Spinner';
import { Profile } from '../../types';

type UserWithEmail = Profile & {
    users: { email: string; created_at: string } | null;
};


const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserWithEmail[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        // This is a bit tricky. We need to fetch profiles and then somehow get their auth email.
        // A database function would be better, but for simplicity, let's fetch profiles first.
        // NOTE: For production, a paginated query or a VIEW/RPC in Supabase would be more performant.
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                users:id (
                    email,
                    created_at
                )
            `)
            .order('role', { ascending: true });


        if (data) {
            setUsers(data as UserWithEmail[]);
        }
        if (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Manage Users</h1>
            <div className="bg-brand-dark-light shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-brand-gray">
                        <tr>
                            <th scope="col" className="px-6 py-3">Full Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Joined On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-brand-gray hover:bg-brand-gray/50">
                                <td className="px-6 py-4 font-medium">{user.full_name || 'N/A'}</td>
                                <td className="px-6 py-4">{user.users?.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'admin' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-blue-500/30 text-blue-300'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user.users?.created_at ? new Date(user.users.created_at).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
