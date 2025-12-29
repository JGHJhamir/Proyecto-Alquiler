import { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Calendar, CreditCard, ArrowRight, AlertCircle, CheckCircle, Globe } from 'lucide-react';

const Registro = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        documentType: 'dni',
        dni: '',
        birthDate: '',
        country: 'Perú'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Auto-select document type based on country
        if (name === 'country') {
            // DNI is only for Peru, all other countries use Passport
            const newDocumentType = value === 'Perú' ? 'dni' : 'passport';
            setFormData({ ...formData, country: value, documentType: newDocumentType, dni: '' });
            return;
        }

        // Apply specific validations based on document type
        if (name === 'dni') {
            if (formData.documentType === 'dni') {
                // Only allow numbers and max 8 digits for DNI
                if (!/^\d*$/.test(value) || value.length > 8) return;
            } else {
                // Passport: alphanumeric, max 12 characters
                if (value.length > 12) return;
            }
        }

        setFormData({ ...formData, [name]: value });
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

        // 1. Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        // 2. Validate Age
        if (!validateAge(formData.birthDate)) {
            setError('Debes ser mayor de 18 años para registrarte.');
            setLoading(false);
            return;
        }

        // 3. Validate Document
        if (formData.documentType === 'dni') {
            if (formData.dni.length !== 8) {
                setError('El DNI debe tener exactamente 8 dígitos.');
                setLoading(false);
                return;
            }
        } else {
            if (formData.dni.length < 6 || formData.dni.length > 12) {
                setError('El pasaporte debe tener entre 6 y 12 caracteres.');
                setLoading(false);
                return;
            }
        }

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        dni: formData.dni,
                        document_type: formData.documentType,
                        birth_date: formData.birthDate,
                        country: formData.country
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
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
                    alt="Coastal Peru Adventure"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-12 text-white z-10">
                    <h1 className="text-5xl font-serif font-bold mb-4 drop-shadow-lg">Empieza tu Viaje</h1>
                    <p className="text-lg text-white/90 max-w-md leading-relaxed">
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

                            <div className="relative group">
                                <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                <select
                                    name="country"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                                    value={formData.country}
                                    onChange={handleChange}
                                >
                                    <option value="Perú">🇵🇪 Perú</option>
                                    <option value="Argentina">🇦🇷 Argentina</option>
                                    <option value="Bolivia">🇧🇴 Bolivia</option>
                                    <option value="Brasil">🇧🇷 Brasil</option>
                                    <option value="Chile">🇨🇱 Chile</option>
                                    <option value="Colombia">🇨🇴 Colombia</option>
                                    <option value="Ecuador">🇪🇨 Ecuador</option>
                                    <option value="Paraguay">🇵🇾 Paraguay</option>
                                    <option value="Uruguay">🇺🇾 Uruguay</option>
                                    <option value="Venezuela">🇻🇪 Venezuela</option>
                                    <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                                    <option value="España">🇪🇸 España</option>
                                    <option value="Otro">🌎 Otro</option>
                                </select>
                            </div>

                            <div className="relative group">
                                <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                <input
                                    type="text"
                                    name="dni"
                                    placeholder={formData.documentType === 'dni' ? 'DNI: 12345678' : 'Pasaporte: ABC123456'}
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
                                    placeholder="Fecha de Nacimiento"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                />
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

                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirmar Contraseña"
                                    required
                                    minLength={6}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-slate-700"
                                    value={formData.confirmPassword}
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

export default Registro;
