import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import BarraNavegacion from '../components/BarraNavegacion';
import { Mail, Phone, User, Edit2, CreditCard, X, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const EditProfileModal = ({ isOpen, onClose, profile, onUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        dni: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                dni: profile.dni || ''
            });
        }
    }, [profile]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Editar Perfil</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-blue outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Celular</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-blue outline-none transition-all"
                            placeholder="+51 900 000 000"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">DNI / Pasaporte</label>
                        <input
                            type="text"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-blue outline-none transition-all"
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Guardando...' : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Perfil = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (!error) {
                        setProfile(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
        getProfile();
    }, []);

    const handleUpdateProfile = async (newData) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(newData)
                .eq('id', user.id);

            if (error) throw error;

            setProfile({ ...profile, ...newData });
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            toast.error('Error al actualizar el perfil: ' + error.message);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <BarraNavegacion />

            <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Tarjeta de Perfil */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-8 text-center border-b border-slate-100">
                            {/* Avatar */}
                            <div className="inline-block relative mb-4">
                                <div className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center text-3xl font-bold ring-4 ring-white shadow-lg mx-auto">
                                    {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md border border-slate-100">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                            </div>

                            {/* Nombre y Rol */}
                            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                                {profile?.full_name || 'Usuario'}
                            </h2>
                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wide">
                                {profile?.role || 'Cliente'}
                            </span>
                        </div>

                        {/* Lista de Detalles */}
                        <div className="p-8 space-y-6">

                            {/* Email */}
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-blue/30 transition-colors group">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg group-hover:text-brand-blue group-hover:bg-brand-blue/5 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase mb-0.5">Email</p>
                                    <p className="text-slate-500 text-sm">{user?.email}</p>
                                </div>
                            </div>

                            {/* Teléfono (Simulado por ahora ya que podría no estar en BD aún, o usar metadata) */}
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-blue/30 transition-colors group">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg group-hover:text-brand-blue group-hover:bg-brand-blue/5 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase mb-0.5">Celular</p>
                                    <p className="text-slate-500 text-sm">{profile?.phone || 'No registrado'}</p>
                                </div>
                            </div>

                            {/* DNI */}
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-blue/30 transition-colors group">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg group-hover:text-brand-blue group-hover:bg-brand-blue/5 transition-colors">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase mb-0.5">DNI / Pasaporte</p>
                                    <p className="text-slate-500 text-sm">{profile?.dni || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pie de Página de Acción */}
                        <div className="px-8 pb-8">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                                Editar Perfil
                            </button>
                        </div>

                    </div>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Miembro desde {new Date(user?.created_at).getFullYear()}
                    </p>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                profile={profile}
                onUpdate={handleUpdateProfile}
            />
        </div>
    );
};

export default Perfil;
