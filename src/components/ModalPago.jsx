import { X, Smartphone, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModalPago = ({ isOpen, onClose, booking, vehicle, user }) => {
    const navigate = useNavigate();

    if (!isOpen || !booking || !vehicle) return null;

    const ADMIN_PHONE = '51954025029';

    const handlePayment = async (method) => {
        try {
            if (method === 'Card') {
                onClose();
                navigate(`/pago/${booking.id}`, { state: { booking, vehicle } });
                return;
            }

            // Actualizar el estado de la reserva a 'awaiting_confirmation' para Yape/Plin
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'awaiting_confirmation' })
                .eq('id', booking.id);

            if (error) {
                console.error("Error updating booking status:", error);
                // Opcionalmente continuar o mostrar error. Continuando a WhatsApp como alternativa.
            }

            // Análisis de fecha seguro
            const formatDate = (dateStr) => {
                if (!dateStr) return 'Fecha pendiente';
                try {
                    return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                } catch (e) {
                    return dateStr;
                }
            };

            const startDate = formatDate(booking.start_date);
            const endDate = formatDate(booking.end_date);

            // Generación de contenido seguro
            const bookingId = booking.id ? booking.id.toString().slice(0, 8) : '---';
            const vehicleName = vehicle ? `${vehicle.make || ''} ${vehicle.model || ''}`.trim() : 'Vehículo';
            const userName = user?.full_name || 'Invitado';

            // Formato: "Hola soy el usuario [Nombre]..."
            const message = `Hola, soy el usuario *${userName}* y deseo completar el pago de mi reserva 📝%0A%0A` +
                `🆔 *ID Reserva:* ${bookingId}...%0A` +
                `🚘 *Vehículo:* ${vehicleName}%0A` +
                `📅 *Fechas:* ${startDate} al ${endDate}%0A` +
                `💰 *Monto a Pagar:* S/ ${booking.total_price}%0A` +
                `📲 *Método de Pago:* ${method}%0A%0A` +
                `Quedo a la espera de la confirmación.`;

            const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${message}`;
            window.open(whatsappUrl, '_blank');
            onClose();
            // Actualizar padre vía recarga o callback si se proporciona (PanelCliente debería auto-actualizarse si usa realtime o refetch)
            window.location.reload(); // Recarga simple para mostrar el nuevo estado
        } catch (error) {
            console.error("Error generating WhatsApp message:", error);
            alert("Hubo un error al generar el enlace de pago. Por favor intenta de nuevo.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Encabezado */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Finalizar Reserva</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="p-6 text-center space-y-6">
                    <div className="space-y-2">
                        <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Smartphone className="w-8 h-8 text-brand-blue" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Selecciona tu método de pago</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Elige una opción para completar tu reserva.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handlePayment('Card')}
                            className="w-full py-4 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-6 h-6" />
                            <span>Pagar con Tarjeta</span>
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase">O paga con billetera digital</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        <button
                            onClick={() => handlePayment('Yape')}
                            className="w-full py-4 rounded-xl bg-[#742284] hover:bg-[#601a6e] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Yapear S/ {booking.total_price}</span>
                        </button>

                        <button
                            onClick={() => handlePayment('Plin')}
                            className="w-full py-4 rounded-xl bg-[#00C3E3] hover:bg-[#00acc9] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Plin S/ {booking.total_price}</span>
                        </button>
                    </div>

                    <p className="text-xs text-slate-400">
                        Al pagar con tarjeta recibes confirmación inmediata. Yape/Plin requieren verificación manual.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModalPago;
