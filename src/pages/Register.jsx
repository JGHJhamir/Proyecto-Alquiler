import { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Calendar, CreditCard, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        dni: '',
        birthDate: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateAge = (dateString) => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // 1. Validate Age
        if (!validateAge(formData.birthDate)) {
            setError('Debes ser mayor de 18 años para registrarte.');
            setLoading(false);
            return;
        }

        // 2. Validate DNI (Simple length check)
        if (formData.dni.length < 8) {
            setError('El DNI debe tener al menos 8 dígitos.');
            setLoading(false);
            return;
        }

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        dni: formData.dni,
                        birth_date: formData.birthDate
                    }
                }
            });

            if (authError) throw authError;

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-sand-100 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">¡Cuenta Creada!</h2>
                    <p className="text-slate-600 mb-8">
                        Bienvenido a la aventura. Redirigiendo al inicio de sesión...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Left Side - Image */}
            <div className="hidden md:block w-1/2 bg-slate-900 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1519046904884-53103b34b271?q=80&w=2070&auto=format&fit=crop"
                    alt="Desert adventure"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-12 text-white z-10">
                    <h1 className="text-5xl font-serif font-bold mb-4">Empieza tu Viaje</h1>
                    <p className="text-lg text-white/80 max-w-md">
                        Únete a JIAR PlayaRent y descubre las mejores rutas costeras del Perú con nuestra flota premium.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
                <div className="max-w-md w-full">
                    <div className="text-center md:text-left mb-10">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Crear Cuenta</h2>
                        <p className="text-slate-500">Ingresa tus datos para comenzar.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-5">
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Nombre Completo"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                    <input
                                        type="text"
                                        name="dni"
                                        placeholder="DNI / Pasaporte"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700"
                                        value={formData.dni}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                    <input
                                        type="date"
                                        name="birthDate"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo Electrónico"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    required
                                    minLength={6}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-lg shadow-lg hover:shadow-brand-blue/30 active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Creando cuenta...' : (
                                <>
                                    Registrarme <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-8 text-slate-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-brand-blue font-bold hover:underline">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
