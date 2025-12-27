import { X, Smartphone } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, booking, vehicle, user }) => {
    if (!isOpen || !booking || !vehicle) return null;

    const ADMIN_PHONE = '51954025029';

    const handlePayment = (method) => {
        const startDate = new Date(booking.start_date).toLocaleDateString();
        const endDate = new Date(booking.end_date).toLocaleDateString();

        // Format: "Hola soy el usuario [Nombre]..."
        const message = `Hola, soy el usuario *${user?.full_name || 'Invitado'}* y deseo completar el pago de mi reserva 📝%0A%0A` +
            `🆔 *ID Reserva:* ${booking.id.slice(0, 8)}...%0A` +
            `🚘 *Vehículo:* ${vehicle.make} ${vehicle.model}%0A` +
            `📅 *Fechas:* ${startDate} al ${endDate}%0A` +
            `💰 *Monto a Pagar:* S/ ${booking.total_price}%0A` +
            `📲 *Método de Pago:* ${method}%0A%0A` +
            `Quedo a la espera de la confirmación.`;

        const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        onClose(); // Optional: close modal after click or keep open
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Finalizar Reserva</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center space-y-6">
                    <div className="space-y-2">
                        <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Smartphone className="w-8 h-8 text-brand-blue" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Selecciona tu método de pago</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Para confirmar tu reserva, realiza el pago a través de Yape o Plim enviando el comprobante a nuestro WhatsApp.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handlePayment('Yape')}
                            className="w-full py-4 rounded-xl bg-[#742284] hover:bg-[#601a6e] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Yapear S/ {booking.total_price}</span>
                        </button>

                        <button
                            onClick={() => handlePayment('Plim')}
                            className="w-full py-4 rounded-xl bg-[#00C3E3] hover:bg-[#00acc9] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Plin S/ {booking.total_price}</span>
                        </button>
                    </div>

                    <p className="text-xs text-slate-400">
                        Serás redirigido a WhatsApp para enviar los detalles de tu reserva automáticamente.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
