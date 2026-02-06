
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../services/supabase';
import Spinner from '../../components/ui/Spinner';
import { Profile } from '../../types';
import Button from '../../components/ui/Button';

type UserWithEmail = Profile & {
    users: { email: string; created_at: string } | null;
};


const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserWithEmail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
          isMounted.current = false;
        };
    }, []);

    const fetchUsers = useCallback(async () => {
        if (!isMounted.current) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from('profiles')
                .select(`
                    *,
                    users:id (
                        email,
                        created_at
                    )
                `)
                .order('role', { ascending: true });

            if (dbError) throw dbError;
            if (isMounted.current) setUsers(data as UserWithEmail[]);

        } catch (err: any) {
            if (!isMounted.current) return;
            console.error("Error fetching users:", err);
            setError("Could not load users. Please try again.");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const renderContent = () => {
        if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;
        if (error) {
            return (
              <div className="text-center py-20 bg-brand-dark-light rounded-lg">
                <p className="text-xl text-red-400">{error}</p>
                <Button className="mt-6" onClick={fetchUsers}>Retry</Button>
              </div>
            );
        }
        return (
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
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${user.role === 'admin' ? 'bg-orange-500/30 text-orange-300' : 'bg-blue-500/30 text-blue-300'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user.users?.created_at ? new Date(user.users.created_at).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Manage Users</h1>
            {renderContent()}
        </div>
    );
};

export default AdminUsers;
