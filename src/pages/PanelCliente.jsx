import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Calendar, Clock, CreditCard, ChevronRight, MapPin, User, LogOut, FileText, X, Waves, Save, Globe, CreditCard as CardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalPago from '../components/ModalPago';
import TicketReserva from '../components/TicketReserva';

const PanelCliente = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'profile'
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
        dni: '',
        document_type: 'dni',
        country: 'Perú',
        birth_date: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }

                // Get profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setUser(profile || user);
                setProfileData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    dni: profile?.dni || '',
                    document_type: profile?.document_type || 'dni',
                    country: profile?.country || 'Perú',
                    birth_date: profile?.birth_date || ''
                });

                // Get Bookings
                const { data: bookingsData, error } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        vehicles ( make, model, image_url, year, category, location_city )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setBookings(bookingsData || []);

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleOpenPayment = (booking) => {
        setSelectedBookingForPayment(booking);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        // Auto-select document type based on country (same logic as registration)
        if (name === 'country') {
            const newDocumentType = value === 'Perú' ? 'dni' : 'passport';
            setProfileData({ ...profileData, country: value, document_type: newDocumentType });
            return;
        }

        setProfileData({ ...profileData, [name]: value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                    dni: profileData.dni,
                    document_type: profileData.document_type,
                    country: profileData.country,
                    birth_date: profileData.birth_date
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update local user state
            setUser({ ...user, ...profileData });
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
        } finally {
            setSaving(false);
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Waves className="w-6 h-6 text-brand-blue" />
                        <h1 className="font-bold text-xl font-serif text-slate-900">JIAR PlayaRent</h1>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{user?.full_name}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-8 border-b border-slate-200 mb-8">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-4 px-2 font-serif font-bold text-lg transition-all relative ${activeTab === 'bookings' ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Mis Reservas
                        {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`pb-4 px-2 font-serif font-bold text-lg transition-all relative ${activeTab === 'profile' ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Mi Perfil
                        {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-blue rounded-t-full"></div>}
                    </button>
                </div>

                {activeTab === 'bookings' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-bold text-slate-900">Historial de Reservas</h2>
                            <button onClick={() => navigate('/')} className="text-brand-blue font-semibold hover:underline text-sm opacity-0 sm:opacity-100 transition-opacity">
                                + Nueva Reserva
                            </button>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Aún no tienes reservas</h3>
                                <p className="text-slate-500 mb-6">Empieza tu aventura hoy mismo explorando nuestra flota.</p>
                                <button onClick={() => navigate('/')} className="btn-primary px-6 py-2.5 rounded-xl shadow-lg shadow-brand-blue/20">
                                    Explorar Vehículos
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Image */}
                                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                                <img
                                                    src={booking.vehicles?.image_url}
                                                    alt={`${booking.vehicles?.make} ${booking.vehicles?.model}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900">
                                                            {booking.vehicles?.make} {booking.vehicles?.model} <span className="text-slate-400 font-normal text-sm">{booking.vehicles?.year}</span>
                                                        </h3>
                                                        <p className="text-slate-500 text-sm">{booking.vehicles?.category} • {booking.vehicles?.location_city}</p>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        booking.status === 'completed' ? 'bg-blue-50 text-brand-blue border-blue-100' :
                                                            booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                booking.status === 'awaiting_confirmation' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                        {booking.status === 'confirmed' ? 'Confirmada' :
                                                            booking.status === 'completed' ? 'Finalizada' :
                                                                booking.status === 'cancelled' ? 'Cancelada' :
                                                                    booking.status === 'awaiting_confirmation' ? 'Validando Pago' :
                                                                        'Pendiente'}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 mb-6">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-brand-blue" />
                                                        <span>
                                                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-brand-blue" />
                                                        <span className="font-semibold text-slate-900">S/ {booking.total_price}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {(booking.status === 'confirmed' || booking.status === 'completed') && (
                                                        <button
                                                            onClick={() => setSelectedTicket(booking)}
                                                            className="text-sm font-semibold text-brand-blue hover:text-blue-700 hover:underline flex items-center gap-1"
                                                        >
                                                            <FileText className="w-4 h-4" /> Ver Ticket
                                                        </button>
                                                    )}

                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleOpenPayment(booking)}
                                                            className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-brand-blue/20 flex items-center gap-2"
                                                        >
                                                            Pagar Ahora <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {booking.status === 'awaiting_confirmation' && (
                                                        <button
                                                            disabled
                                                            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            <Clock className="w-4 h-4" /> Validando...
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* My Profile Tab */
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900">Editar Perfil</h2>
                                <p className="text-slate-500 mt-1">Actualiza tu información personal</p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"></div> : <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"></div>}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Read Only Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-slate-400">@</span>
                                        </div>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">El email no se puede cambiar.</p>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={profileData.full_name}
                                            onChange={handleProfileChange}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        placeholder="+51 999 999 999"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all font-medium"
                                    />
                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">País de Origen</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                        <select
                                            name="country"
                                            value={profileData.country}
                                            onChange={handleProfileChange}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all font-medium appearance-none cursor-pointer"
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
                                </div>

                                {/* Document ID */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {profileData.document_type === 'dni' ? 'DNI' : 'Pasaporte'}
                                    </label>
                                    <div className="relative group">
                                        <CardIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                        <input
                                            type="text"
                                            name="dni"
                                            value={profileData.dni}
                                            onChange={handleProfileChange}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Birth Date */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Fecha de Nacimiento</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={profileData.birth_date}
                                            onChange={handleProfileChange}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end border-t border-slate-100 mt-8">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-brand-blue hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:translate-y-[-1px] active:translate-y-[1px]"
                                >
                                    {saving ? 'Guardando...' : <><Save className="w-5 h-5" /> Guardar Cambios</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>

            <ModalPago
                isOpen={!!selectedBookingForPayment}
                onClose={() => setSelectedBookingForPayment(null)}
                booking={selectedBookingForPayment}
                vehicle={selectedBookingForPayment?.vehicles}
                user={user}
            />

            {/* Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <button
                            onClick={() => setSelectedTicket(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                        <div className="p-6">
                            <TicketReserva
                                booking={selectedTicket}
                                vehicle={selectedTicket.vehicles}
                                user={user}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelCliente;
