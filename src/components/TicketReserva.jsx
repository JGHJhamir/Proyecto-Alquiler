import React from 'react';
import { CheckCircle, Shield, Car, Calendar, MapPin, DollarSign, Download, MessageCircle } from 'lucide-react';

const TicketReserva = ({ booking, vehicle, user }) => {
    if (!booking || !vehicle) return null;

    const total = parseFloat(booking.total_price || 0);
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    const handleDownloadImage = async () => {
        const html2canvas = (await import('html2canvas')).default;
        const ticketElement = document.getElementById('ticket-content');

        if (ticketElement) {
            const canvas = await html2canvas(ticketElement, {
                backgroundColor: '#ffffff',
                scale: 2
            });

            const link = document.createElement('a');
            link.download = `ticket-${booking.id.slice(0, 8)}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const handleWhatsAppShare = () => {
        const statusText = booking.status === 'confirmed' ? 'CONFIRMADO' : 'PENDIENTE DE APROBACION';
        const paymentNote = booking.status === 'pending'
            ? '\n\n*IMPORTANTE:* Adjuntar comprobante de pago Yape/Plin para confirmar la reserva.'
            : '\n\nPago confirmado exitosamente.';

        const message =
            `*RESERVA - JIAR PlayaRent*\n\n` +
            `ID Reserva: ${booking.id.slice(0, 8)}\n` +
            `Cliente: ${user?.full_name || 'Usuario'}\n` +
            `Estado: ${statusText}\n\n` +
            `--- VEHICULO ---\n` +
            `${vehicle.make} ${vehicle.model} (${vehicle.year})\n` +
            `Categoria: ${vehicle.category}\n\n` +
            `--- FECHAS ---\n` +
            `Inicio: ${booking.start_date ? new Date(booking.start_date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : 'Pendiente'}\n` +
            `Fin: ${booking.end_date ? new Date(booking.end_date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : 'Pendiente'}\n\n` +
            `--- UBICACION ---\n` +
            `${vehicle.location_city}, Peru\n\n` +
            `--- PAGO ---\n` +
            `Subtotal: S/ ${subtotal.toFixed(2)}\n` +
            `IGV (18%): S/ ${igv.toFixed(2)}\n` +
            `*TOTAL: S/ ${total.toFixed(2)}*` +
            paymentNote;

        const whatsappNumber = '51954025029';
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div id="ticket-content" className="bg-white max-w-sm mx-auto p-0 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up border border-slate-100">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-blue/30 rounded-full blur-xl"></div>
                <div className="relative z-10 text-center">
                    <h2 className="text-xl font-serif font-bold tracking-wide mb-1">TICKET DIGITAL</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">{booking.id.slice(0, 8)}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 relative">
                {/* Perforated Line Effect */}
                <div className="absolute top-0 left-0 right-0 transform -translate-y-1/2 flex justify-between space-x-2 px-2">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-slate-50 rounded-full"></div>
                    ))}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center -mt-10 mb-3 relative z-10">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {booking.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                    </span>
                </div>

                {/* User Info */}
                <div className="text-center mb-6 pb-4 border-b border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Cliente</p>
                    <p className="font-bold text-slate-900">{user?.full_name || 'Usuario'}</p>
                </div>

                {/* Vehicle Section */}
                <div className="text-center mb-6">
                    <img src={vehicle.image_url} alt={vehicle.model} className="w-20 h-20 object-cover rounded-xl mx-auto mb-3 shadow-md" />
                    <h3 className="font-bold text-slate-900 text-lg">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-xs text-slate-500 font-medium">{vehicle.year} • {vehicle.category}</p>
                </div>

                {/* Details Grid */}
                <div className="space-y-4 mb-6 text-sm">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3">
                        <div className="flex items-center gap-3 text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <div className="text-xs">
                                <span className="block font-bold text-slate-700">Inicio</span>
                                {booking.start_date ? new Date(booking.start_date).toLocaleString() : '---'}
                            </div>
                        </div>
                        <div className="text-right text-xs">
                            <span className="block font-bold text-slate-700">Fin</span>
                            {booking.end_date ? new Date(booking.end_date).toLocaleString() : '---'}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-b border-dashed border-slate-100 pb-3">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <div className="text-xs">
                            <span className="block text-slate-500">Ubicación de Recogida</span>
                            <span className="font-bold text-slate-700">{vehicle.location_city}, Perú</span>
                        </div>
                    </div>
                </div>

                {/* Financials */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 mb-6 text-sm">
                    <div className="flex justify-between text-slate-500 text-xs">
                        <span>Subtotal</span>
                        <span>S/ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-xs">
                        <span>IGV (18%)</span>
                        <span>S/ {igv.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                        <span className="font-bold text-slate-900">Total Pagado</span>
                        <span className="font-black text-brand-blue text-lg">S/ {total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center space-y-3">
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-tight">
                        Conserve este ticket digital como comprobante de su reserva. Para soporte contáctenos.
                    </p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleDownloadImage}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-xs">Descargar</span>
                        </button>

                        <button
                            onClick={handleWhatsAppShare}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-green-500/50"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">WhatsApp</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Barcode Strip */}
            <div className="bg-slate-100 h-3 border-t border-dashed border-slate-300"></div>
        </div>
    );
};

export default TicketReserva;
