
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { FileText, Printer, TrendingUp, Calendar, Users, Car, Download, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

const ReportesView = () => {
    const [dateRange, setDateRange] = useState('month');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        revenue: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        activeVehicles: 0,
        topVehicles: [],
        topClients: [],
        transactions: []
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const getDateFilter = () => {
        const now = new Date();
        if (dateRange === 'week') {
            const lastWeek = new Date(now.setDate(now.getDate() - 7));
            return lastWeek.toISOString();
        }
        if (dateRange === 'month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            return firstDay.toISOString();
        }
        if (dateRange === 'year') {
            const firstDay = new Date(now.getFullYear(), 0, 1);
            return firstDay.toISOString();
        }
        return '2020-01-01'; // 'all'
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const startDate = getDateFilter();

            // 1. Fetch Bookings (with vehicle and profile info)
            const { data: bookings, error: bookingsError } = await supabase
                .from('bookings')
                .select(`
                    id, total_price, status, start_date, created_at,
                    vehicles (make, model, license_plate),
                    profiles (full_name, email)
                `)
                .gte('created_at', startDate)
                .order('created_at', { ascending: false });

            if (bookingsError) throw bookingsError;

            // 2. Fetch Active Vehicles Count
            const { count: vehicleCount, error: vehicleError } = await supabase
                .from('vehicles')
                .select('id', { count: 'exact', head: true })
                .eq('is_active', true);

            if (vehicleError) throw vehicleError;

            // --- Calculations ---

            // Revenue
            const revenue = bookings
                .filter(b => b.status !== 'cancelled')
                .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

            // Booking Stats
            const total = bookings.length;
            const confirmed = bookings.filter(b => b.status !== 'cancelled').length;
            const cancelled = bookings.filter(b => b.status === 'cancelled').length;

            // Top Vehicles
            const vehicleMap = {};
            bookings.forEach(b => {
                if (!b.vehicles) return;
                const key = `${b.vehicles.make} ${b.vehicles.model}`;
                if (!vehicleMap[key]) vehicleMap[key] = { name: key, count: 0, revenue: 0 };
                vehicleMap[key].count += 1;
                if (b.status !== 'cancelled') vehicleMap[key].revenue += (Number(b.total_price) || 0);
            });
            const topVehicles = Object.values(vehicleMap).sort((a, b) => b.count - a.count).slice(0, 5);

            // Top Clients
            const clientMap = {};
            bookings.forEach(b => {
                if (!b.profiles) return;
                const name = b.profiles.full_name || 'Desconocido';
                if (!clientMap[name]) clientMap[name] = { name, count: 0, spent: 0 };
                clientMap[name].count += 1;
                if (b.status !== 'cancelled') clientMap[name].spent += (Number(b.total_price) || 0);
            });
            const topClients = Object.values(clientMap).sort((a, b) => b.count - a.count).slice(0, 5);

            setData({
                revenue,
                totalBookings: total,
                confirmedBookings: confirmed,
                cancelledBookings: cancelled,
                activeVehicles: vehicleCount || 0,
                topVehicles,
                topClients,
                transactions: bookings.slice(0, 10) // Last 10
            });

        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-blue" />
            <p>Generando reporte en tiempo real...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-12 print:p-0 print:space-y-4">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Reporte Integral</h2>
                    <p className="text-slate-500 text-sm">Resumen financiero y operativo del negocio.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue p-2.5 outline-none font-medium cursor-pointer hover:bg-slate-50"
                    >
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mes</option>
                        <option value="year">Este Año</option>
                        <option value="all">Histórico Completo</option>
                    </select>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir / PDF</span>
                    </button>
                </div>
            </div>

            {/* Print Header (Only visible when printing) */}
            <div className="hidden print:block text-center border-b border-black pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wider">Reporte de Gestión</h1>
                <p className="text-sm text-gray-600 mt-1">JIAR PlayaRent - {new Date().toLocaleDateString()}</p>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:border print:shadow-none">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ingresos Totales</p>
                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                            <DollarSignIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">S/ {data.revenue.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-1">Confirmados en periodo</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:border print:shadow-none">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reservas Totales</p>
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-bold text-slate-900">{data.totalBookings}</h3>
                        <span className="text-xs font-medium text-emerald-600 mb-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {data.confirmedBookings} Ok
                        </span>
                        <span className="text-xs font-medium text-red-500 mb-1 bg-red-50 px-1.5 py-0.5 rounded">
                            {data.cancelledBookings} Cancel
                        </span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:border print:shadow-none">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Flota Activa</p>
                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Car className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{data.activeVehicles} u.</h3>
                    <p className="text-xs text-slate-400 mt-1">Disponibles para renta</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:border print:shadow-none">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ticket Promedio</p>
                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                        S/ {data.confirmedBookings > 0 ? Math.round(data.revenue / data.confirmedBookings) : 0}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Por alquiler confirmado</p>
                </div>
            </div>

            {/* Detailed Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">

                {/* Top Vehicles */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border print:shadow-none">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Car className="w-4 h-4 text-slate-500" /> Modelos Más Rentables
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Modelo</th>
                                    <th className="px-6 py-3 text-right">Alquileres</th>
                                    <th className="px-6 py-3 text-right">Ingresos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.topVehicles.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">Sin datos</td></tr>
                                ) : (
                                    data.topVehicles.map((v, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 font-medium text-slate-900">{v.name}</td>
                                            <td className="px-6 py-3 text-right">{v.count}</td>
                                            <td className="px-6 py-3 text-right font-mono">S/ {v.revenue.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Clients */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border print:shadow-none">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" /> Clientes VIP
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3 text-right">Reservas</th>
                                    <th className="px-6 py-3 text-right">Inversión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.topClients.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">Sin datos</td></tr>
                                ) : (
                                    data.topClients.map((c, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 font-medium text-slate-900">{c.name}</td>
                                            <td className="px-6 py-3 text-right">{c.count}</td>
                                            <td className="px-6 py-3 text-right font-mono">S/ {c.spent.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Transactions / Bookings - Full Width */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border print:shadow-none break-before-page">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" /> Últimas Reservas del Periodo
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Vehículo</th>
                                <th className="px-6 py-3 text-center">Estado</th>
                                <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.transactions.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No hay reservas recientes</td></tr>
                            ) : (
                                data.transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 whitespace-nowrap text-slate-500">
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 font-medium text-slate-900">
                                            {t.profiles?.full_name || 'Anónimo'}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">
                                            {t.vehicles ? `${t.vehicles.make} ${t.vehicles.model}` : 'Vehículo eliminado'}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${t.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                    t.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                                            `}>
                                                {t.status === 'confirmed' ? 'Ok' : t.status === 'cancelled' ? 'Cancel' : t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-medium text-slate-900">
                                            S/ {Number(t.total_price).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hidden print:block text-center pt-8 text-xs text-gray-400 border-t mt-8">
                <p>Reporte generado automáticamente por la plataforma JIAR PlayaRent Admin.</p>
            </div>
        </div>
    );
};

// Helper Icon Component to avoid collision
const DollarSignIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);

export default ReportesView;
