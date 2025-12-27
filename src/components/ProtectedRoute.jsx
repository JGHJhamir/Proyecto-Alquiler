import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 1. Check Session
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setLoading(false);
                    return;
                }

                setUser(session.user);

                // 2. Fetch Profile Role
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (!error && profile) {
                    setRole(profile.role);
                }
            } catch (error) {
                console.error("Error in ProtectedRoute:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    // 1. Not Logged In -> Redirect to Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Logged In but Wrong Role -> Redirect to Home (or specific dashboard)
    if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
        // Optional: Redirect based on their ACTUAL role to be helpful
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'owner') return <Navigate to="/owner" replace />;
        if (role === 'client') return <Navigate to="/cliente" replace />;

        return <Navigate to="/" replace />;
    }

    // 3. Allowed
    return <Outlet />;
};

export default ProtectedRoute;
