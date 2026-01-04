
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { MapPin, Star, Share2, Heart, ArrowLeft, Shield, Gauge, Fuel, Users, Calendar, CheckCircle, AlertCircle, Tag, Loader2, X, CreditCard, Smartphone, Lock, ShieldCheck, ChevronRight, Clock } from 'lucide-react';

import BarraNavegacion from '../components/BarraNavegacion';
// import ModalPago (Removed)
import StepIndicator from '../components/StepIndicator';
import DateRangePicker from '../components/DateRangePicker';
import TicketReserva from '../components/TicketReserva';

// Helper: Format Date to Local ISO String (YYYY-MM-DDTHH:mm) for inputs
const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
};

const DetalleVehiculo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [quantity, setQuantity] = useState(1);
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Step State
    const [currentStep, setCurrentStep] = useState(1); // 1: Fechas, 2: Detalles, 3: Pago
    const [showCalendar, setShowCalendar] = useState(false);
    const [availablePromos, setAvailablePromos] = useState([]);

    // Payment State (Integrated)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });

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

        // Check authentication
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
        };
        checkAuth();
    }, [id]);

    // Fetch available promotions
    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const { data, error } = await supabase
                    .from('promotions')
                    .select('*')
                    .eq('is_active', true)
                    .gte('end_date', new Date().toISOString())
                    .limit(3);

                if (data && !error) setAvailablePromos(data);
            } catch (err) {
                console.error('Error fetching promos:', err);
                // Silently fail - promos are optional
            }
        };
        fetchPromos();
    }, []);

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

    const [rentalType, setRentalType] = useState('hours'); // Always hours for Beach App

    // Enforce rental type - Removing vehicle_type check, always hours
    // useEffect(() => {
    //     if (vehicle?.vehicle_type) {
    //         if (vehicle.vehicle_type === 'playa') {
    //             setRentalType('hours');
    //         } else if (vehicle.vehicle_type === 'ciudad') {
    //             setRentalType('days');
    //         }
    //     }
    // }, [vehicle]);

    // Reset dates when type changes
    useEffect(() => {
        setStartDate('');
        setEndDate('');
        setTotalPrice(0);
        setDiscount(0);
        setAppliedPromo(null);
    }, [rentalType]);

    useEffect(() => {
        if (startDate && endDate && vehicle) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);

            if (rentalType === 'days') {
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const subtotal = diffDays > 0 ? diffDays * vehicle.price_per_day * quantity : 0;
                setTotalPrice(subtotal * 1.18); // Add 18% IGV
            } else {
                // Hourly calculation: Rate = Day Price / 8
                const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                // Use explicit price_per_hour if available, else derive it
                const hourlyRate = vehicle.price_per_hour || (vehicle.price_per_day / 8);
                const subtotal = diffHours > 0 ? diffHours * hourlyRate * quantity : 0;
                setTotalPrice(subtotal * 1.18); // Add 18% IGV
            }
        }
    }, [startDate, endDate, vehicle, rentalType, quantity]);

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
                if (!isVideoMatch) throw new Error(`Solo válido para vehículos tipo ${promo.vehicle_type_condition} `);
            }

            // Location Condition
            if (promo.location_condition && promo.location_condition !== 'Todas') {
                if (!vehicle.location_city?.toLowerCase().includes(promo.location_condition.toLowerCase())) {
                    throw new Error(`Solo válido en ${promo.location_condition} `);
                }
            }

            // Min Rental Duration
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const rentalHours = Math.ceil(diffTime / (1000 * 60 * 60));

            const minHours = Number(promo.min_rental_hours) || 0;

            if (minHours > 0 && rentalHours < minHours) {
                const minDays = Math.ceil(minHours / 24);
                throw new Error(`Esta promoción requiere un alquiler mínimo de ${minHours} horas (${rentalType === 'days' ? minDays + ' días aprox' : 'o su equivalente en días'})`);
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

    const checkAvailability = async (start, end) => {
        // Basic Overlap Check
        const { data, error } = await supabase
            .from('bookings')
            .select('quantity')
            .eq('vehicle_id', vehicle.id)
            .neq('status', 'cancelled') // Ignore cancelled bookings
            .or(`and(start_date.lte."${end}", end_date.gte."${start}")`);

        if (error) {
            console.error('Error checking availability:', error);
            return false;
        }

        // Calculate used stock
        const usedStock = data.reduce((sum, booking) => sum + (booking.quantity || 1), 0);
        const totalStock = vehicle.stock || 1;

        return (totalStock - usedStock) >= quantity;
    };

    // Reset booking status when dates change
    useEffect(() => {
        if (bookingStatus === 'success' || bookingStatus === 'error') {
            setBookingStatus('idle');
            setCurrentBooking(null);
            setCurrentStep(1);
        }
    }, [startDate, endDate]);

    const handleBooking = async () => {
        // If booking already created for these dates (status success), just advance
        if (bookingStatus === 'success' && currentBooking) {
            setCurrentStep(3);
            return;
        }

        setBookingStatus('processing');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Debes iniciar sesión');
                return;
            }

            // 1. Check Availability
            const isAvailable = await checkAvailability(startDate, endDate);
            if (!isAvailable) {
                setBookingStatus('error');
                alert('¡Lo sentimos! Este vehículo ya está reservado para las fechas seleccionadas. Por favor intenta con otras fechas.');
                return;
            }

            // Get full profile to send name in WhatsApp
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentUser(profile || { full_name: 'Usuario' });

            // Prepare Booking Data
            const bookingData = {
                vehicle_id: vehicle.id,
                user_id: user.id,
                start_date: startDate,
                end_date: endDate,
                total_price: Math.max(0, totalPrice - discount),
                quantity: quantity,
                status: 'pending'
            };

            // Try to add rental_type if supported (Backend will ignore extra fields if not strict, or we catch error)
            // Ideally we'd know from context, but safe to omit for now if column missing, 
            // OR include it and hope user ran migration. 
            // Let's include strictly necessary fields first.
            // If the column `rental_type` was added successfully, we should send it.
            // Since migration tool failed, I will NOT send `rental_type` to avoid SQL error on insert.
            // The price calculation is what matters most for the "Payment" step.

            const { data: booking, error } = await supabase
                .from('bookings')
                .insert([bookingData])
                .select()
                .single();

            if (error) throw error;

            // Success: Open Payment Modal

            // Success: Advance to Payment Step
            setBookingStatus('success');
            setCurrentBooking(booking);
            setCurrentStep(3); // Advance to integrated payment step
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error creating booking:', error);
            setBookingStatus('error');
        }
    };

    const validateCard = () => {
        if (selectedPaymentMethod === 'yape') return true;
        const { number, name, expiry, cvc } = cardDetails;
        if (number.replace(/\s/g, '').length !== 16) return false;
        if (name.length < 3) return false;
        // Simple expiry validation
        if (!expiry.includes('/') || expiry.length !== 5) return false;
        if (cvc.length !== 3) return false;
        return true;
    };

    // State for Similar Vehicles
    const [similarVehicles, setSimilarVehicles] = useState([]);

    // Fetch Similar Vehicles
    useEffect(() => {
        const fetchSimilar = async () => {
            if (!vehicle) return;

            const { data } = await supabase
                .from('vehicles')
                .select('*')
                .eq('category', vehicle.category)
                .neq('id', vehicle.id) // Exclude current
                .limit(3);

            if (data) setSimilarVehicles(data);
        };
        fetchSimilar();
    }, [vehicle]);

    const handleFinalizePayment = async () => {
        if (selectedPaymentMethod === 'card' && !validateCard()) {
            alert('Por favor verifica los datos de tu tarjeta.');
            return;
        }

        setBookingStatus('processing');

        try {
            // Determine status
            const newStatus = selectedPaymentMethod === 'card' ? 'confirmed' : 'pending';

            if (selectedPaymentMethod === 'card') {
                // Simulate processing
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', currentBooking.id);

            if (error) throw error;

            // Update local state
            setCurrentBooking(prev => ({ ...prev, status: newStatus }));
            setBookingStatus('completed'); // New status for showing Ticket

            if (selectedPaymentMethod === 'card') {
                // Confirmed immediately
            } else {
                // Open WhatsApp for Yape
                const ADMIN_PHONE = '51954025029';
                const bookingId = currentBooking.id.toString().slice(0, 8);
                const vehicleName = `${vehicle.make} ${vehicle.model}`;
                const userName = currentUser?.full_name || 'Cliente';

                // Format Dates properly
                const startStr = new Date(startDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                const endStr = new Date(endDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

                const newLine = '%0A';
                const message = `👋 *Hola, soy ${userName}*${newLine}` +
                    `Acabo de realizar una reserva y realizo el pago por *YAPE / PLIN*.${newLine}${newLine}` +
                    `📄 *ID Reserva:* ${bookingId}${newLine}` +
                    `🚙 *Vehículo:* ${vehicleName}${newLine}` +
                    `📅 *Fecha:* ${startStr} - ${endStr}${newLine}` +
                    `💰 *Monto Total:* S/ ${currentBooking.total_price.toFixed(2)}${newLine}${newLine}` +
                    `📎 *Adjunto mi comprobante:*`;

                window.open(`https://wa.me/${ADMIN_PHONE}?text=${message}`, '_blank');
            }

        } catch (error) {
            console.error('Payment error:', error);
            setBookingStatus('error');
            alert('Error al procesar el pago. Intenta nuevamente.');
        }
    };

    if (loading) return <div className="min-h-screen grid place-items-center"><div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;
    if (!vehicle) return <div className="min-h-screen grid place-items-center text-xl">Vehículo no encontrado</div>;

    // Helper to get today's string for min date
    const todayStr = new Date().toISOString().split('T')[0];



    const steps = [
        { label: 'Fechas' },
        { label: 'Detalles' },
        { label: 'Confirmar' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <Link to="/" className="p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all pointer-events-auto">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex gap-3 pointer-events-auto">
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

                <div className="absolute bottom-0 left-0 right-0 p-6 pb-16 md:p-12 text-white">
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
                                A
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vehicle.location_city + ', Peru')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white/90 font-medium hover:text-white hover:underline transition-all w-fit cursor-pointer"
                                >
                                    <MapPin className="w-5 h-5 text-brand-blue" />
                                    {vehicle.location_city}
                                </a>
                            </div>

                            <div className="text-left md:text-right">
                                <p className="text-sm text-white/70 font-medium uppercase tracking-wider mb-1">Precio por hora</p>
                                <p className="text-4xl md:text-5xl font-bold text-white">
                                    S/ {(vehicle.price_per_hour || (vehicle.price_per_day / 8)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Specs */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Gauge className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Potencia</span>
                            <span className="font-bold text-slate-900">{vehicle.engine_power || '400 HP'}</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Fuel className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Combustible</span>
                            <span className="font-bold text-slate-900">{vehicle.fuel_type || 'Gasolina'}</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Users className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Pasajeros</span>
                            <span className="font-bold text-slate-900">{vehicle.passengers || 4} Personas</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-2 p-4 bg-slate-50 rounded-2xl">
                            <Shield className="w-6 h-6 text-brand-blue" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Transmisión</span>
                            <span className="font-bold text-slate-900">{vehicle.transmission || 'Automática'}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">Sobre este vehículo</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            {vehicle.description || `Diseñado para dominar tanto las dunas como la carretera costera, este ${vehicle.make} ${vehicle.model} ofrece la combinación perfecta de potencia y confort. Ideal para recorrer las playas de ${vehicle.location_city} con estilo y seguridad. Equipado con suspensión reforzada, aire acondicionado y sistema de sonido premium para tus playlists playeras.`}
                        </p>
                    </div>

                    {/* Similar Vehicles */}
                    {similarVehicles.length > 0 && (
                        <div className="pt-8">
                            <h3 className="text-2xl font-bold text-slate-900 font-serif mb-6">Vehículos Similares</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {similarVehicles.map(v => (
                                    <Link key={v.id} to={`/vehiculo/${v.id}`} className="group bg-white rounded-[2rem] p-4 border border-slate-100 hover:shadow-lg transition-all flex gap-4 overflow-hidden">
                                        <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0">
                                            <img src={v.image_url} alt={v.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider">{v.category}</p>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                                                    <span className="text-xs font-bold">{v.rating}</span>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-slate-800 leading-tight mb-2 group-hover:text-brand-blue transition-colors">{v.make} {v.model}</h4>
                                            <p className="text-brand-blue font-bold text-lg">S/ {(v.price_per_hour || 0)} <span className="text-xs text-slate-400 font-normal">/ hora</span></p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Booking Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-brand-blue/5 border border-blue-100 lg:sticky lg:top-24">
                        {/* Step Indicator */}
                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <StepIndicator steps={steps} currentStep={bookingStatus === 'completed' ? 4 : currentStep} />
                        </div>


                        {bookingStatus === 'completed' ? (
                            <div key="step-complete" className="animate-in fade-in zoom-in-95 duration-500">
                                <div className="text-center mb-6">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ${currentBooking?.status === 'confirmed' ? 'bg-emerald-100 shadow-emerald-500/20' : 'bg-amber-100 shadow-amber-500/20'}`}>
                                        {currentBooking?.status === 'confirmed' ? <CheckCircle className="w-8 h-8 text-emerald-600" /> : <Clock className="w-8 h-8 text-amber-600" />}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">
                                        {currentBooking?.status === 'confirmed' ? '¡Felicidades!' : '¡Reserva Registrada!'}
                                    </h2>
                                    <p className="text-slate-500">
                                        {currentBooking?.status === 'confirmed'
                                            ? 'Tu aventura está confirmada y lista.'
                                            : 'Tu reserva está pendiente de validación.'}
                                    </p>
                                </div>

                                <TicketReserva
                                    booking={currentBooking}
                                    vehicle={vehicle}
                                    user={currentUser}
                                />

                                <div className="mt-8 space-y-3">
                                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                        <p className="text-xs text-slate-500">
                                            Puedes ver este ticket en cualquier momento en <br />
                                            <Link to="/reservas" className="font-bold text-brand-blue hover:underline">Mis Reservas</Link>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full bg-white border-2 border-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all"
                                    >
                                        Volver al Inicio
                                    </button>
                                </div>
                            </div>
                        ) : currentStep === 3 ? (
                            <div key="step-payment" className="animate-in fade-in slide-in-from-right-5">
                                <h3 className="text-xl font-bold text-slate-900 font-serif mb-6">Método de Pago</h3>

                                {/* Payment Tabs */}
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                                    <button
                                        onClick={() => setSelectedPaymentMethod('card')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedPaymentMethod === 'card' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <CreditCard className="w-4 h-4" /> Tarjeta
                                    </button>
                                    <button
                                        onClick={() => setSelectedPaymentMethod('yape')}
                                        className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedPaymentMethod === 'yape' ? 'bg-white text-[#742284] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Smartphone className="w-4 h-4" /> Yape / Plin
                                    </button>
                                </div>

                                {/* Payment Content */}
                                <div className="mb-6">
                                    {/* Card View - Always rendered, hidden if not selected */}
                                    <div key="view-card" className={`space-y-4 animate-in fade-in slide-in-from-right-2 ${selectedPaymentMethod === 'card' ? '' : 'hidden'}`}>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Número de Tarjeta"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all font-mono placeholder:font-sans"
                                                maxLength={19}
                                                value={cardDetails.number}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
                                                    if (v.length <= 19) setCardDetails({ ...cardDetails, number: v });
                                                }}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Nombre del Titular"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all uppercase"
                                                value={cardDetails.name}
                                                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="MM/AA"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-center"
                                                    maxLength={5}
                                                    value={cardDetails.expiry}
                                                    onChange={(e) => {
                                                        let v = e.target.value.replace(/\D/g, '');
                                                        if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                                        setCardDetails({ ...cardDetails, expiry: v });
                                                    }}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="CVC"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-center font-mono placeholder:font-sans"
                                                    maxLength={3}
                                                    value={cardDetails.cvc}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, '') })}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                            Pagos procesados de forma segura con encriptación SSL.
                                        </div>
                                    </div>

                                    {/* Yape View - Always rendered, hidden if not selected */}
                                    <div
                                        key="view-yape"
                                        className={`bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 animate-in fade-in slide-in-from-right-2 notranslate ${selectedPaymentMethod === 'yape' ? '' : 'hidden'}`}
                                        translate="no"
                                    >
                                        <img src="/yape-qr.png" alt="Yape QR" className="w-48 h-48 mx-auto rounded-xl shadow-lg mb-4 border-4 border-white" />
                                        <p className="font-bold text-slate-900 mb-1">Escanea para Yapear</p>
                                        <p className="text-2xl font-black text-[#742284] mb-4">S/ {Math.max(0, totalPrice - discount).toFixed(2)}</p>
                                        <p className="text-sm text-slate-500">
                                            1. Escanea el código QR<br />
                                            2. Realiza el pago por el monto total<br />
                                            3. Haz clic en "Enviar Comprobante"
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleFinalizePayment}
                                    disabled={bookingStatus === 'processing'}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed hidden lg:flex items-center justify-center gap-2 notranslate ${selectedPaymentMethod === 'yape' ? 'bg-[#25D366] hover:bg-[#128C7E] text-white' : 'bg-brand-blue hover:bg-blue-700 text-white'}`}
                                    translate="no"
                                >
                                    {bookingStatus === 'processing' ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Procesando...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {selectedPaymentMethod === 'yape' ? <Smartphone className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                            <span>
                                                {selectedPaymentMethod === 'yape' ? 'Enviar Comprobante' : `Pagar S/ ${Math.max(0, totalPrice - discount).toFixed(2)}`}
                                            </span>
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="w-full py-3 mt-3 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                                    disabled={bookingStatus === 'processing'}
                                >
                                    Volver a detalles
                                </button>
                            </div>
                        ) : (
                            <div key="step-dates" className="animate-in fade-in slide-in-from-left-5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 font-serif">Reserva tu Aventura</h3>

                                    <h3 className="text-xl font-bold text-slate-900 font-serif">Reserva tu Aventura</h3>

                                    {/* Rental Type Toggle Removed - Sandbox is Beach Only (Hourly) */}
                                </div>

                                <div className="space-y-4 mb-8">
                                    {rentalType === 'days' ? (
                                        <>
                                            {/* DAYS VIEW: Date Range */}
                                            <div>
                                                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    Fecha Inicio
                                                    {startDate && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                                                </label>
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
                                                <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    Fecha Fin
                                                    {endDate && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                                                </label>
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
                                        </>
                                    ) : (
                                        <>
                                            {/* HOURS VIEW: Date + Time + Duration */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Fecha de Reserva</label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-3 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none"
                                                            value={startDate ? startDate.split('T')[0] : ''}
                                                            onChange={(e) => {
                                                                const date = e.target.value;
                                                                const time = startDate ? startDate.split('T')[1] : '10:00';
                                                                const start = `${date}T${time}`;
                                                                setStartDate(start);
                                                                // Default 2 hours if not set
                                                                if (!endDate) {
                                                                    // Calculate end date based on duration (default 2h)
                                                                    const endObj = new Date(new Date(start).getTime() + 2 * 60 * 60 * 1000);
                                                                    setEndDate(toLocalISOString(endObj));
                                                                } else {
                                                                    // Keep existing duration
                                                                    const oldStart = new Date(startDate);
                                                                    const oldEnd = new Date(endDate);
                                                                    const durationMs = oldEnd - oldStart;
                                                                    const newStartObj = new Date(start);
                                                                    const newEndObj = new Date(newStartObj.getTime() + durationMs);
                                                                    setEndDate(toLocalISOString(newEndObj));
                                                                }
                                                            }}
                                                            min={new Date().toISOString().split('T')[0]}
                                                        />
                                                        <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Hora Inicio</label>
                                                    <input
                                                        type="time"
                                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-3 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none"
                                                        value={startDate ? startDate.split('T')[1] : ''}
                                                        onChange={(e) => {
                                                            const time = e.target.value;
                                                            const date = startDate ? startDate.split('T')[0] : new Date().toISOString().split('T')[0];
                                                            const start = `${date}T${time}`;
                                                            setStartDate(start);

                                                            // Keep duration
                                                            const oldStart = startDate ? new Date(startDate) : new Date();
                                                            const oldEnd = endDate ? new Date(endDate) : new Date(oldStart.getTime() + 2 * 3600000);
                                                            const durationMs = Math.max(3600000, oldEnd - oldStart); // Min 1 hour

                                                            const newStartObj = new Date(start);
                                                            const newEndObj = new Date(newStartObj.getTime() + durationMs);
                                                            setEndDate(toLocalISOString(newEndObj));
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Duración</label>
                                                    <select
                                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-3 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none cursor-pointer"
                                                        value={startDate && endDate ? Math.round((new Date(endDate) - new Date(startDate)) / 3600000) : 2}
                                                        onChange={(e) => {
                                                            const hours = parseInt(e.target.value);

                                                            if (startDate) {
                                                                const startObj = new Date(startDate);
                                                                const endObj = new Date(startObj.getTime() + hours * 60 * 60 * 1000);
                                                                setEndDate(toLocalISOString(endObj));
                                                            }
                                                        }}
                                                    >
                                                        {[1, 2, 3, 4, 5, 6, 8, 10, 12, 24].map(h => (
                                                            <option key={h} value={h}>{h} Horas</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Quantity Selection */}
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-brand-blue uppercase tracking-wider mb-2">Cantidad de Vehículos</label>
                                                    <div className="relative">
                                                        <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                                        <select
                                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl px-4 py-3 pl-11 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all appearance-none cursor-pointer"
                                                            value={quantity}
                                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                                        >
                                                            {Array.from({ length: Math.min(10, vehicle.stock || 1) }, (_, i) => i + 1).map(n => (
                                                                <option key={n} value={n}>{n} {n === 1 ? 'Vehículo' : 'Vehículos'}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-3.5 text-xs font-medium text-slate-400 pointer-events-none">
                                                            {vehicle.stock ? `${vehicle.stock} Disp.` : '1 Disp.'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
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
                                        <p className={`text-xs mt-2 font-medium flex items-center gap-1.5 ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-red-500'} `}>
                                            {promoMessage.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {promoMessage.text}
                                        </p>
                                    )}

                                    {/* Available Promos Suggestions */}
                                    {!appliedPromo && availablePromos.length > 0 && startDate && endDate && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cupones disponibles:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {availablePromos.map((promo) => (
                                                    <button
                                                        key={promo.id}
                                                        onClick={() => {
                                                            setPromoCode(promo.code);
                                                            setTimeout(() => handleApplyPromo(), 100);
                                                        }}
                                                        className="group relative bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-400 rounded-lg px-3 py-2 text-left transition-all hover:shadow-md active:scale-95"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="w-3 h-3 text-emerald-600" />
                                                            <span className="font-bold text-xs text-emerald-700">{promo.code}</span>
                                                        </div>
                                                        <p className="text-[10px] text-emerald-600 mt-0.5">
                                                            {promo.discount_type === 'percentage'
                                                                ? `${promo.discount_value}% OFF`
                                                                : `S/ ${promo.discount_value} OFF`}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-ocean-50/50 p-6 rounded-2xl border border-ocean-100 mt-6 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-500">
                                            Precio x {rentalType === 'days' ? 'día' : 'hora'}
                                        </span>
                                        <span className="text-slate-700 font-bold">
                                            S/ {rentalType === 'days' ? vehicle.price_per_day : (vehicle.price_per_hour || (vehicle.price_per_day / 8)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-500">
                                            {rentalType === 'days' ? 'Días' : 'Horas'}
                                        </span>
                                        <span className="text-slate-700 font-bold">
                                            {startDate && endDate
                                                ? (rentalType === 'days'
                                                    ? Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
                                                    : Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60))
                                                )
                                                : 0}
                                        </span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between items-center text-sm text-emerald-600 animate-in fade-in slide-in-from-top-1">
                                            <span className="font-bold flex items-center gap-1"><Tag className="w-3 h-3" /> Descuento</span>
                                            <span className="font-bold">- S/ {discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm text-slate-500">
                                        <span className="font-medium">Subtotal</span>
                                        <span>S/ {Math.max(0, (totalPrice - discount) / 1.18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-slate-500">
                                        <span className="font-medium">IGV (18%)</span>
                                        <span>S/ {Math.max(0, (totalPrice - discount) - ((totalPrice - discount) / 1.18)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-ocean-200/50">
                                        <span className="text-lg font-bold text-brand-dark">Total estimado</span>
                                        <div className="text-right">
                                            {discount > 0 && (
                                                <span className="block text-xs text-slate-400 line-through mb-0.5">S/ {totalPrice.toFixed(2)}</span>
                                            )}
                                            <span className="text-2xl font-black text-brand-blue transition-all duration-300 animate-in fade-in">
                                                S/ {Math.max(0, totalPrice - discount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={isAuthenticated ? handleBooking : () => navigate('/login', { state: { from: `/vehiculo/${id}` } })}
                                    disabled={!startDate || !endDate || bookingStatus === 'processing'}
                                    className={`w-full btn-primary py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-brand-blue/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden notranslate ${startDate && endDate ? 'hidden lg:block' : ''}`}
                                    translate="no"
                                >
                                    {bookingStatus === 'processing'
                                        ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Procesando...</span>
                                            </span>
                                        )
                                        : isAuthenticated
                                            ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Continuar</span>
                                                </span>
                                            )
                                            : 'Iniciar Sesión para Reservar'
                                    }
                                </button>

                                {/* Helpful hint */}
                                {!startDate || !endDate ? (
                                    <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Selecciona las fechas para continuar
                                    </p>
                                ) : null}
                            </div>
                        )}

                        <p className="text-center text-xs text-slate-400 mt-4">
                            Al reservar aceptas nuestros términos y condiciones.
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Summary Bar (Mobile Only) */}
            {
                startDate && endDate && bookingStatus !== 'completed' && (
                    <div
                        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-brand-blue shadow-2xl p-4 lg:hidden z-50 animate-in slide-in-from-bottom-5 notranslate"
                        translate="no"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 font-medium">Total estimado</p>
                                <div className="flex items-baseline gap-2">
                                    {discount > 0 && (
                                        <span className="text-sm text-slate-400 line-through">S/ {totalPrice.toFixed(2)}</span>
                                    )}
                                    <span className="text-2xl font-black text-brand-blue">
                                        S/ {Math.max(0, totalPrice - discount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (currentStep === 3) handleFinalizePayment();
                                    else if (isAuthenticated) handleBooking();
                                    else navigate('/login', { state: { from: `/vehiculo/${id}` } });
                                }}
                                disabled={bookingStatus === 'processing'}
                                className={`btn-primary px-6 py-3 text-sm shadow-lg hover:shadow-brand-blue/30 active:scale-95 disabled:opacity-50 flex items-center gap-2 ${currentStep === 3 && selectedPaymentMethod === 'yape' ? 'bg-[#25D366] hover:bg-[#128C7E]' : ''}`}
                            >
                                {bookingStatus === 'processing' ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Procesando...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {currentStep === 3 ? (selectedPaymentMethod === 'yape' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />) : <CheckCircle className="w-4 h-4" />}
                                        <span>
                                            {currentStep === 3 ? (selectedPaymentMethod === 'yape' ? 'Enviar' : 'Pagar') : 'Continuar'}
                                        </span>
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

// Helper for the calendar icon
const ChevronDown = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

export default DetalleVehiculo;
