import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Calendar, Clock, CreditCard, ChevronRight, MapPin, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalPago from '../components/ModalPago';

const PanelCliente = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
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

                // Get Bookings
                const { data: bookingsData, error } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        vehicles ( make, model, image_url, year, category )
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
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-brand-blue" />
                        <h1 className="font-bold text-lg text-slate-900">Mi Panel</h1>
                    </div>
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
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold font-serif text-slate-900">Mis Reservas</h2>
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-slate-600 border border-slate-200 shadow-sm">
                        {bookings.length} Total
                    </span>
                </div>

                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all animate-fade-in-up">
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Image */}
                                <div className="sm:w-48 h-32 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden relative">
                                    <img
                                        src={booking.vehicles?.image_url}
                                        alt={booking.vehicles?.model}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                        {booking.vehicles?.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 mb-1">
                                                    {booking.vehicles?.make} {booking.vehicles?.model}
                                                    <span className="ml-2 text-sm font-normal text-slate-400">{booking.vehicles?.year}</span>
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-blue" /> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-900">S/ {booking.total_price}</div>
                                                <div className="text-xs text-slate-400">Total</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-4 border-t border-slate-50 pt-4">
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        booking.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500' :
                                                    booking.status === 'pending' ? 'bg-amber-500' :
                                                        booking.status === 'cancelled' ? 'bg-red-500' :
                                                            booking.status === 'completed' ? 'bg-blue-500' : 'bg-slate-400'
                                                    }`}></span>
                                                {booking.status === 'confirmed' ? 'Confirmada' :
                                                    booking.status === 'pending' ? 'Pendiente de Pago' :
                                                        booking.status === 'cancelled' ? 'Cancelada' :
                                                            booking.status === 'completed' ? 'Finalizada' : booking.status}
                                            </span>
                                        </div>

                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleOpenPayment(booking)}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                            >
                                                Pagar Ahora <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {bookings.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900">Sin reservas aún</h3>
                            <p className="text-slate-500 text-sm mb-6">¿Listo para tu próxima aventura?</p>
                            <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors">
                                Ver Vehículos
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <ModalPago
                isOpen={!!selectedBookingForPayment}
                onClose={() => setSelectedBookingForPayment(null)}
                booking={selectedBookingForPayment}
                vehicle={selectedBookingForPayment?.vehicles}
                user={user}
            />
        </div>
    );
};

export default PanelCliente;
