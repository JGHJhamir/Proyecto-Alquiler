import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; // Added useLocation
import Navbar from '../components/Navbar';
import { CheckCircle, CreditCard, Smartphone, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';

const Payment = () => {
    const { bookingId } = useParams();
    const location = useLocation(); // Hook for passed state
    const [booking, setBooking] = useState(location.state?.booking || null);
    const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success

    // Fetch data ONLY if not provided via state (Legacy/Direct link support)
    useEffect(() => {
        if (!booking && !vehicle && bookingId !== 'demo') {
            const fetchData = async () => {
                // Fetch booking
                const { data: bookingData } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', bookingId)
                    .single();

                if (bookingData) {
                    setBooking(bookingData);
                    // Fetch vehicle
                    const { data: vehicleData } = await supabase
                        .from('vehicles')
                        .select('*')
                        .eq('id', bookingData.vehicle_id)
                        .single();
                    setVehicle(vehicleData);
                }
            };
            fetchData();
        }
    }, [bookingId, booking, vehicle]);

    const handlePayment = async () => {
        setPaymentStatus('processing');

        try {
            // Update booking status to confirmed
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', booking.id);

            if (error) throw error;

            setTimeout(() => {
                setPaymentStatus('success');
            }, 1500);

        } catch (error) {
            console.error('Payment error:', error);
            // Optionally handle error state here
            setPaymentStatus('idle');
            alert('Error al procesar el pago. Inténtalo de nuevo.');
        }
    };

    if (!booking || !vehicle) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div></div>;

    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">¡Pago Exitoso!</h1>
                <p className="text-slate-600 text-lg max-w-md mb-10">
                    Tu reserva para el <span className="font-bold text-slate-800">{vehicle.make} {vehicle.model}</span> está confirmada. Te hemos enviado los detalles a tu correo.
                </p>
                <Link to="/cliente" className="btn-primary px-8 py-3 rounded-full flex items-center gap-2">
                    Ir a Mis Reservas <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-brand-blue/20">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-10 text-center">Finalizar Reserva</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Payment Methods */}
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
                                        <span className="text-xs text-slate-500">Procesado seguro por Stripe</span>
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
                                        <span className="text-xs text-slate-500">Escanea el QR y paga al instante</span>
                                    </div>
                                    {selectedMethod === 'yape' && <div className="ml-auto w-4 h-4 rounded-full bg-purple-600"></div>}
                                </button>
                            </div>

                            {/* Simulation Message */}
                            <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm flex items-start gap-3">
                                <Lock className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    <strong>Modo Seguro:</strong> Esta es una pantalla de simulación. No se realizará ningún cargo real a tu tarjeta ni cuentas bancarias.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={paymentStatus === 'processing'}
                            className="w-full btn-primary py-5 text-lg shadow-lg hover:shadow-brand-blue/30 active:scale-[0.98] rounded-2xl"
                        >
                            {paymentStatus === 'processing' ? 'Procesando Pago...' : `Pagar S/ ${booking.total_price}`}
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-brand-blue/5 border border-slate-100 sticky top-28">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Resumen de Reserva</h3>

                            <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-40 object-cover rounded-xl mb-6" />

                            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Vehículo</span>
                                    <span className="font-bold text-slate-900 text-right">{vehicle.make} {vehicle.model}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Fechas</span>
                                    <span className="font-bold text-slate-900 text-right text-sm">
                                        {booking.start_date} <br /> al {booking.end_date}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Ubicación</span>
                                    <span className="font-bold text-slate-900 text-right">{vehicle.location_city}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-900">Total a pagar</span>
                                <span className="text-2xl font-black text-brand-blue">S/ {booking.total_price}</span>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-2 text-green-600 font-bold text-sm bg-green-50 p-2 rounded-lg">
                                <ShieldCheck className="w-4 h-4" /> Cancelación Gratuita
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
