import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import ReportesView from '../components/ReportesView';
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    Settings,
    DollarSign,
    LogOut,
    Menu,
    Shield,
    Plus,
    X,
    Loader2,
    Briefcase,
    Activity,
    Search,
    Trash2,
    FileText
} from 'lucide-react';

// --- Componentes ---

const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: LayoutDashboard },
        { id: 'team', label: 'Gestión de Equipo', icon: Users },
        { id: 'reports', label: 'Reportes Globales', icon: FileText }
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Overlay Móvil */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Contenedor Lateral */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Área de Logo */}
                <div className="h-20 flex items-center px-8 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-amber-500">
                        <Shield className="w-8 h-8" />
                        <div>
                            <span className="font-serif text-xl font-bold tracking-tight text-white">Owner</span>
                            <span className="text-xs block text-amber-500 font-medium tracking-widest uppercase">Panel VIP</span>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id);
                                setIsMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeView === item.id
                                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-amber-400'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Perfil de Usuario y Cerrar Sesión */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                            D
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Dueño</p>
                            <p className="text-xs text-amber-500">Acceso Total</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors font-medium text-sm border border-transparent hover:border-red-900/50"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    );
};

// --- Vistas ---

const DashboardView = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        avgTicket: 0,
        growth: 0,
        monthlyRevenue: [],
        topVehicles: [],
        bookingsByStatus: { confirmed: 0, completed: 0, pending: 0, cancelled: 0 },
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Obtener todas las reservas con detalles del vehículo
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('*, vehicles(make, model, image_url)');

                // Obtener últimas 5 reservas (Actividad Reciente) con detalles del perfil
                const { data: recent } = await supabase
                    .from('bookings')
                    .select(`
                        id, total_price, status, created_at,
                        vehicles (make, model),
                        profiles (full_name)
                    `)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!bookings) return;

                // 1. Calcular Ingresos Mensuales (Últimos 6 Meses)
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                const chartData = [];
                for (let i = 5; i >= 0; i--) {
                    let m = currentMonth - i;
                    let y = currentYear;
                    if (m < 0) {
                        m += 12;
                        y -= 1;
                    }
                    chartData.push({ name: `${months[m]} ${y}`, value: 0 });
                }

                bookings.forEach(b => {
                    const validStatus = ['confirmed', 'completed'];
                    if (!validStatus.includes(b.status)) return;

                    const date = new Date(b.created_at);
                    const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
                    const index = chartData.findIndex(d => d.name === monthKey);
                    if (index !== -1) {
                        chartData[index].value += (Number(b.total_price) || 0);
                    }
                });

                // 2. Vehículos de Mayor Rendimiento
                const vehiclePerformance = {};
                bookings.forEach(b => {
                    if (!b.vehicles) return;

                    const vName = `${b.vehicles.make} ${b.vehicles.model}`;
                    if (!vehiclePerformance[vName]) {
                        vehiclePerformance[vName] = {
                            name: vName,
                            revenue: 0,
                            count: 0,
                            image: b.vehicles.image_url
                        };
                    }

                    const validStatus = ['confirmed', 'completed'];
                    if (validStatus.includes(b.status)) {
                        vehiclePerformance[vName].revenue += (Number(b.total_price) || 0);
                    }
                    vehiclePerformance[vName].count += 1;
                });

                const sortedVehicles = Object.values(vehiclePerformance)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                // 3. Estadísticas Globales
                const validStatus = ['confirmed', 'completed'];
                const validBookings = bookings.filter(b => validStatus.includes(b.status));
                const totalRev = validBookings.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
                const avg = validBookings.length ? totalRev / validBookings.length : 0;

                // 4. Contar por estado
                const byStatus = {
                    confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
                    completed: bookings?.filter(b => b.status === 'completed').length || 0,
                    pending: bookings?.filter(b => b.status === 'pending').length || 0,
                    cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0
                };

                setStats({
                    totalRevenue: totalRev,
                    avgTicket: avg,
                    growth: 12.5, // Hardcoded para demo
                    monthlyRevenue: chartData,
                    topVehicles: sortedVehicles,
                    bookingsByStatus: byStatus,
                    recentTransactions: recent || []
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

    const maxRevenue = Math.max(...stats.monthlyRevenue.map(d => d.value), 1);

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Tarjetas KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Rentabilidad Total</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">S/ {stats.totalRevenue.toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> +{stats.growth}% vs mes anterior
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Briefcase className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Ticket Promedio</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">S/ {stats.avgTicket.toFixed(0)}</h3>
                        <p className="text-xs text-slate-400 mt-2">Por reserva confirmada</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-amber-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Crecimiento</p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">+{stats.growth}%</h3>
                        <p className="text-xs text-slate-400 mt-2">Comparado con mes anterior</p>
                    </div>
                </div>
            </div>

            {/* Fila de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Ingresos Mensuales */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Ingresos Mensuales</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {stats.monthlyRevenue.map((month, i) => {
                            const heightPercent = (month.value / maxRevenue) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                                        <div
                                            className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-300 group-hover:from-amber-600 group-hover:to-amber-500 relative"
                                            style={{ height: `${heightPercent}%`, minHeight: month.value > 0 ? '8px' : '0px' }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                                                S/ {month.value.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-medium">{month.name.split(' ')[0]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Donut de Estado de Reserva */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Distribución de Reservas por Estado</h3>
                    <div className="flex-1 flex items-center justify-center">
                        {/* Gráfico de Donut SVG Dinámico */}
                        {(() => {
                            const total = stats.bookingsByStatus.confirmed + stats.bookingsByStatus.completed + stats.bookingsByStatus.pending + stats.bookingsByStatus.cancelled || 1;
                            const confirmed = stats.bookingsByStatus.confirmed;
                            const completed = stats.bookingsByStatus.completed;
                            const pending = stats.bookingsByStatus.pending;
                            const cancelled = stats.bookingsByStatus.cancelled;

                            // Calcular porcentajes
                            const confirmedPercent = (confirmed / total) * 100;
                            const completedPercent = (completed / total) * 100;
                            const pendingPercent = (pending / total) * 100;
                            const cancelledPercent = (cancelled / total) * 100;

                            // Parámetros de círculo SVG
                            const size = 200;
                            const strokeWidth = 20;
                            const radius = (size - strokeWidth) / 2;
                            const circumference = 2 * Math.PI * radius;

                            // Calcular offsets de trazo para cada segmento
                            let currentOffset = 0;
                            const segments = [
                                { percent: confirmedPercent, color: '#14b8a6', label: 'Confirmada' },
                                { percent: completedPercent, color: '#2563eb', label: 'Finalizada' },
                                { percent: pendingPercent, color: '#f59e0b', label: 'Pendiente' },
                                { percent: cancelledPercent, color: '#ef4444', label: 'Cancelada' }
                            ];

                            return (
                                <svg width={size} height={size} className="transform -rotate-90">
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="#f1f5f9"
                                        strokeWidth={strokeWidth}
                                    />
                                    {segments.map((segment, index) => {
                                        if (segment.percent === 0) return null;
                                        const dashLength = (segment.percent / 100) * circumference;
                                        const dashOffset = currentOffset;
                                        currentOffset += dashLength;

                                        return (
                                            <circle
                                                key={index}
                                                cx={size / 2}
                                                cy={size / 2}
                                                r={radius}
                                                fill="none"
                                                stroke={segment.color}
                                                strokeWidth={strokeWidth}
                                                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                                                strokeDashoffset={-dashOffset}
                                                strokeLinecap="round"
                                            />
                                        );
                                    })}
                                </svg>
                            );
                        })()}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 justify-center">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Confirmada ({stats.bookingsByStatus.confirmed})</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Finalizada ({stats.bookingsByStatus.completed})</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendiente ({stats.bookingsByStatus.pending})</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelada ({stats.bookingsByStatus.cancelled})</div>
                    </div>
                </div>
            </div>

            {/* Fila Inferior: Actividad Reciente + Top Vehículos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tabla de Actividad Reciente */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-900">Actividad Reciente</h3>
                        <p className="text-xs text-slate-500">Últimas 5 transacciones</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats.recentTransactions.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">No hay actividad reciente.</div>
                        ) : (
                            stats.recentTransactions.map((t) => (
                                <div key={t.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{t.profiles?.full_name || 'Cliente'}</p>
                                            <p className="text-xs text-slate-500">{t.vehicles?.make} {t.vehicles?.model}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold
                                            ${t.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                t.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'}`}>
                                            {t.status === 'confirmed' ? 'OK' : t.status === 'pending' ? 'Pend' : t.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
                                        <span className="font-bold text-slate-900">S/ {Number(t.total_price).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top 5 Vehículos */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-lg text-slate-900">Top 5 Vehículos</h3>
                        <p className="text-xs text-slate-500">Más rentables del periodo</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {stats.topVehicles.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">No hay datos disponibles.</div>
                        ) : (
                            stats.topVehicles.map((v, idx) => (
                                <div key={idx} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                        {v.image ? (
                                            <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-900 truncate">{v.name}</p>
                                        <p className="text-xs text-slate-500">{v.count} reservas</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-slate-900">S/ {v.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinanceView = () => {
    const [stats, setStats] = useState({
        monthlyRevenue: [],
        topVehicles: [],
        avgTicket: 0,
        totalRevenue: 0,
        growth: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                const { data: bookings } = await supabase
                    .from('bookings')
                    .select('*, vehicles(make, model, image_url)')
                    .neq('status', 'cancelled'); // Solo contar valor real

                if (!bookings) return;

                // 1. Calcular Ingresos Mensuales (Últimos 6 Meses)
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                // Inicializar últimos 6 meses con 0
                const chartData = [];
                for (let i = 5; i >= 0; i--) {
                    // Manejar lógica de cambio de año si es necesario (versión simple)
                    let m = currentMonth - i;
                    let y = currentYear;
                    if (m < 0) {
                        m += 12;
                        y -= 1;
                    }
                    const monthKey = `${months[m]} ${y}`;
                    chartData.push({ name: monthKey, value: 0 });
                }

                bookings.forEach(b => {
                    const validStatus = ['confirmed', 'completed'];
                    if (!validStatus.includes(b.status)) return;

                    const date = new Date(b.created_at);
                    const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
                    const index = chartData.findIndex(d => d.name === monthKey);
                    if (index !== -1) {
                        chartData[index].value += (Number(b.total_price) || 0);
                    }
                });

                // 2. Vehículos de Mayor Rendimiento
                const vehiclePerformance = {};
                bookings.forEach(b => {
                    if (!b.vehicles) return;
                    const vName = `${b.vehicles.make} ${b.vehicles.model}`;
                    if (!vehiclePerformance[vName]) {
                        vehiclePerformance[vName] = {
                            name: vName,
                            revenue: 0,
                            count: 0,
                            image: b.vehicles.image_url
                        };
                    }

                    const validStatus = ['confirmed', 'completed'];
                    if (validStatus.includes(b.status)) {
                        vehiclePerformance[vName].revenue += (Number(b.total_price) || 0);
                    }
                    vehiclePerformance[vName].count += 1;
                });

                const sortedVehicles = Object.values(vehiclePerformance)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                // 3. Estadísticas Globales
                const validStatus = ['confirmed', 'completed'];
                const validBookings = bookings.filter(b => validStatus.includes(b.status));
                const totalRev = validBookings.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
                const avg = validBookings.length ? totalRev / validBookings.length : 0;

                setStats({
                    monthlyRevenue: chartData,
                    topVehicles: sortedVehicles,
                    avgTicket: avg,
                    totalRevenue: totalRev,
                    growth: 12.5 // Hardcoded para demo/MVP
                });

            } catch (error) {
                console.error("Finance Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinanceData();
    }, []);

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

    const maxRevenue = Math.max(...stats.monthlyRevenue.map(d => d.value), 1);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900">Inteligencia Financiera</h2>

            {/* Fila KPI */}
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ticket Promedio</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">S/ {Math.round(stats.avgTicket)}</h3>
                    <p className="text-xs text-slate-400 mt-1">Por reserva completada</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Proyección Mes (Est.)</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">S/ {Math.round(stats.totalRevenue * 0.15)}</h3>
                    <p className="text-xs text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Tendencia positiva
                    </p>
                </div>
            </div>

            {/* Cuadrícula de Gráficos y Tablas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Ingresos Mensuales</h3>
                    <div className="h-64 flex items-end justify-between gap-4 px-4 pb-2">
                        {stats.monthlyRevenue.length > 0 ? stats.monthlyRevenue.map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="relative w-full bg-slate-100 rounded-t-lg flex items-end h-[200px] group-hover:bg-slate-200 transition-colors">
                                    <div
                                        className="w-full bg-brand-blue opacity-80 group-hover:opacity-100 transition-all duration-500 relative rounded-t-sm"
                                        style={{ height: `${(item.value / maxRevenue) * 100}%` }}
                                    >
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 whitespace-nowrap">
                                            {item.value > 0 ? `S/${item.value}` : ''}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-500">{item.name.split(' ')[0]}</span>
                            </div>
                        )) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                No hay suficientes datos para mostrar el gráfico histórico.
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Vehículos */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900 mb-6">Top Vehículos (Rentabilidad)</h3>
                    <div className="space-y-6">
                        {stats.topVehicles.map((v, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {i + 1}
                                </span>
                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                    <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{v.name}</p>
                                    <p className="text-xs text-slate-500">{v.count} reservas</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">S/ {v.revenue.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-400">Total</p>
                                </div>
                            </div>
                        ))}
                        {stats.topVehicles.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-8">No hay datos de vehículos.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeamView = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', dni: '', role: 'admin' });
    const [submitting, setSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id);
        };
        getUser();
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['admin', 'owner'])
                .order('role', { ascending: false }) // Propietarios primero usualmente
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // En una app real, esto crearía un usuario Auth vía Supabase Edge Function
            if (!confirm(`Nota: Esto creará un perfil de ${formData.role === 'owner' ? 'PROPIETARIO' : 'ADMINISTRADOR'}. ¿Continuar?`)) {
                return;
            }

            const { error } = await supabase.from('profiles').insert([{
                ...formData,
                updated_at: new Date()
            }]);

            if (error) throw error;

            alert(`¡${formData.role === 'owner' ? 'Propietario' : 'Administrador'} añadido al equipo!`);
            setIsModalOpen(false);
            setFormData({ full_name: '', email: '', phone: '', dni: '', role: 'admin' });
            fetchMembers();

        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveMember = async (id) => {
        if (id === currentUserId) {
            alert('No puedes eliminar tu propia cuenta desde aquí.');
            return;
        }
        if (!confirm('¿Estás seguro de revocar el acceso a este miembro del equipo?')) return;
        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            setMembers(members.filter(m => m.id !== id));
            alert('Acceso revocado correctamente.');
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gestión de Equipo</h2>
                    <p className="text-slate-500 text-sm">Administra propietarios y administradores del sistema.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
                >
                    <Plus className="w-4 h-4" /> Nuevo Miembro
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Nombre</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Rol</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Contacto</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">DNI</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">Cargando equipo...</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400">No hay miembros asignados.</td></tr>
                        ) : (
                            members.map(member => (
                                <tr key={member.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${member.role === 'owner' ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'}`}>
                                                {member.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-medium text-slate-900">{member.full_name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${member.role === 'owner' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                            {member.role === 'owner' ? 'PROPIETARIO' : 'ADMINISTRADOR'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-600">{member.email}</div>
                                        <div className="text-xs text-slate-400">{member.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{member.dni}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            disabled={member.id === currentUserId}
                                            className={`p-2 rounded-lg transition-colors ${member.id === currentUserId ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                            title={member.id === currentUserId ? "No puedes eliminarte a ti mismo" : "Revocar acceso"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Nuevo Miembro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Nuevo Miembro del Equipo</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateMember} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Rol Asignado</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                                        className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.role === 'admin' ? 'border-brand-blue bg-blue-50 text-brand-blue ring-2 ring-brand-blue/20' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <Briefcase className="w-4 h-4" />
                                        <span className="font-bold text-sm">Administrador</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'owner' })}
                                        className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${formData.role === 'owner' ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-bold text-sm">Propietario</span>
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    {formData.role === 'owner'
                                        ? 'Acceso total a finanzas, auditoría y gestión de equipo.'
                                        : 'Acceso a reservas, vehículos y clientes. Sin acceso a finanzas.'}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                    value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                                <input required type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                                    <input required type="tel" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">DNI</label>
                                    <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                                        value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 disabled:opacity-50">
                                    {submitting ? 'Guardando...' : 'Crear Miembro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


const AuditView = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data, error } = await supabase
                    .from('audit_logs')
                    .select('*, profiles(full_name, role)')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) {
                    console.error("Supabase audit error:", error);
                    setLogs([]);
                } else {
                    setLogs(data || []);
                }
            } catch (e) {
                console.error("Audit error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatAction = (action) => {
        const map = {
            'DELETE_VEHICLE': 'Vehículo Eliminado',
            'DELETE_VEHICLES_BULK': 'Eliminación Masiva de Vehículos',
            'CREATE_VEHICLE': 'Nuevo Vehículo Creado',
            'UPDATE_VEHICLE': 'Vehículo Actualizado',
            'DELETE_CLIENT_PROFILE': 'Perfil de Cliente Eliminado',
            'CREATE_CLIENT_PROFILE': 'Perfil de Cliente Creado',
            'UPDATE_CLIENT_PROFILE': 'Perfil de Cliente Actualizado',
            'UPDATE_BOOKING_STATUS': 'Estado de Reserva Actualizado',
            'DELETE_BOOKING': 'Reserva Eliminada',
            'DELETE_BOOKINGS_BULK': 'Eliminación Masiva de Reservas'
        };
        return map[action] || action;
    };

    const translateRole = (role) => {
        if (role === 'owner') return 'Propietario';
        if (role === 'admin') return 'Administrador';
        return 'Cliente';
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900">Auditoría del Sistema</h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                        <Shield className="w-12 h-12 mb-4 opacity-20" />
                        <p>No hay registros de auditoría aún.</p>
                        <p className="text-xs mt-2">Las acciones importantes aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors group">
                                <div className={`mt-1 p-2 rounded-lg ${log.action.includes('DELETE') ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-brand-blue'}`}>
                                    {log.action.includes('DELETE') ? <Trash2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-slate-900">
                                            {formatAction(log.action)}
                                        </p>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-4 font-mono">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Realizado por <strong className="text-slate-700">{log.profiles?.full_name || 'Usuario desconocido'}</strong> <span className="text-slate-300">•</span> {translateRole(log.profiles?.role)}
                                    </p>
                                    {log.details && (
                                        <div className="mt-2 text-[10px] bg-slate-50 border border-slate-100 p-2 rounded text-slate-500 font-mono overflow-x-auto max-w-2xl hidden group-hover:block transition-all">
                                            {JSON.stringify(log.details)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Views ---

const PanelPropietario = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [stats, setStats] = useState({ totalRevenue: 0, totalVehicles: 0, totalAdmins: 0 });

    useEffect(() => {
        // Fetch High Level Stats
        const fetchStats = async () => {
            const { data: bookings } = await supabase.from('bookings').select('total_price');
            const { count: vehiclesCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
            const { count: adminsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');

            const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

            setStats({
                totalRevenue,
                totalVehicles: vehiclesCount || 0,
                totalAdmins: adminsCount || 0
            });
        };
        fetchStats();
    }, []);

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'team': return <TeamView />;
            case 'reports': return <ReportesView />;

            default: return <div className="p-12 text-center text-slate-400">Selecciona una opción del menú</div>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar activeView={activeView} setActiveView={setActiveView} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Navbar Top */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">
                            {activeView === 'dashboard' && 'Dashboard Ejecutivo'}
                            {activeView === 'team' && 'Equipo'}
                            {activeView === 'reports' && 'Reportes Globales'}
                        </h1>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
                    <div className="max-w-6xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PanelPropietario;
