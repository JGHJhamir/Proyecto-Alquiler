import { useState, useEffect } from 'react';
import { Sun, User, LogOut, Waves, Menu, X, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import BottomNavigation from './BottomNavigation';

const BarraNavegacion = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-10 text-slate-600 font-medium">
                <Link to="/" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Inicio</Link>
                <Link to="/explorar" className="hover:text-brand-blue hover:font-semibold transition-all duration-200">Explorar Flota</Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="p-2.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors hover:rotate-12 duration-300 hidden sm:block">
                    <Sun className="w-5 h-5" />
                </button>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                >
                    {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Admin/Owner Dashboard Button */}
                {user && (role === 'admin' || role === 'owner') && (
                    <Link
                        to={getDashboardLink()}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-sm font-bold">{role === 'admin' ? 'Panel Admin' : 'Panel Dueño'}</span>
                    </Link>
                )}

                {user ? (
                    <div className="relative hidden md:block">
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

                        {/* User Dropdown Menu (Desktop) */}
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

                        {/* Overlay to close details menu */}
                        {isMenuOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="btn-primary md:flex items-center gap-2 hidden">
                        <User className="w-4 h-4" />
                        <span>Iniciar Sesión</span>
                    </Link>
                )}
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileNavOpen && (
                <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in z-40">
                    <Link to="/" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-bold text-slate-800 hover:text-brand-blue py-2 border-b border-slate-50">Inicio</Link>
                    <Link to="/explorar" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-bold text-slate-800 hover:text-brand-blue py-2 border-b border-slate-50">Explorar Flota</Link>

                    {user ? (
                        <>
                            <div className="py-2">
                                <p className="text-sm text-slate-500">Hola,</p>
                                <p className="font-bold text-slate-900">{user.email}</p>
                            </div>
                            <Link to="/cliente" onClick={() => setIsMobileNavOpen(false)} className="text-slate-600 hover:text-brand-blue py-2 flex items-center gap-2">
                                <User className="w-5 h-5" /> Mis Reservas
                            </Link>

                            {(role === 'admin' || role === 'owner') && (
                                <Link to={getDashboardLink()} onClick={() => setIsMobileNavOpen(false)} className="text-slate-600 hover:text-brand-blue py-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    Panel de Control
                                </Link>
                            )}

                            <button onClick={handleLogout} className="text-red-600 font-bold py-2 flex items-center gap-2 mt-2">
                                <LogOut className="w-5 h-5" /> Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMobileNavOpen(false)} className="btn-primary w-full text-center mt-4 justify-center flex items-center gap-2">
                            <User className="w-4 h-4" /> Iniciar Sesión
                        </Link>
                    )}
                </div>
            )}

            {/* Bottom Navigation for Mobile */}
            <BottomNavigation />
        </nav>
    );
};

export default BarraNavegacion;
