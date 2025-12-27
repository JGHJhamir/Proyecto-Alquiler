import { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log("Attempting login with:", formData.email);
            // 1. Iniciar sesión
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (authError) {
                console.error("Supabase auth error:", authError);
                throw authError;
            }

            console.log("Login successful, user:", user);

            // 2. Obtener rol del usuario
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                // Handle case where user auth exists but profile doesn't 
                // This might happen if triggers acted weirdly or manual cleanup happened
                setError('Usuario autenticado, pero no se encontró perfil. Contacte soporte.');
                return;
            }

            console.log("Profile found:", profile);

            // 3. Redirección basada en rol
            switch (profile.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'owner':
                    navigate('/owner');
                    break;
                case 'client':
                    navigate('/');
                    break;
                default:
                    // Default fallback
                    navigate('/');
            }

        } catch (err) {
            console.error("Login catch block:", err);
            // Show the actual message from Supabase or fallback
            setError(err.message || 'Error al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=2072&auto=format&fit=crop"
                    alt="Fondo Playa"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/40 to-slate-900/60 backdrop-blur-[2px]"></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">

                {/* Glass Card */}
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">

                    {/* Header Section */}
                    <div className="px-8 pt-10 pb-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/10 text-brand-blue mb-6">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Bienvenido</h2>
                        <p className="text-slate-500 text-sm">Ingresa a tu cuenta JIAR PlayaRent</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mx-8 mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form Section */}
                    <form onSubmit={handleLogin} className="px-8 pb-10 space-y-5">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Correo Electrónico</label>
                                <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                        placeholder="ejemplo@correo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Contraseña</label>
                                    <Link to="#" className="text-xs font-medium text-brand-blue hover:text-brand-dark transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-brand-blue hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue shadow-lg shadow-brand-blue/30 transform active:scale-[0.98] transition-all duration-200"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Ingresar
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="relative mt-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500">¿No tienes cuenta?</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link to="/registro" className="inline-flex items-center text-brand-blue font-bold hover:underline">
                                Regístrate ahora
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer copyright */}
                <p className="text-center text-white/50 text-xs mt-8">
                    &copy; 2025 JIAR PlayaRent. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;

