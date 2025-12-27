import { useState, useEffect } from 'react';
import { Sun, User, LogOut, Waves } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const getUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                setRole(profile?.role ?? null);
            } else {
                setRole(null);
            }
        };

        getUserData();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) setRole(null);
            else {
                // If we improved this, we'd refetch the role here too just in case
                getUserData();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (!role) return '/cliente'; // Fallback
        if (role === 'admin') return '/admin';
        if (role === 'owner') return '/owner';
        return '/cliente';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm h-20 flex items-center px-6 md:px-12 justify-between transition-all duration-300">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                <div className="text-brand-blue transform group-hover:scale-110 transition-transform duration-300">
                    <Waves className="w-9 h-9" />
                </div>
                <span className="text-2xl font-serif font-bold text-slate-800 tracking-tight group-hover:text-brand-blue transition-colors">JIAR PlayaRent</span>
            </Link>

            <div className="hidden md:flex items-center gap-10 text-slate-600 font-medium">
                <Link to="/" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Flota 4x4</Link>
                <Link to="/rutas" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Rutas Costeras</Link>
                <a href="#" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Experiencias</a>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors hover:rotate-12 duration-300">
                    <Sun className="w-5 h-5" />
                </button>

                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-slate-200 hover:border-brand-blue hover:shadow-md rounded-full transition-all duration-200"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                                {user.email.split('@')[0]}
                            </span>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="px-5 py-3 border-b border-slate-100 mb-2">
                                    <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                                    <p className="text-xs text-slate-500 capitalize">{role || 'Usuario'}</p>
                                </div>

                                <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className="px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-blue flex items-center gap-3 transition-colors">
                                    <User className="w-4 h-4" /> Mi Perfil
                                </Link>

                                <Link to="/cliente" onClick={() => setIsMenuOpen(false)} className="px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-blue flex items-center gap-3 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    Mis Reservas
                                </Link>

                                {(role === 'admin' || role === 'owner') && (
                                    <div className="my-2 border-t border-slate-100 pt-2">
                                        <Link
                                            to={getDashboardLink()}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 hover:text-brand-blue flex items-center gap-3 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                            {role === 'admin' ? 'Panel de Control' : 'Panel del Dueño'}
                                        </Link>
                                    </div>
                                )}

                                <div className="border-t border-slate-100 mt-2 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Overlay to close menu when clicking outside */}
                        {isMenuOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="btn-primary flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Iniciar Sesión</span>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
