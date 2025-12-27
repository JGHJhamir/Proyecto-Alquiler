import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../supabase';
import {
    Car, Users, Calendar, Plus, Search, BarChart3, Settings,
    X, Save, Image as ImageIcon, LayoutDashboard, Tag, ShoppingBag,
    LogOut, MoreVertical, MapPin, Filter, FileText, Briefcase, Bell, Menu,
    Waves, Trash2, Edit, Loader2
} from 'lucide-react';

const COASTAL_LOCATIONS = {
    "Tumbes": ["Tumbes", "Contralmirante Villar", "Zarumilla"],
    "Piura": ["Piura", "Talara", "Paita", "Sechura", "Sullana", "Morropón", "Ayabaca", "Huancabamba"],
    "Lambayeque": ["Chiclayo", "Lambayeque", "Ferreñafe"],
    "La Libertad": ["Trujillo", "Chepén", "Pacasmayo", "Virú", "Ascope"],
    "Ancash": ["Santa", "Casma", "Huarmey"],
    "Lima": ["Lima", "Barranca", "Cañete", "Huaral", "Huaura"],
    "Ica": ["Ica", "Chincha", "Pisco", "Nazca", "Palpa"],
    "Arequipa": ["Arequipa", "Camaná", "Islay", "Caravelí"],
    "Moquegua": ["Ilo", "Mariscal Nieto", "General Sánchez Cerro"],
    "Tacna": ["Tacna", "Jorge Basadre"]
};

const VIEW_TITLES = {
    dashboard: 'Panel de Control',
    operaciones: 'Operaciones',
    reservas: 'Reservas',
    clients: 'Gestión de Clientes',
    vehicles: 'Vehículos',
    locations: 'Ubicaciones',
    team: 'Equipo',
    promotions: 'Promociones',
    reports: 'Reportes'
};

const UserIconMap = {
    dashboard: LayoutDashboard,
    operaciones: Settings,
    reservas: Calendar,
    clients: Users,
    vehicles: Car,
    locations: MapPin,
    team: Users,
    promotions: Tag,
    reports: BarChart3
};

// --- Sub-Components ---

const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'operaciones', label: 'Operaciones', icon: Settings },
        { id: 'reservas', label: 'Reservas', icon: Calendar },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'vehicles', label: 'Vehículos', icon: Car },
        { id: 'locations', label: 'Ubicaciones', icon: MapPin },
        { id: 'team', label: 'Equipo', icon: Users },
        { id: 'promotions', label: 'Promociones', icon: Tag },
        { id: 'reports', label: 'Reportes', icon: BarChart3 },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col h-screen
            `}>
                <Link to="/" className="p-6 flex items-center gap-2 mb-2 hover:bg-slate-50 transition-colors group">
                    <div className="text-brand-blue transform group-hover:scale-110 transition-transform duration-300">
                        <Waves className="w-8 h-8" />
                    </div>
                    <span className="text-xl font-serif font-bold text-slate-900 tracking-tight group-hover:text-brand-blue transition-colors">JIAR PlayaRent</span>
                </Link>

                <nav className="flex-1 px-4 overflow-y-auto space-y-1">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-2">Panel de Control</p>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id);
                                setIsMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm
                                ${activeView === item.id
                                    ? 'bg-blue-50 text-brand-blue'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-brand-blue' : 'text-slate-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-colors font-medium text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    );
};

const VehicleFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, submitting, isEditing }) => {
    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'department') {
            setFormData(prev => ({ ...prev, department: value, province: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden md:max-h-[90vh] overflow-y-auto">
                <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Editar Vehículo' : 'Agregar Vehículo'}</h2>
                        <p className="text-slate-500 text-sm">{isEditing ? 'Modificar detalles existentes.' : 'Detalles de la nueva unidad.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-6">
                    {/* Row 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Marca</label>
                            <input type="text" name="make" required placeholder="Ej: Toyota"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                                value={formData.make} onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Modelo</label>
                            <input type="text" name="model" required placeholder="Ej: Hilux 4x4"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                                value={formData.model} onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Año</label>
                            <input type="number" name="year" required min="1900" max="2099" placeholder="2024"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                                value={formData.year} onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Row 2: Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Precio por Día</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                                <input type="number" name="price_per_day" required min="0" placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                                    value={formData.price_per_day} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Precio por Hora</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                                <input type="number" name="price_per_hour" min="0" placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                                    value={formData.price_per_hour} onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Category & Dept */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Categoría</label>
                            <div className="relative">
                                <select name="category"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.category} onChange={handleInputChange}
                                >
                                    <option value="4x4">Camioneta 4x4</option>
                                    <option value="Deportivo">Deportivo / Buggy</option>
                                    <option value="Familiar">SUV Familiar</option>
                                    <option value="Sedan">Sedán</option>
                                    <option value="Moto">Moto / Cuatrimoto</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 block">Departamento</label>
                            <div className="relative">
                                <select name="department" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.department} onChange={handleInputChange}
                                >
                                    <option value="">Selecciona...</option>
                                    {Object.keys(COASTAL_LOCATIONS).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Prov & Image */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 block">Provincia (Ciudad)</label>
                        <div className="relative">
                            <select name="province" required disabled={!formData.department}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                value={formData.province} onChange={handleInputChange}
                            >
                                <option value="">Selecciona...</option>
                                {formData.department && COASTAL_LOCATIONS[formData.department].map(prov => <option key={prov} value={prov}>{prov}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-slate-700 block">Imagen del Vehículo</label>
                            <a href="https://unsplash.com/s/photos/car" target="_blank" rel="noopener noreferrer" className="text-brand-blue text-xs font-medium hover:underline flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Buscar fotos
                            </a>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input type="url" name="image_url" required placeholder="https://..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all text-sm"
                                    value={formData.image_url} onChange={handleInputChange}
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Pega el enlace directo de la imagen (JPG, PNG, WebP).</p>
                            </div>
                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex-shrink-0 overflow-hidden bg-slate-50 flex items-center justify-center relative group">
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                    <Car className="w-8 h-8 text-slate-300" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 block">Descripción</label>
                        <textarea name="description" rows="3" placeholder="Describe las características principales..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all resize-none placeholder:text-slate-400"
                            value={formData.description} onChange={handleInputChange}></textarea>
                    </div>

                    <div className="pt-2 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl bg-brand-blue text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-brand-blue/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> {isEditing ? 'Actualizar' : 'Guardar Vehículo'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DashboardView = ({ users }) => (
    <div className="animate-fade-in-up space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ingresos Totales</span>
                        <div className="flex items-baseline gap-1 mt-2">
                            <h3 className="text-3xl font-bold text-slate-900">S/ 990.00</h3>
                        </div>
                    </div>
                    <span className="text-slate-400 font-serif italic">$</span>
                </div>
                <p className="text-xs text-slate-400">Ingresos totales históricos</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Reservas</span>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">5</h3>
                    </div>
                    <span className="text-brand-blue text-xs font-bold bg-blue-50 px-2 py-1 rounded-full">↗</span>
                </div>
                <p className="text-xs text-slate-400">En todo el historial</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Vehículos</span>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">42</h3>
                    </div>
                    <Car className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400">Flota activa actualmente</p>
            </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bar Chart Section */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-xl text-slate-900">Ingresos por Mes</h3>
                <p className="text-sm text-slate-500 mb-8">Análisis de ingresos de reservas finalizadas, en curso o confirmadas.</p>

                <div className="h-64 flex items-end gap-8 justify-center border-b border-slate-100 pb-4 relative">
                    {/* Y-Axis Labels (Simulated) */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-400">
                        <span>S/0.6k</span>
                        <span>S/0.45k</span>
                        <span>S/0.3k</span>
                        <span>S/0.15k</span>
                        <span>S/0k</span>
                    </div>

                    {/* Bars */}
                    <div className="flex flex-col items-center gap-2 group w-1/3 max-w-[120px]">
                        <div className="w-full bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-colors h-48 relative group-hover:shadow-lg">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                S/ 580
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Jul 2024</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 group w-1/3 max-w-[120px]">
                        <div className="w-full bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-colors h-40 relative group-hover:shadow-lg">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                S/ 410
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Dic 2025</span>
                    </div>
                </div>
            </div>

            {/* Donut Chart Section */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <h3 className="font-bold text-xl text-slate-900 mb-6 leading-tight">Distribución de Reservas por Estado</h3>

                <div className="flex-1 flex items-center justify-center">
                    {/* CSS Donut Chart */}
                    <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-900 border-r-transparent rotate-45 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[16px] border-brand-blue border-t-transparent border-l-transparent -rotate-12"></div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 justify-center">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Confirmada (2)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Finalizada (1)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-100"></span> En curso (1)</div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelada (1)</div>
                </div>
            </div>
        </div>
    </div>
);

const VehiclesView = ({ onAddClick, onClearDB, onDelete, onEdit, activeMenu, setActiveMenu }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVehicles = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (!error && data) setVehicles(data);
        setLoading(false);
    };

    useEffect(() => { fetchVehicles(); }, []);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Filtrar por vehículo..." className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none w-64" />
                </div>
                <div className="flex gap-3">
                    <button onClick={onClearDB} className="text-red-500 hover:text-red-700 text-xs font-semibold px-4 hover:underline transition-all">
                        Limpiar Todo
                    </button>
                    <button onClick={onAddClick} className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Añadir Vehículo
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                            <th className="px-6 py-3">Vehículo</th>
                            <th className="px-6 py-3">Categoría</th>
                            <th className="px-6 py-3">Ubicación</th>
                            <th className="px-6 py-3">Precios</th>
                            <th className="px-6 py-3 text-right">Estado</th>
                            <th className="px-4 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vehicles.map((car) => (
                            <tr key={car.id} className="hover:bg-blue-50/50 transition-colors group">
                                <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden">
                                            <img src={car.image_url} alt={car.model} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 text-sm">{car.make} {car.model}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-[120px]">{car.description || 'Sin descripción'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className="text-sm text-slate-600">{car.category}</span></td>
                                <td className="px-6 py-4 flex items-center gap-1.5 text-sm text-slate-600">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {car.location_city}
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                                    <div className="flex flex-col">
                                        {car.price_per_day > 0 && <span>S/ {car.price_per_day}/día</span>}
                                        {car.price_per_hour > 0 && <span className="text-xs text-slate-500">S/ {car.price_per_hour}/hora</span>}
                                        {!car.price_per_day && !car.price_per_hour && <span className="text-slate-400 text-xs">Sin precio</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                        Disponible
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right relative">
                                    <button onClick={() => setActiveMenu(activeMenu === car.id ? null : car.id)} className="text-slate-400 hover:text-brand-blue p-2 rounded-full hover:bg-slate-100 transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenu === car.id && (
                                        <div className="absolute right-8 top-12 w-32 bg-white rounded-lg shadow-lg border border-slate-100 z-10 overflow-hidden animate-fade-in-up">
                                            <button onClick={() => { onEdit(car); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Settings className="w-3.5 h-3.5 text-slate-400" /> Editar
                                            </button>
                                            <button onClick={() => { onDelete(car.id); setActiveMenu(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <LogOut className="w-3.5 h-3.5" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {vehicles.length === 0 && !loading && (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400 text-sm">Sin vehículos registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ClientsView = ({ users }) => (
    <div className="space-y-6 animate-fade-in-up">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6" /> Gestión de Clientes
            </h2>
            <button className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Añadir Cliente
            </button>
        </div>

        <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Filtrar por email..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none" />
            </div>
            <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                Columnas <MoreVertical className="w-3 h-3" />
            </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="p-4 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Celular</th>
                        <th className="px-6 py-3">DNI/Pasaporte</th>
                        <th className="px-6 py-3">Fecha Registro</th>
                        <th className="px-4 py-3 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                            <td className="p-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-brand-blue text-xs flex items-center justify-center font-bold border border-slate-200">
                                        {user.full_name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span className="font-medium text-slate-700 text-sm">{user.full_name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{user.email || 'email@example.com'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{user.phone || '987654321'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{user.dni || '12345678'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-right">
                                <button className="text-slate-400 hover:text-brand-blue"><MoreVertical className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-400 text-sm">No hay clientes.</td></tr>}
                </tbody>
            </table>
        </div>
        <div className="flex justify-between items-center text-xs text-slate-500 px-2">
            <span>0 de {users.length} fila(s) seleccionadas.</span>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Anterior</button>
                <button className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Siguiente</button>
            </div>
        </div>
    </div>
);

const PlaceholderView = ({ title, icon: Icon }) => (
    <div className="text-center py-20 animate-fade-in-up">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">Esta sección está en desarrollo. Pronto podrás gestionar estos datos aquí.</p>
    </div>
);

const PromotionModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isEditing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden md:max-h-[90vh] overflow-y-auto">
                <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Editar Promoción' : 'Añadir Nueva Promoción'}</h2>
                        <p className="text-slate-500 text-sm">Completa el formulario para {isEditing ? 'editar la' : 'crear una nueva'} promoción.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-6 bg-white text-slate-700">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400"
                                placeholder="Ej: Oferta de Verano"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400 h-24 resize-none"
                                placeholder="Descuento especial para..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                                <input
                                    type="text"
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400"
                                    placeholder="VERANO20"
                                    required
                                />
                            </div>
                            <div className="flex items-end pb-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active ?? true}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600">Activa</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Descuento</label>
                                <select
                                    value={formData.discount_type || 'percentage'}
                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                >
                                    <option value="percentage">Porcentaje (%)</option>
                                    <option value="fixed">Monto Fijo (S/)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                                <input
                                    type="number"
                                    value={formData.discount_value || ''}
                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400"
                                    placeholder="10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-slate-800 mb-2 mt-4">Condiciones</label>
                            <p className="text-xs text-slate-500 mb-4">Define las condiciones para esta promoción (opcional).</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vehículo</label>
                                    <select
                                        value={formData.vehicle_type_condition || 'Todos'}
                                        onChange={(e) => setFormData({ ...formData, vehicle_type_condition: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                    >
                                        <option value="Todos">Todos</option>
                                        <option value="4x4">Camionetas 4x4</option>
                                        <option value="Deportivo">Deportivos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
                                    <select
                                        value={formData.location_condition || 'Todas'}
                                        onChange={(e) => setFormData({ ...formData, location_condition: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                    >
                                        <option value="Todas">Todas</option>
                                        {Object.keys(COASTAL_LOCATIONS).map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Horas Mínimas de Alquiler</label>
                                <input
                                    type="number"
                                    value={formData.min_rental_hours || 0}
                                    onChange={(e) => setFormData({ ...formData, min_rental_hours: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio</label>
                                <input
                                    type="date"
                                    value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin</label>
                                <input
                                    type="date"
                                    value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary py-2.5 px-6 rounded-lg shadow-lg shadow-brand-blue/20 bg-brand-blue text-white font-bold hover:bg-blue-700"
                        >
                            {isEditing ? 'Actualizar Promoción' : 'Crear Promoción'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PromotionsView = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPromoId, setCurrentPromoId] = useState(null);
    const [formData, setFormData] = useState({});

    // Search and Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch Promotions
    const fetchPromotions = async () => {
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPromotions(data || []);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // Handlers
    const handleAdd = () => {
        setIsEditing(false);
        setFormData({
            is_active: true,
            discount_type: 'percentage',
            vehicle_type_condition: 'Todos',
            location_condition: 'Todas'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (promo) => {
        setIsEditing(true);
        setCurrentPromoId(promo.id);
        setFormData(promo);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta promoción?')) return;

        try {
            const { error } = await supabase.from('promotions').delete().eq('id', id);
            if (error) throw error;
            fetchPromotions();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const { error } = await supabase
                    .from('promotions')
                    .update(formData)
                    .eq('id', currentPromoId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('promotions')
                    .insert([formData]);
                if (error) throw error;
            }
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            console.error('Error saving promotion:', error);
            alert('Error al guardar: ' + error.message);
        }
    };

    // Derived Logic for Search and Pagination
    const filteredPromotions = promotions.filter(promo =>
        promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) return <div className="p-8 text-center">Cargando promociones...</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                        <Tag className="w-6 h-6" /> Gestión de Promociones
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Crea, edita y administra los descuentos y códigos promocionales.</p>
                </div>
                <button onClick={handleAdd} className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-brand-blue/20">
                    <Plus className="w-4 h-4" />
                    <span>Añadir Promoción</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filter Bar */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filtrar por nombre..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none text-slate-700"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Descuento</th>
                                <th className="px-6 py-4">Vencimiento</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.map((promo) => (
                                <tr key={promo.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900">{promo.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-brand-blue px-2 py-1 rounded-md text-xs font-mono border border-blue-100 font-bold">
                                            {promo.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">
                                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `S/ ${promo.discount_value}`}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'Indefinido'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${promo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {promo.is_active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(promo)}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-blue transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPromotions.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        {searchTerm ? 'No se encontraron promociones con ese filtro.' : 'No hay promociones registradas.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>Mostrando {filteredPromotions.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredPromotions.length)} de {filteredPromotions.length} promociones</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            <PromotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isEditing={isEditing}
            />
        </div>
    );
};

const ReportsView = () => {
    const [stats, setStats] = useState({
        topVehicles: [],
        recentBookings: [],
        totalRevenue: 0,
        totalBookings: 0,
        activeVehicles: 0,
        totalClients: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                // Parallel fetching for efficiency
                const [bookingsRes, vehiclesRes, profilesRes] = await Promise.all([
                    supabase.from('bookings').select('*, vehicles(make, model, image_url), profiles(full_name, email)').order('created_at', { ascending: false }),
                    supabase.from('vehicles').select('id', { count: 'exact', head: true }), // Get total count
                    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'client') // Get clients count
                ]);

                if (bookingsRes.error) throw bookingsRes.error;

                const bookings = bookingsRes.data || [];

                // 1. Calculate Revenue
                const revenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

                // 2. Process Top Vehicles
                const vehicleCount = {};
                bookings.forEach(b => {
                    if (b.vehicle_id && b.vehicles) {
                        const vid = b.vehicle_id;
                        if (!vehicleCount[vid]) {
                            vehicleCount[vid] = { ...b.vehicles, count: 0, id: vid };
                        }
                        vehicleCount[vid].count += 1;
                    }
                });
                const topVehicles = Object.values(vehicleCount).sort((a, b) => b.count - a.count).slice(0, 5);

                // 3. Recent Bookings
                const recentBookings = bookings.slice(0, 5); // Just top 5

                setStats({
                    topVehicles,
                    recentBookings,
                    totalRevenue: revenue,
                    totalBookings: bookings.length,
                    activeVehicles: vehiclesRes.count || 0, // Using total vehicles as proxy for "Fleet Size" or "Active Vehicles"
                    totalClients: profilesRes.count || 0
                });

            } catch (err) {
                console.error("Error loading reports:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" /> Reportes Administrativos
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ingresos Totales</span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">S/ {stats.totalRevenue.toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><span className="font-serif italic font-bold">$</span></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reservas</span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalBookings}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-brand-blue"><Calendar className="w-5 h-5" /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Flota Total</span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.activeVehicles}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Car className="w-5 h-5" /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Clientes</span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalClients}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Users className="w-5 h-5" /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Vehicles */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Vehículos Más Populares</h3>
                    <div className="space-y-4">
                        {stats.topVehicles.map((v, i) => (
                            <div key={v.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {i + 1}
                                </span>
                                <img src={v.image_url} alt={v.model} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                <div className="flex-1">
                                    <div className="font-semibold text-sm text-slate-900">{v.make} {v.model}</div>
                                    <div className="text-xs text-slate-400">{v.count} reservas</div>
                                </div>
                                <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-brand-blue h-full rounded-full" style={{ width: `${(v.count / Math.max(1, stats.topVehicles[0]?.count)) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                        {stats.topVehicles.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No hay datos suficientes.</p>}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-4">Actividad Reciente</h3>
                    <div className="space-y-0 divide-y divide-slate-50">
                        {stats.recentBookings.map((b) => (
                            <div key={b.id} className="flex items-center gap-4 py-3 hover:bg-slate-50 px-2 -mx-2 rounded-lg transition-colors">
                                <div className={`w-2 h-2 rounded-full ${b.status === 'confirmed' ? 'bg-teal-500' : b.status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-sm text-slate-900">
                                            {b.profiles?.full_name || 'Usuario desconocido'}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(b.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        Reservó <span className="font-medium">{b.vehicles?.make} {b.vehicles?.model}</span> por <span className="font-medium">S/ {b.total_price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stats.recentBookings.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sin actividad reciente.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BookingsView = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    vehicles ( make, model, image_url ),
                    profiles ( full_name, email )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdateStatus = async (bookingId, newStatus) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) return;

        setActionLoading(bookingId);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            // Optimistic update
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
            alert(`Reserva ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'} con éxito.`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6" /> Gestión de Reservas
                </h2>
                <div className="text-sm text-slate-500">
                    Total: <span className="font-bold text-slate-900">{bookings.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <th className="p-4">ID</th>
                                <th className="p-4">Vehículo</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Fechas</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-slate-400">
                                        {booking.id.slice(0, 8)}...
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={booking.vehicles?.image_url}
                                                alt={booking.vehicles?.model}
                                                className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                                            />
                                            <div>
                                                <div className="font-bold text-slate-900 whitespace-nowrap">
                                                    {booking.vehicles?.make} {booking.vehicles?.model}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-900">{booking.profiles?.full_name || 'Desconocido'}</div>
                                        <div className="text-xs text-slate-500">{booking.profiles?.email}</div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap text-slate-600">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5 text-xs"><Calendar className="w-3 h-3 text-emerald-500" /> {new Date(booking.start_date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5 text-xs"><Calendar className="w-3 h-3 text-red-400" /> {new Date(booking.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-900">
                                        S/ {booking.total_price}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            booking.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {booking.status === 'confirmed' ? 'Confirmada' :
                                                booking.status === 'pending' ? 'Pendiente' :
                                                    booking.status === 'cancelled' ? 'Cancelada' : booking.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {booking.status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                    disabled={actionLoading === booking.id}
                                                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors tooltip"
                                                    title="Confirmar Pago"
                                                >
                                                    {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            )}
                                            {booking.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                    disabled={actionLoading === booking.id}
                                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors tooltip"
                                                    title="Cancelar Reserva"
                                                >
                                                    {actionLoading === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        No hay reservas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    // User Profile for Topbar
    const [currentUser, setCurrentUser] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        make: '', model: '', year: new Date().getFullYear(), price_per_day: '', price_per_hour: '', department: '', province: '',
        category: '4x4', image_url: '', description: '', is_offer: false
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    setCurrentUser(profile || { full_name: 'Admin', email: user.email });
                }

                const { data: usersData, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setUsers(usersData || []);
            } catch (error) { console.error('Error:', error); }
            finally { setLoadingUsers(false); }
        };
        fetchData();
    }, []);

    const handleClearDatabase = async () => {
        if (!confirm('¿Estás seguro de ELIMINAR TODOS los vehículos? Esta acción no se puede deshacer.')) return;
        try {
            // Delete all rows where id is not 0 (effectively all rows)
            const { error } = await supabase.from('vehicles').delete().not('id', 'is', null);
            if (error) throw error;
            alert('¡Base de datos limpia!');
            window.location.reload();
        } catch (err) { alert('Error: ' + err.message); }
    };

    const handleDeleteVehicle = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;
        try {
            const { error } = await supabase.from('vehicles').delete().eq('id', id);
            if (error) throw error;
            alert('¡Vehículo eliminado!');
            window.location.reload();
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    };

    const handleEditVehicle = (vehicle) => {
        setEditingId(vehicle.id);

        let foundDept = '';
        for (const [dept, cities] of Object.entries(COASTAL_LOCATIONS)) {
            if (cities.includes(vehicle.location_city)) {
                foundDept = dept;
                break;
            }
        }

        setFormData({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            price_per_day: vehicle.price_per_day || '',
            price_per_hour: vehicle.price_per_hour || '',
            department: foundDept,
            province: vehicle.location_city,
            category: vehicle.category,
            image_url: vehicle.image_url,
            description: vehicle.description || '',
            is_offer: vehicle.is_offer || false
        });
        setIsModalOpen(true);
    };

    const handleSubmitVehicle = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sin sesión");

            const vehicleData = {
                make: formData.make, model: formData.model, year: parseInt(formData.year),
                price_per_day: Number(formData.price_per_day) || 0,
                price_per_hour: Number(formData.price_per_hour) || 0,
                location_city: formData.province, category: formData.category, image_url: formData.image_url,
                description: formData.description,
                is_offer: false, owner_id: user.id
            };

            if (editingId) {
                const { error } = await supabase.from('vehicles').update(vehicleData).eq('id', editingId);
                if (error) throw error;
                alert('¡Vehículo actualizado!');
            } else {
                const { error } = await supabase.from('vehicles').insert([{ ...vehicleData, rating: 5.0 }]);
                if (error) throw error;
                alert('¡Vehículo guardado!');
            }

            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ make: '', model: '', year: new Date().getFullYear(), price_per_day: '', price_per_hour: '', department: '', province: '', category: '4x4', image_url: '', description: '', is_offer: false });
            window.location.reload();
        } catch (error) { alert(error.message); }
        finally { setSubmitting(false); }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView users={users} />;
            case 'vehicles': return <VehiclesView onAddClick={() => { setEditingId(null); setFormData({ make: '', model: '', year: new Date().getFullYear(), price_per_day: '', price_per_hour: '', department: '', province: '', category: '4x4', image_url: '', description: '', is_offer: false }); setIsModalOpen(true); }} onClearDB={handleClearDatabase} onDelete={handleDeleteVehicle} onEdit={handleEditVehicle} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />;
            case 'clients': return <ClientsView users={users} />;
            case 'promotions': return <PromotionsView />;
            case 'reports': return <ReportsView />;
            case 'reservas': return <BookingsView />;
            default: return <PlaceholderView title={VIEW_TITLES[activeView]} icon={UserIconMap[activeView] || LayoutDashboard} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar activeView={activeView} setActiveView={setActiveView} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Navbar Top */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
                            {VIEW_TITLES[activeView] || activeView}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{currentUser?.full_name || 'Admin'}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">{currentUser?.role || 'Administrador'}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                                {currentUser?.full_name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>

            <VehicleFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmitVehicle}
                submitting={submitting}
                isEditing={!!editingId} // Ensure isEditing is passed correctly
            />
        </div>
    );
};

export default AdminDashboard;
