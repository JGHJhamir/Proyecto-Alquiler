
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { MapPin, Star, Share2, Heart, ArrowLeft, Shield, Gauge, Fuel, Users, Calendar, CheckCircle, AlertCircle, Tag, Loader2, X } from 'lucide-react';

import PaymentModal from '../components/PaymentModal';

const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [bookingStatus, setBookingStatus] = useState('idle'); // idle, processing, success, error

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Promotion State
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoMessage, setPromoMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    useEffect(() => {
        const fetchVehicle = async () => {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', id)
                .single();

            if (data) setVehicle(data);
            setLoading(false);
        };
        fetchVehicle();
    }, [id]);

    useEffect(() => {
        if (startDate && endDate && vehicle) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                setTotalPrice(diffDays * vehicle.price_per_day);
            } else {
                setTotalPrice(0);
            }
        }
    }, [startDate, endDate, vehicle]);

    // Reset discount when dates change
    useEffect(() => {
        if (appliedPromo) {
            setDiscount(0);
            setAppliedPromo(null);
            setPromoMessage(null);
            setPromoCode('');
        }
    }, [startDate, endDate]);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        if (!startDate || !endDate) {
            setPromoMessage({ type: 'error', text: 'Selecciona fechas primero' });
            return;
        }

        setPromoLoading(true);
        setPromoMessage(null);

        try {
            const { data: promo, error } = await supabase
                .from('promotions')
                .select('*')
                .eq('code', promoCode.toUpperCase())
                .single();

            if (error || !promo) throw new Error('Código inválido');

            // Validations
            if (!promo.is_active) throw new Error('Este código ha expirado');
            if (new Date() < new Date(promo.start_date)) throw new Error('La promoción aún no inicia');
            if (promo.end_date && new Date() > new Date(promo.end_date)) throw new Error('La promoción ha finalizado');

            // Vehicle Type Condition through vehicle category
            if (promo.vehicle_type_condition && promo.vehicle_type_condition !== 'Todos') {
                // Approximate matching: map vehicle category to condition
                const isVideoMatch = vehicle.category?.toLowerCase().includes(promo.vehicle_type_condition.toLowerCase());
                if (!isVideoMatch) throw new Error(`Solo válido para vehículos tipo ${promo.vehicle_type_condition}`);
            }

            // Location Condition
            if (promo.location_condition && promo.location_condition !== 'Todas') {
                if (!vehicle.location_city?.toLowerCase().includes(promo.location_condition.toLowerCase())) {
                    throw new Error(`Solo válido en ${promo.location_condition}`);
                }
            }

            // Min Rental Duration
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            // Convert milliseconds to hours
            const rentalHours = Math.ceil(diffTime / (1000 * 60 * 60));

            if (promo.min_rental_hours > 0 && rentalHours < promo.min_rental_hours) {
                const minDays = Math.ceil(promo.min_rental_hours / 24);
                throw new Error(`Requiere alquiler mínimo de ${promo.min_rental_hours} horas (${minDays} días aprox)`);
            }

            // Apply Discount
            let discountAmount = 0;
            if (promo.discount_type === 'percentage') {
                discountAmount = (totalPrice * promo.discount_value) / 100;
            } else {
                discountAmount = Number(promo.discount_value);
            }

            // Cap discount at total price
            discountAmount = Math.min(discountAmount, totalPrice);

            setDiscount(discountAmount);
            setAppliedPromo(promo);
            setPromoMessage({ type: 'success', text: `¡Descuento de ${promo.discount_type === 'percentage' ? promo.discount_value + '%' : 'S/ ' + promo.discount_value} aplicado!` });

        } catch (error) {
            console.error(error);
            setPromoMessage({ type: 'error', text: error.message });
            setDiscount(0);
            setAppliedPromo(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!startDate || !endDate) return;
        setBookingStatus('processing');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            // Get full profile to send name in WhatsApp
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentUser(profile || { full_name: 'Usuario' }); // Fallback if profile missing

            const { data: booking, error } = await supabase
                .from('bookings')
                .insert([
                    {
                        vehicle_id: vehicle.id,
                        user_id: user.id,
                        start_date: startDate,
                        end_date: endDate,
                        total_price: Math.max(0, totalPrice - discount),
                        status: 'pending'
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            // Success: Open Modal
            setBookingStatus('success');
            setCurrentBooking(booking);
            setTimeout(() => {
                setShowPaymentModal(true);
            }, 500);

        } catch (error) {
            console.error('Error creating booking:', error);
            setBookingStatus('error');
        }
    };

    if (loading) return <div className="min-h-screen grid place-items-center"><div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;
    if (!vehicle) return <div className="min-h-screen grid place-items-center text-xl">Vehículo no encontrado</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <Link to="/" className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all pointer-events-auto">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex gap-3 pointer-events-auto">
                    <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Hero Image */}
            <div className="relative h-[60vh] md:h-[70vh] w-full">
                <img
                    src={vehicle.image_url}
                    alt={vehicle.model}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-brand-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{vehicle.category || '4x4'}</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                        <span className="font-bold">{vehicle.rating}</span>
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-2">{vehicle.make} {vehicle.model}</h1>
                                <p className="flex items-center gap-2 text-white/90 font-medium">
                                    <MapPin className="w-5 h-5 text-brand-blue" />
                                    {vehicle.location_city}
                                </p>
                            </div>

                            <div className="text-left md:text-right">
                                <p className="text-sm text-white/70 font-medium uppercase tracking-wider mb-1">Precio por día</p>
                                <p className="text-4xl md:text-5xl font-bold text-white">S/ {vehicle.price_per_day}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Specs */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Gauge className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Velocidad</span>
                            <span className="font-bold text-slate-900">400 HP</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Fuel className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Combustible</span>
                            <span className="font-bold text-slate-900">Gasolina</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Users className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Pasajeros</span>
                            <span className="font-bold text-slate-900">4 Personas</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Shield className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Seguro</span>
                            <span className="font-bold text-slate-900">Todo Riesgo</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">Sobre este vehículo</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            {vehicle.description || `Diseñado para dominar tanto las dunas como la carretera costera, este ${vehicle.make} ${vehicle.model} ofrece la combinación perfecta de potencia y confort. Ideal para recorrer las playas de ${vehicle.location_city} con estilo y seguridad. Equipado con suspensión reforzada, aire acondicionado y sistema de sonido premium para tus playlists playeras.`}
                        </p>
                    </div>
                </div>

                {/* Booking Card (Sticky) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-brand-blue/5 border border-blue-100 sticky top-24">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 font-serif">Reserva tu Aventura</h3>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Desde</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-3 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Hasta</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-3 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                        disabled={!startDate}
                                    />
                                    <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Promo Code Section */}
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Cupón de Descuento</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all uppercase placeholder:text-slate-400 text-sm font-medium disabled:opacity-50"
                                            placeholder="CÓDIGO"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            disabled={appliedPromo || !startDate || !endDate}
                                        />
                                        {appliedPromo && (
                                            <button
                                                onClick={() => { setAppliedPromo(null); setDiscount(0); setPromoCode(''); setPromoMessage(null); }}
                                                className="absolute right-2 top-2 p-1 hover:bg-slate-200 rounded-full transition-colors"
                                            >
                                                <X className="w-3 h-3 text-slate-500" />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={!promoCode || appliedPromo || promoLoading || !startDate || !endDate}
                                        className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
                                    </button>
                                </div>
                                {promoMessage && (
                                    <p className={`text-xs mt-2 font-medium flex items-center gap-1.5 ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {promoMessage.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {promoMessage.text}
                                    </p>
                                )}
                            </div>

                            <div className="bg-ocean-50/50 p-6 rounded-2xl border border-ocean-100 mt-6 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-500">Precio x día</span>
                                    <span className="text-slate-700 font-bold">S/ {vehicle.price_per_day}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-500">Días</span>
                                    <span className="text-slate-700 font-bold">{startDate && endDate ? Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 0}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-sm text-emerald-600 animate-in fade-in slide-in-from-top-1">
                                        <span className="font-bold flex items-center gap-1"><Tag className="w-3 h-3" /> Descuento</span>
                                        <span className="font-bold">- S/ {discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-ocean-200/50">
                                    <span className="text-lg font-bold text-brand-dark">Total estimado</span>
                                    <div className="text-right">
                                        {discount > 0 && (
                                            <span className="block text-xs text-slate-400 line-through mb-0.5">S/ {totalPrice}</span>
                                        )}
                                        <span className="text-2xl font-black text-brand-blue">S/ {Math.max(0, totalPrice - discount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {bookingStatus === 'success' ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold animate-in fade-in duration-300">
                                <CheckCircle className="w-5 h-5" />
                                ¡Reserva Solicitada!
                            </div>
                        ) : bookingStatus === 'error' ? (
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold animate-in fade-in duration-300">
                                <AlertCircle className="w-5 h-5" />
                                Error al reservar
                            </div>
                        ) : (
                            <button
                                onClick={handleBooking}
                                disabled={!startDate || !endDate || bookingStatus === 'processing'}
                                className="w-full btn-primary py-4 text-lg shadow-lg hover:shadow-brand-blue/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {bookingStatus === 'processing' ? 'Procesando...' : 'Confirmar Reserva'}
                            </button>
                        )}

                        <p className="text-center text-xs text-slate-400 mt-4">
                            Al reservar aceptas nuestros términos y condiciones.
                        </p>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                booking={currentBooking}
                vehicle={vehicle}
                user={currentUser}
            />
        </div>
    );
};

// Helper for the calendar icon
const ChevronDown = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

export default VehicleDetail;
