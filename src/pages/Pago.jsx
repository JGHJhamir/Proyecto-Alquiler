import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; // Added useLocation
import BarraNavegacion from '../components/BarraNavegacion';
import { CheckCircle, CreditCard, Smartphone, ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import TicketReserva from '../components/TicketReserva';

const Pago = () => {
    const { bookingId } = useParams();
    const location = useLocation();
    const [booking, setBooking] = useState(location.state?.booking || null);
    const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
    const [user, setUser] = useState(null);

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [finalPrice, setFinalPrice] = useState(0);

    // Card State
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvc: ''
    });

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').substring(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4).replace(/(\d{2})(?=\d)/g, '$1/');
        } else if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '').substring(0, 3);
        } else if (name === 'name') {
            formattedValue = value.toUpperCase();
        }

        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    };

    const validateCard = () => {
        if (selectedMethod === 'yape') return true;

        const { number, name, expiry, cvc } = cardDetails;
        if (number.replace(/\s/g, '').length !== 16) {
            alert('El número de tarjeta debe tener 16 dígitos');
            return false;
        }
        if (name.length < 3) {
            alert('Ingresa el nombre del titular');
            return false;
        }
        if (expiry.length !== 5) {
            alert('Fecha de expiración inválida (MM/AA)');
            return false;
        }
        if (cvc.length !== 3) {
            alert('CVC inválido');
            return false;
        }
        return true;
    };

    // Initial Setup & Fetch
    useEffect(() => {
        const fetchUserAndData = async () => {
            // Fetch user profile
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();
                setUser(profile || authUser);
            }

            // Set final price from location state
            if (location.state?.booking?.total_price) {
                setFinalPrice(location.state.booking.total_price);
            }

            // Fetch booking and vehicle if not in location state
            if (!booking && !vehicle && bookingId !== 'demo') {
                const { data: bookingData } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
                if (bookingData) {
                    setBooking(bookingData);
                    setFinalPrice(bookingData.total_price);
                    const { data: vehicleData } = await supabase.from('vehicles').select('*').eq('id', bookingData.vehicle_id).single();
                    setVehicle(vehicleData);
                }
            }
        };

        fetchUserAndData();
    }, [bookingId, booking, vehicle, location.state]);

    const handleApplyPromo = async () => {
        setDiscountError('');
        if (!promoCode.trim()) return;

        try {
            const { data: promo, error } = await supabase
                .from('promotions')
                .select('*')
                .eq('code', promoCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !promo) {
                setDiscountError('Código inválido o expirado.');
                setAppliedPromo(null);
                setFinalPrice(booking.total_price);
                return;
            }

            // Check details like expiration date
            if (promo.end_date && new Date(promo.end_date) < new Date()) {
                setDiscountError('Este código ha expirado.');
                return;
            }

            // Calculate Discount
            let discountAmount = 0;
            const originalPrice = parseFloat(booking.total_price);

            if (promo.discount_type === 'percentage') {
                discountAmount = (originalPrice * promo.discount_value) / 100;
            } else {
                discountAmount = promo.discount_value;
            }

            const newPrice = Math.max(0, originalPrice - discountAmount);

            setAppliedPromo({ ...promo, discountAmount });
            setFinalPrice(newPrice.toFixed(2));

        } catch (err) {
            console.error(err);
            setDiscountError('Error al validar el código.');
        }
    };

    const handlePayment = async () => {
        if (selectedMethod === 'card' && !validateCard()) return;

        setPaymentStatus('processing');

        try {
            // Determine status based on method
            // Card -> Confirmed (Auto-approved simulation)
            // Yape -> Pending (Requires Admin Approval)
            const newStatus = selectedMethod === 'card' ? 'confirmed' : 'pending';

            // Simulate Network Delay for realism
            if (selectedMethod === 'card') {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Update booking with new status and potential new price (if promo applied)
            const updateData = { status: newStatus };
            if (appliedPromo) {
                updateData.total_price = finalPrice; // Persist the discounted price
            }

            const { error } = await supabase
                .from('bookings')
                .update(updateData)
                .eq('id', booking.id);

            if (error) throw error;

            // Update local state so Ticket reflects changes immediately
            setBooking(prev => ({ ...prev, ...updateData }));

            // Success Transition
            setPaymentStatus('success');

        } catch (error) {
            console.error('Payment error:', error);
            setPaymentStatus('idle');
            alert('Error al procesar el pago. Inténtalo de nuevo.');
        }
    };

    if (!booking || !vehicle) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;



    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up pb-20">
                <div className="mb-6">
                    <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                        {selectedMethod === 'card' ? '¡Pago Confirmado!' : '¡Solicitud Recibida!'}
                    </h1>
                    <p className="text-slate-500">
                        {selectedMethod === 'card'
                            ? 'Tu reserva ha sido procesada exitosamente.'
                            : 'Tu solicitud está pendiente de aprobación.'}
                    </p>
                </div>

                {/* Digital Ticket Display */}
                <div className="mb-8 w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-300">
                    <TicketReserva booking={booking} vehicle={vehicle} user={user} />
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link to="/cliente" className="btn-primary px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20">
                        Ver Mis Reservas <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/" className="text-slate-500 text-sm font-medium hover:text-slate-800 py-2">
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-brand-blue/20">
            <BarraNavegacion />

            <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-10 text-center">Finalizar Reserva</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Payment Methods */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-brand-blue" />
                                Método de Pago
                            </h2>

                            <div className="grid gap-4">
                                <button
                                    onClick={() => setSelectedMethod('card')}
                                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${selectedMethod === 'card' ? 'border-brand-blue bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-brand-blue">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-slate-900">Tarjeta de Crédito / Débito</span>
                                        <span className="text-xs text-slate-500">Confirmación inmediata</span>
                                    </div>
                                    {selectedMethod === 'card' && <div className="ml-auto w-4 h-4 rounded-full bg-brand-blue"></div>}
                                </button>

                                <button
                                    onClick={() => setSelectedMethod('yape')}
                                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${selectedMethod === 'yape' ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-sm text-white">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-slate-900">Yape / Plin</span>
                                        <span className="text-xs text-slate-500">Requiere aprobación del admin</span>
                                    </div>
                                    {selectedMethod === 'yape' && <div className="ml-auto w-4 h-4 rounded-full bg-purple-600"></div>}
                                </button>
                            </div>

                            {/* Card Form */}
                            {selectedMethod === 'card' && (
                                <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-slate-700">Datos de la Tarjeta</h3>
                                        <div className="flex gap-2">
                                            <div className="w-8 h-5 bg-white rounded border border-slate-200"></div>
                                            <div className="w-8 h-5 bg-white rounded border border-slate-200"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Número de Tarjeta</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="number"
                                                    placeholder="0000 0000 0000 0000"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all font-mono text-slate-700"
                                                    value={cardDetails.number}
                                                    onChange={handleCardChange}
                                                    maxLength={19}
                                                />
                                                <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Titular</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="NOMBRE APELLIDO"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all uppercase"
                                                value={cardDetails.name}
                                                onChange={handleCardChange}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Expiración</label>
                                                <input
                                                    type="text"
                                                    name="expiry"
                                                    placeholder="MM/AA"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-center"
                                                    value={cardDetails.expiry}
                                                    onChange={handleCardChange}
                                                    maxLength={5}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">CVC</label>
                                                <div className="relative">
                                                    <input
                                                        type="password"
                                                        name="cvc"
                                                        placeholder="123"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all text-center"
                                                        value={cardDetails.cvc}
                                                        onChange={handleCardChange}
                                                        maxLength={3}
                                                    />
                                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Simulation Message (Only for Yape now or minimized) */}
                            {selectedMethod === 'yape' && (
                                <div className="mt-8 p-4 bg-purple-50 text-purple-800 rounded-xl text-sm flex items-start gap-3 border border-purple-100">
                                    <Smartphone className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold mb-1">Pago con Yape/Plin</p>
                                        <p className="opacity-90">Escanea el QR y tu reserva quedará pendiente de aprobación.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={paymentStatus === 'processing'}
                            className="w-full btn-primary py-5 text-lg shadow-lg hover:shadow-brand-blue/30 active:scale-[0.98] rounded-2xl flex justify-center items-center gap-3 transition-all"
                        >
                            {paymentStatus === 'processing' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando Pago...
                                </>
                            ) : (
                                <>
                                    {selectedMethod === 'card' ? <Lock className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                                    {selectedMethod === 'card' ? `Pagar S/ ${Number(finalPrice).toFixed(2)}` : 'Enviar Solicitud'}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-brand-blue/5 border border-slate-100 sticky top-28">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Resumen de Reserva</h3>

                            <div className="relative mb-6 group overflow-hidden rounded-xl">
                                <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                    <span className="text-white font-bold">{vehicle.make} {vehicle.model}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Fechas</span>
                                    <span className="font-medium text-slate-900 text-right">
                                        {booking?.start_date} <br /> al {booking?.end_date}
                                    </span>
                                </div>

                                {/* Promo Code Section */}
                                {appliedPromo ? (
                                    <div className="flex justify-between text-emerald-600 bg-emerald-50 p-2 rounded-lg mb-2">
                                        <span className="font-bold flex items-center gap-1"><Smartphone className="w-3 h-3" /> {appliedPromo.code}</span>
                                        <span className="font-bold">- S/ {appliedPromo.discountAmount.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <div className="pt-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Código Promocional"
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-blue outline-none uppercase"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                            />
                                            <button
                                                onClick={handleApplyPromo}
                                                className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                                            >
                                                Aplicar
                                            </button>
                                        </div>
                                        {discountError && <p className="text-xs text-red-500 mt-1 pl-1">{discountError}</p>}
                                    </div>
                                )}

                                {/* Financial Breakdown */}
                                <div className="pt-4 space-y-2 border-t border-dashed border-slate-200">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Subtotal</span>
                                        <span>S/ {(finalPrice / 1.18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>IGV (18%)</span>
                                        <span>S/ {(finalPrice - (finalPrice / 1.18)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                                <span className="text-slate-600 font-bold">Total a pagar</span>
                                <span className="text-2xl font-black text-brand-blue">S/ {Number(finalPrice).toFixed(2)}</span>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-green-600 font-bold text-xs bg-green-50 p-2 rounded-lg">
                                <ShieldCheck className="w-4 h-4" /> Cancelación Gratuita
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pago;
