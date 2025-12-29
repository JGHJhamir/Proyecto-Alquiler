import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import BarraNavegacion from '../components/BarraNavegacion';
import { Mail, Phone, User, Edit2, CreditCard } from 'lucide-react';

const Perfil = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);

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
    }, []);

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
                    {/* Profile Card */}
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

                            {/* Name & Role */}
                            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                                {profile?.full_name || 'Usuario'}
                            </h2>
                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wide">
                                {profile?.role || 'Cliente'}
                            </span>
                        </div>

                        {/* Details List */}
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

                            {/* Phone (Mocked for now as it might not be in DB yet, or use metadata) */}
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-blue/30 transition-colors group">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg group-hover:text-brand-blue group-hover:bg-brand-blue/5 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase mb-0.5">Celular</p>
                                    <p className="text-slate-500 text-sm">+51 987 654 321</p>
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

                        {/* Action Footer */}
                        <div className="px-8 pb-8">
                            <button className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
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
        </div>
    );
};

export default Perfil;
