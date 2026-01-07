import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { supabase } from '../supabase';
import VistaReportes from '../components/VistaReportes';
import {
    Car, Users, Calendar, Plus, Search, BarChart3, Settings,
    X, Save, Image as ImageIcon, LayoutDashboard, Tag, ShoppingBag,
    LogOut, MoreVertical, MapPin, Filter, FileText, Briefcase, Bell, Menu,
    Waves, Trash2, Edit, Loader2, CheckCircle, Gauge, Fuel, Lock
} from 'lucide-react';
import { COASTAL_LOCATIONS } from '../constants';
import TicketReserva from '../components/TicketReserva';
import UserManagement from '../components/UserManagement/UserManagement';



const VIEW_TITLES = {
    dashboard: 'Panel de Control',
    reservas: 'Gestión de Reservas',
    clients: 'Gestión de Usuarios',
    vehicles: 'Gestión de Vehículos',
    locations: 'Gestión de Ubicaciones',
    promotions: 'Gestión de Promociones',
    reports: 'Reporte Integral'
};

const UserIconMap = {
    dashboard: LayoutDashboard,

    reservas: Calendar,
    clients: Users,
    vehicles: Car,
    locations: MapPin,
    promotions: Tag,
    reports: BarChart3
};

// --- Sub-Componentes ---

const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reservas', label: 'Reservas', icon: Calendar },
        { id: 'clients', label: 'Usuarios', icon: Users },
        { id: 'vehicles', label: 'Vehículos', icon: Car },
        { id: 'locations', label: 'Ubicaciones', icon: MapPin },
        { id: 'promotions', label: 'Promociones', icon: Tag },
        { id: 'reports', label: 'Reporte Integral', icon: BarChart3 },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Overlay Móvil */}
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

import { CATALOGO_VEHICULOS } from '../data/datosVehiculos';

const VehicleFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, submitting, isEditing }) => {
    if (!isOpen) return null;

    // Estado para saber si estamos en modo "Manual" para cada campo
    const [customMode, setCustomMode] = useState({
        category: false,
        make: false,
        model: false,
        department: false,
        city: false
    });

    // Estado para Ubicaciones Dinámicas
    const [availableLocations, setAvailableLocations] = useState(COASTAL_LOCATIONS);

    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase.from('locations').select('*');
            if (data) {
                const newLocs = { ...COASTAL_LOCATIONS };
                data.forEach(loc => {
                    const dept = loc.department;
                    const city = loc.name;
                    if (!newLocs[dept]) newLocs[dept] = [];
                    if (!newLocs[dept].includes(city)) newLocs[dept].push(city);
                });
                setAvailableLocations(newLocs);
            }
        };
        fetchLocations();

        // Si estamos editando y el valor actual no está en el catálogo, activar modo custom automáticamente
        if (isEditing) {
            // Lógica para Vehículos
            if (formData.vehicle_type) {
                const typeData = CATALOGO_VEHICULOS[formData.vehicle_type];
                if (formData.category && (!typeData?.categories || !typeData.categories[formData.category])) {
                    setCustomMode(prev => ({ ...prev, category: true, make: true, model: true }));
                } else if (formData.make && (!typeData?.categories[formData.category]?.brands || !typeData.categories[formData.category].brands[formData.make])) {
                    setCustomMode(prev => ({ ...prev, make: true, model: true }));
                } else if (formData.model) {
                    const models = typeData?.categories[formData.category]?.brands[formData.make] || [];
                    const modelExists = models.some(m => m.name === formData.model);
                    if (!modelExists) setCustomMode(prev => ({ ...prev, model: true }));
                }
            }
            // Lógica para Ubicaciones
            if (formData.department && !availableLocations[formData.department]) {
                setCustomMode(prev => ({ ...prev, department: true, city: true }));
            } else if (formData.department && formData.city) {
                const cities = availableLocations[formData.department] || [];
                if (!cities.includes(formData.city)) {
                    setCustomMode(prev => ({ ...prev, city: true }));
                }
            } else if (!formData.department && formData.city) {
                // Si hay ciudad pero no dpto (caso custom guardado sin dpto en BD), abrir modo custom
                setCustomMode(prev => ({ ...prev, department: true, city: true }));
            }
        }
    }, [isEditing, formData.vehicle_type, availableLocations]); // Added availableLocations to dependencies

    // --- Lógica de Catálogos ---
    const currentTypeData = formData.vehicle_type ? CATALOGO_VEHICULOS[formData.vehicle_type] : null;

    const availableCategories = currentTypeData?.categories ? Object.keys(currentTypeData.categories) : [];

    // Si la categoría es custom, no hay marcas predefinidas, así que marcas también debe ser custom (o lista vacía)
    const availableBrands = !customMode.category && currentTypeData?.categories?.[formData.category]?.brands
        ? Object.keys(currentTypeData.categories[formData.category].brands)
        : [];

    const availableModels = !customMode.category && !customMode.make && currentTypeData?.categories?.[formData.category]?.brands?.[formData.make]
        ? currentTypeData.categories[formData.category].brands[formData.make]
        : [];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleTypeChange = (e) => {
        setFormData(prev => ({ ...prev, vehicle_type: e.target.value, category: '', make: '', model: '' }));
        setCustomMode(prev => ({ ...prev, category: false, make: false, model: false }));
    };

    // --- Manejadores de Categoría ---
    const handleCategoryChange = (e) => {
        const val = e.target.value;
        if (val === '__CUSTOM__') {
            setCustomMode(prev => ({ ...prev, category: true, make: true, model: true })); // Si cat es custom, hijos también prob lo sean
            setFormData(prev => ({ ...prev, category: '', make: '', model: '' }));
        } else {
            setCustomMode(prev => ({ ...prev, category: false, make: false, model: false }));
            setFormData(prev => ({ ...prev, category: val, make: '', model: '' }));
        }
    };

    // --- Manejadores de Marca ---
    const handleBrandChange = (e) => {
        const val = e.target.value;
        if (val === '__CUSTOM__') {
            setCustomMode(prev => ({ ...prev, make: true, model: true }));
            setFormData(prev => ({ ...prev, make: '', model: '' }));
        } else {
            setCustomMode(prev => ({ ...prev, make: false, model: false }));
            setFormData(prev => ({ ...prev, make: val, model: '' }));
        }
    };

    // --- Manejadores de Modelo ---
    const handleModelChange = (e) => {
        const val = e.target.value;
        if (val === '__CUSTOM__') {
            setCustomMode(prev => ({ ...prev, model: true }));
            setFormData(prev => ({ ...prev, model: '' }));
        } else {
            setCustomMode(prev => ({ ...prev, model: false }));

            // Auto-rellenar specs
            const selectedModelObj = availableModels.find(m => m.name === val);
            setFormData(prev => ({
                ...prev,
                model: val,
                ...(selectedModelObj?.specs ? {
                    passengers: selectedModelObj.specs.passengers,
                    transmission: selectedModelObj.specs.transmission,
                    fuel_type: selectedModelObj.specs.fuel_type,
                    engine_power: selectedModelObj.specs.engine_power,
                    image_url: selectedModelObj.image || prev.image_url
                } : {})
            }));
        }
    };

    // --- Manejadores de Ubicación ---
    const handleDepartmentChange = (e) => {
        const val = e.target.value;
        if (val === '__CUSTOM__') {
            setCustomMode(prev => ({ ...prev, department: true, city: true }));
            setFormData(prev => ({ ...prev, department: '', city: '' }));
        } else {
            setCustomMode(prev => ({ ...prev, department: false, city: false }));
            setFormData(prev => ({ ...prev, department: val, city: '' }));
        }
    };

    const handleCityChange = (e) => {
        const val = e.target.value;
        if (val === '__CUSTOM__') {
            setCustomMode(prev => ({ ...prev, city: true }));
            setFormData(prev => ({ ...prev, city: '' }));
        } else {
            setCustomMode(prev => ({ ...prev, city: false }));
            setFormData(prev => ({ ...prev, city: val }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden md:max-h-[90vh] overflow-y-auto">
                <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Editar Vehículo' : 'Agregar Vehículo'}</h2>
                        <p className="text-slate-500 text-sm">{isEditing ? 'Modificar ficha técnica.' : 'Selecciona o ingresa las características.'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-8">
                    {/* Sección 1: Clasificación */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Clasificación del Vehículo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tipo (Zona) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo / Zona</label>
                                <select
                                    name="vehicle_type"
                                    value={formData.vehicle_type}
                                    onChange={handleTypeChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                >
                                    <option value="playa">Zona Playa (Aventura & Mar)</option>
                                </select>
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                {!customMode.category ? (
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleCategoryChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                        disabled={!formData.vehicle_type}
                                    >
                                        <option value="">Selecciona Categoría...</option>
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="__CUSTOM__" className="font-bold text-brand-blue">+ Nueva Categoría / Otra</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            placeholder="Escribe la categoría..."
                                            className="w-full bg-white border border-brand-blue rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none shadow-sm"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setCustomMode(prev => ({ ...prev, category: false, make: false, model: false }))}
                                            className="px-3 py-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"
                                            title="Volver a lista"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Marca */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                                {!customMode.make ? (
                                    <select
                                        name="make"
                                        value={formData.make}
                                        onChange={handleBrandChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                        disabled={!formData.category}
                                    >
                                        <option value="">Selecciona Marca...</option>
                                        {availableBrands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                        {formData.category && <option value="__CUSTOM__" className="font-bold text-brand-blue">+ Nueva Marca / Otra</option>}
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="make"
                                            value={formData.make}
                                            onChange={handleInputChange}
                                            placeholder="Escribe la marca..."
                                            className="w-full bg-white border border-brand-blue rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none shadow-sm"
                                            autoFocus
                                        />
                                        {!customMode.category && (
                                            <button
                                                type="button"
                                                onClick={() => setCustomMode(prev => ({ ...prev, make: false, model: false }))}
                                                className="px-3 py-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"
                                                title="Volver a lista"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modelo */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                                {!customMode.model ? (
                                    <select
                                        name="model"
                                        value={formData.model}
                                        onChange={handleModelChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                        disabled={!formData.make}
                                    >
                                        <option value="">Selecciona Modelo...</option>
                                        {availableModels.map((modelObj, idx) => (
                                            <option key={idx} value={modelObj.name}>{modelObj.name}</option>
                                        ))}
                                        {formData.make && <option value="__CUSTOM__" className="font-bold text-brand-blue">+ Nuevo Modelo / Otro</option>}
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            placeholder="Escribe el modelo..."
                                            className="w-full bg-white border border-brand-blue rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none shadow-sm"
                                            autoFocus
                                        />
                                        {!customMode.make && (
                                            <button
                                                type="button"
                                                onClick={() => setCustomMode(prev => ({ ...prev, model: false }))}
                                                className="px-3 py-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"
                                                title="Volver a lista"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Sección 2: Especificaciones Técnicas (Ahora Auto-completadas y Bloqueadas) */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-2">
                                <Gauge className="w-4 h-4" /> Ficha Técnica
                            </h3>
                            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100 flex items-center gap-1">
                                {formData.model && <Lock className="w-3 h-3" />} Automática según modelo
                            </span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Año */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 block">Año</label>
                                <select name="year" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none"
                                    value={formData.year} onChange={handleInputChange}>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 block">Stock Disponible</label>
                                <input type="number" name="stock" min="1" required
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none"
                                    value={formData.stock || 1} onChange={handleInputChange}
                                />
                            </div>

                            {/* Pasajeros */}
                            <div className="space-y-1.5 opacity-80">
                                <label className="text-xs font-semibold text-slate-500 block flex items-center gap-2">
                                    Pasajeros {formData.model && !customMode.model && <Lock className="w-3 h-3 text-slate-400" />}
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                                    <select name="passengers"
                                        disabled={!!formData.model && !customMode.model}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none appearance-none bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 cursor-not-allowed"
                                        value={formData.passengers || 2} onChange={handleInputChange}>
                                        {[1, 2, 3, 4, 5, 7, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Transmisión */}
                            <div className="space-y-1.5 opacity-80">
                                <label className="text-xs font-semibold text-slate-500 block flex items-center gap-2">
                                    Transmisión {formData.model && !customMode.model && <Lock className="w-3 h-3 text-slate-400" />}
                                </label>
                                <select name="transmission"
                                    disabled={!!formData.model && !customMode.model}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 cursor-not-allowed"
                                    value={formData.transmission || 'Automática'} onChange={handleInputChange}>
                                    <option value="Automática">Automática</option>
                                    <option value="Semiautomática">Semiautomática</option>
                                    <option value="Mecánica">Mecánica</option>
                                    <option value="CVT">CVT</option>
                                </select>
                            </div>

                            {/* Combustible */}
                            <div className="space-y-1.5 opacity-80">
                                <label className="text-xs font-semibold text-slate-500 block flex items-center gap-2">
                                    Combustible {formData.model && !customMode.model && <Lock className="w-3 h-3 text-slate-400" />}
                                </label>
                                <div className="relative">
                                    <Fuel className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                                    <select name="fuel_type"
                                        disabled={!!formData.model && !customMode.model}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none appearance-none bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 cursor-not-allowed"
                                        value={formData.fuel_type || 'Gasolina'} onChange={handleInputChange}>
                                        <option value="Gasolina">Gasolina</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Eléctrico">Eléctrico</option>
                                        <option value="Híbrido">Híbrido</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Potencia / Motor */}
                        <div className="space-y-1.5 opacity-80 pt-2">
                            <label className="text-xs font-semibold text-slate-500 block flex items-center gap-2">
                                Potencia / Motor {formData.model && !customMode.model && <Lock className="w-3 h-3 text-slate-400" />}
                            </label>
                            <input
                                type="text"
                                name="engine_power"
                                disabled={!!formData.model && !customMode.model}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 cursor-not-allowed"
                                value={formData.engine_power || ''}
                                placeholder="Ej: 400 HP"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Sección 3: Ubicación y Costos */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Ubicación y Costos
                        </h3>
                        {/* Ubicación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">Departamento</label>
                                {!customMode.department ? (
                                    <select name="department" required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue outline-none transition-all cursor-pointer"
                                        value={formData.department}
                                        onChange={handleDepartmentChange}
                                    >
                                        <option value="">Selecciona...</option>
                                        {Object.keys(availableLocations).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                        <option value="__CUSTOM__" className="font-bold text-brand-blue">+ Nueva Ubicación</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            placeholder="Ingresa departamento..."
                                            className="w-full bg-white border border-brand-blue rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none shadow-sm"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setCustomMode(prev => ({ ...prev, department: false, city: false }))}
                                            className="px-3 py-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"
                                            title="Volver a lista"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">Ciudad / Playa</label>
                                {!customMode.city ? (
                                    <select name="city" required disabled={!formData.department}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue outline-none transition-all cursor-pointer disabled:opacity-50"
                                        value={formData.city || ''}
                                        onChange={handleCityChange}
                                    >
                                        <option value="">Selecciona...</option>
                                        {formData.department && availableLocations[formData.department]?.map(city => <option key={city} value={city}>{city}</option>)}
                                        {formData.department && <option value="__CUSTOM__" className="font-bold text-brand-blue">+ Nueva Ciudad/Playa</option>}
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Ingresa ciudad/playa..."
                                            className="w-full bg-white border border-brand-blue rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none shadow-sm"
                                            autoFocus
                                        />
                                        {!customMode.department && (
                                            <button
                                                type="button"
                                                onClick={() => setCustomMode(prev => ({ ...prev, city: false }))}
                                                className="px-3 py-2 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200"
                                                title="Volver a lista"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Precios */}
                        {/* Precios */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">
                                    Precio por Hora
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">S/</span>
                                    <input type="number" name="price_per_hour" min="0" placeholder="0.00"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue outline-none transition-all placeholder:text-slate-400"
                                        value={formData.price_per_hour} onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Imagen */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-slate-700 block">Imagen del Vehículo</label>
                            <a href="https://unsplash.com/s/photos/vehicle" target="_blank" rel="noopener noreferrer" className="text-brand-blue text-xs font-medium hover:underline flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Buscar fotos
                            </a>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <input type="url" name="image_url" required placeholder="https://..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm"
                                    value={formData.image_url} onChange={handleInputChange}
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Pega el enlace directo o usa una imagen de muestra.</p>
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

                    {/* Descripción - Sugerencia auto-generada */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-slate-700 block">Descripción</label>
                            <button type="button"
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    description: `Disfruta de este ${prev.make} ${prev.model} (${prev.year}) en ${prev.city || 'la playa'}. Ideal para ${prev.passengers} personas. Potencia de ${prev.engine_power || 'alto rendimiento'}.`
                                }))}
                                className="text-xs text-brand-blue font-semibold hover:underline"
                            >
                                Generar Automática
                            </button>
                        </div>
                        <textarea name="description" rows="3" placeholder="Describe las características principales..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-blue outline-none transition-all resize-none placeholder:text-slate-400"
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
            </div >
        </div >
    );
};



const DashboardView = ({ users }) => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalVehicles: 0,
        bookingsByStatus: { confirmed: 0, completed: 0, active: 0, cancelled: 0 },
        monthlyRevenue: [] // Array of { month, year, revenue }
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Obtener todas las reservas con created_at para análisis temporal
                const { data: bookings } = await supabase.from('bookings').select('total_price, status, created_at');

                // Obtener todos los vehículos
                const { data: vehicles } = await supabase.from('vehicles').select('id');

                // Calcular estadísticas
                // Solo contar ingresos de 'confirmada' o 'finalizada'
                const validRevenueStatus = ['confirmed', 'completed'];
                const totalRevenue = bookings?.filter(b => validRevenueStatus.includes(b.status)).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) || 0;
                const totalBookings = bookings?.length || 0;
                const totalVehicles = vehicles?.length || 0;

                // Contar por estado
                const byStatus = {
                    confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
                    completed: bookings?.filter(b => b.status === 'completed').length || 0,
                    active: bookings?.filter(b => b.status === 'active').length || 0,
                    cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0
                };

                // Calcular Ingresos Mensuales (Últimos 6 Meses)
                const monthlyData = {};
                const today = new Date();
                const months = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // YYYY-M
                    // Etiqueta: "Ene", "Feb", etc.
                    const monthName = d.toLocaleString('es-PE', { month: 'short' });
                    monthlyData[key] = {
                        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        year: d.getFullYear(),
                        revenue: 0,
                        key: key
                    };
                    months.push(key);
                }

                bookings?.forEach(b => {
                    const validRevenueStatus = ['confirmed', 'completed'];
                    if (!validRevenueStatus.includes(b.status)) return;

                    const d = new Date(b.created_at);
                    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
                    if (monthlyData[key]) {
                        monthlyData[key].revenue += Number(b.total_price) || 0;
                    }
                });

                setStats({
                    totalRevenue,
                    totalBookings,
                    totalVehicles,
                    bookingsByStatus: byStatus,
                    monthlyRevenue: Object.values(monthlyData)
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ingresos Totales</span>
                            <div className="flex items-baseline gap-1 mt-2">
                                <h3 className="text-3xl font-bold text-slate-900">S/ {stats.totalRevenue.toFixed(2)}</h3>
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
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalBookings}</h3>
                        </div>
                        <span className="text-brand-blue text-xs font-bold bg-blue-50 px-2 py-1 rounded-full">↗</span>
                    </div>
                    <p className="text-xs text-slate-400">En todo el historial</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Vehículos</span>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalVehicles}</h3>
                        </div>
                        <Car className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400">Flota activa actualmente</p>
                </div>
            </div>

            {/* Fila de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sección de Gráfico de Barras */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-xl text-slate-900">Ingresos por Mes</h3>
                    <p className="text-sm text-slate-500 mb-8">Análisis de ingresos de reservas finalizadas, en curso o confirmadas.</p>

                    <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
                        {/* Líneas Eje Y */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            <div className="border-t border-slate-50 w-full h-full"></div>
                            <div className="border-t border-slate-50 w-full h-full"></div>
                            <div className="border-t border-slate-50 w-full h-full"></div>
                            <div className="border-t border-slate-50 w-full h-full"></div>
                        </div>

                        {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                            stats.monthlyRevenue.map((item, index) => {
                                // Encontrar ingreso máximo para escalar
                                const maxRev = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 100); // Avoid div by zero
                                const heightPercent = (item.revenue / maxRev) * 100;

                                return (
                                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                                            S/ {item.revenue.toLocaleString()}
                                        </div>
                                        {/* Barra */}
                                        <div
                                            className="w-full max-w-[40px] bg-brand-blue rounded-t-lg transition-all duration-500 hover:bg-blue-600 relative overflow-hidden"
                                            style={{ height: `${Math.max(heightPercent, 2)}%` }} // Min 2% height
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>
                                        {/* Etiqueta */}
                                        <p className="text-xs text-slate-400 mt-2 font-medium">{item.label}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                No hay datos suficientes
                            </div>
                        )}
                    </div>
                </div>

                {/* Sección de Gráfico de Donut */}
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="font-bold text-xl text-slate-900 mb-6 leading-tight">Distribución de Reservas por Estado</h3>

                    <div className="flex-1 flex items-center justify-center">
                        {/* Gráfico de Donut SVG Dinámico */}
                        {(() => {
                            const total = stats.totalBookings || 1;
                            const confirmed = stats.bookingsByStatus.confirmed;
                            const completed = stats.bookingsByStatus.completed;
                            const active = stats.bookingsByStatus.active;
                            const cancelled = stats.bookingsByStatus.cancelled;

                            // Calcular porcentajes y ángulos
                            const confirmedPercent = (confirmed / total) * 100;
                            const completedPercent = (completed / total) * 100;
                            const activePercent = (active / total) * 100;
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
                                { percent: activePercent, color: '#e2e8f0', label: 'En curso' },
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

                    <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 justify-center">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Confirmada ({stats.bookingsByStatus.confirmed})</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Finalizada ({stats.bookingsByStatus.completed})</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-100"></span> En curso ({stats.bookingsByStatus.active})</div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelada ({stats.bookingsByStatus.cancelled})</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VehiclesView = ({ onAddClick, onFixImages, onDelete, onDeleteMultiple, onEdit, activeMenu, setActiveMenu }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState({
        vehicle: true, category: true, location: true, prices: true, status: true
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVehicles = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (!error && data) setVehicles(data);
        setLoading(false);
    };

    useEffect(() => { fetchVehicles(); }, []);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedVehicles(vehicles.map(v => v.id));
        } else {
            setSelectedVehicles([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedVehicles.includes(id)) {
            setSelectedVehicles(selectedVehicles.filter(vId => vId !== id));
        } else {
            setSelectedVehicles([...selectedVehicles, id]);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filtrar por vehículo..."
                        className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    {selectedVehicles.length > 0 && (
                        <button
                            onClick={() => { onDeleteMultiple(selectedVehicles); setSelectedVehicles([]); }}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg animate-fade-in"
                        >
                            <Trash2 className="w-4 h-4" /> Eliminar ({selectedVehicles.length})
                        </button>
                    )}


                    <div className="relative">
                        <button onClick={() => setShowColumnMenu(!showColumnMenu)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                            Columnas <MoreVertical className="w-4 h-4" />
                        </button>
                        {showColumnMenu && (
                            <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-2 animate-fade-in-up">
                                <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Mostrar</div>
                                {Object.entries({
                                    category: 'Categoría',
                                    location: 'Ubicación',
                                    prices: 'Precios',
                                    status: 'Estado'
                                }).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-sm text-slate-700 select-none">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[key]}
                                            onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                                            className="rounded border-slate-300 w-4 h-4 accent-brand-blue"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={onAddClick} className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Añadir Vehículo
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 w-8">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 w-4 h-4 accent-brand-blue cursor-pointer"
                                    onChange={handleSelectAll}
                                    checked={vehicles.length > 0 && selectedVehicles.length === vehicles.length}
                                />
                            </th>
                            <th className="px-6 py-3">Vehículo</th>
                            {visibleColumns.category && <th className="px-6 py-3">Categoría</th>}
                            {visibleColumns.location && <th className="px-6 py-3">Ubicación</th>}
                            {visibleColumns.prices && <th className="px-6 py-3">Precios</th>}
                            {visibleColumns.status && <th className="px-6 py-3 text-right">Estado</th>}
                            <th className="px-4 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredVehicles.map((car) => (
                            <tr key={car.id} className={`hover:bg-blue-50/50 transition-colors group ${selectedVehicles.includes(car.id) ? 'bg-blue-50/30' : ''}`}>
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 w-4 h-4 accent-brand-blue cursor-pointer"
                                        checked={selectedVehicles.includes(car.id)}
                                        onChange={() => handleSelectOne(car.id)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden">
                                            <img
                                                src={car.image_url}
                                                alt={car.model}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900 text-sm">{car.make} {car.model}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-[120px]">{car.description || 'Sin descripción'}</div>
                                        </div>
                                    </div>
                                </td>
                                {visibleColumns.category && <td className="px-6 py-4"><span className="text-sm text-slate-600">{car.category}</span></td>}
                                {visibleColumns.location && (
                                    <td className="px-6 py-4 flex items-center gap-1.5 text-sm text-slate-600">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {car.location_city}
                                    </td>
                                )}
                                {visibleColumns.prices && (
                                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                                        <div className="flex flex-col">
                                            {car.price_per_hour > 0 ? <span>S/ {Math.round(car.price_per_hour)}/hora</span> : <span className="text-slate-400 text-xs">Sin precio</span>}
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.status && (
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                            Disponible
                                        </span>
                                    </td>
                                )}
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
                                        {CATALOGO_VEHICULOS.playa && Object.keys(CATALOGO_VEHICULOS.playa.categories).map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
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

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        name: true, code: true, discount: true, expiry: true, status: true, actions: true
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);



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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none text-slate-700"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnMenu(!showColumnMenu)}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                        >
                            Columnas <MoreVertical className="w-4 h-4" />
                        </button>
                        {showColumnMenu && (
                            <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-2 animate-fade-in-up">
                                <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Mostrar</div>
                                {Object.entries({
                                    name: 'Nombre',
                                    code: 'Código',
                                    discount: 'Descuento',
                                    expiry: 'Vencimiento',
                                    status: 'Estado'
                                }).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-sm text-slate-700 select-none">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[key]}
                                            onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                                            className="rounded border-slate-300 w-4 h-4 accent-brand-blue"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Nombre</th>
                                {visibleColumns.code && <th className="px-6 py-4">Código</th>}
                                {visibleColumns.discount && <th className="px-6 py-4">Descuento</th>}
                                {visibleColumns.expiry && <th className="px-6 py-4">Vencimiento</th>}
                                {visibleColumns.status && <th className="px-6 py-4">Estado</th>}
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.map((promo) => (
                                <tr key={promo.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900">{promo.name}</td>
                                    {visibleColumns.code && (
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-brand-blue px-2 py-1 rounded-md text-xs font-mono border border-blue-100 font-bold">
                                                {promo.code}
                                            </span>
                                        </td>
                                    )}
                                    {visibleColumns.discount && (
                                        <td className="px-6 py-4 font-bold text-emerald-600">
                                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `S/ ${promo.discount_value}`}
                                        </td>
                                    )}
                                    {visibleColumns.expiry && (
                                        <td className="px-6 py-4 text-slate-600">
                                            {promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'Indefinido'}
                                        </td>
                                    )}
                                    {visibleColumns.status && (
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${promo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {promo.is_active ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                    )}
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



const BookingsView = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // New State for Redesign
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // Keeping this for logic but maybe moving UI
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        vehicle: true, client: true, dates: true, total: true, status: true, actions: true
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    vehicles ( make, model, image_url, year ),
                    profiles ( full_name, phone, dni )
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

    const handleUpdateStatus = async (id, newStatus) => {
        if (!confirm(`¿Estás seguro de cambiar el estado a "${newStatus === 'confirmed' ? 'Confirmado' : newStatus === 'cancelled' ? 'Cancelado' : 'Finalizado'}"?`)) return;

        setActionLoading(id);
        try {
            // Check for Double Booking when activating
            if (newStatus === 'confirmed') {
                const targetBooking = bookings.find(b => b.id === id);
                if (targetBooking) {
                    const { data: candidateConflicts } = await supabase
                        .from('bookings')
                        .select('*')
                        .eq('vehicle_id', targetBooking.vehicle_id)
                        .eq('status', 'confirmed');

                    if (candidateConflicts && candidateConflicts.length > 0) {
                        const hasOverlap = candidateConflicts.some(existing => {
                            if (existing.id === id) return false;
                            const existingStart = new Date(existing.start_date);
                            const existingEnd = new Date(existing.end_date);
                            const targetStart = new Date(targetBooking.start_date);
                            const targetEnd = new Date(targetBooking.end_date);
                            return targetStart <= existingEnd && targetEnd >= existingStart;
                        });

                        if (hasOverlap) {
                            throw new Error('❌ CONFLICTO: Ya existe una reserva CONFIRMADA para este vehículo en esas fechas.');
                        }
                    }
                }
            }

            const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            await logAction('UPDATE_BOOKING_STATUS', { booking_id: id, new_status: newStatus });

            setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
            alert('Estado actualizado correctamente.');
        } catch (error) {
            alert('Error al actualizar: ' + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!confirm('¿Estás seguro de ELIMINAR permanentemente esta reserva?')) return;
        setActionLoading(id);
        try {
            const { error } = await supabase.from('bookings').delete().eq('id', id);
            if (error) throw error;
            await logAction('DELETE_BOOKING', { booking_id: id });
            setBookings(bookings.filter(b => b.id !== id));
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        } finally {
            setActionLoading(null);
        }
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (!confirm(`¿Eliminar ${selectedIds.length} reservas seleccionadas?`)) return;
        try {
            const { error } = await supabase.from('bookings').delete().in('id', selectedIds);
            if (error) throw error;
            await logAction('DELETE_BOOKINGS_BULK', { count: selectedIds.length, ids: selectedIds });
            setBookings(bookings.filter(b => !selectedIds.includes(b.id)));
            setSelectedIds([]);
        } catch (e) {
            alert(e.message);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(bookings.map(b => b.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    // Filtering and Pagination Logic
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (b.profiles?.full_name?.toLowerCase().includes(searchLower) || '') ||
            (b.vehicles?.model?.toLowerCase().includes(searchLower) || '') ||
            (b.vehicles?.make?.toLowerCase().includes(searchLower) || '');
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Initial reset when filter changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    // Status Badge
    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
            confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
            cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
            completed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
            cancellation_requested: 'bg-pink-50 text-pink-700 ring-1 ring-pink-600/20'
        };
        const labels = {
            pending: 'Pendiente',
            confirmed: 'Confirmado',
            cancelled: 'Cancelado',
            completed: 'Finalizado',
            cancellation_requested: 'Solicitud Cancelación'
        };
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6" /> Gestión de Reservas
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Administra todas las solicitudes y reservas de vehículos.</p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o vehículo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-brand-blue outline-none cursor-pointer"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="confirmed">Confirmados</option>
                            <option value="completed">Finalizados</option>
                            <option value="cancelled">Cancelados</option>
                            <option value="cancellation_requested">Solicitudes de Cancelación</option>
                        </select>

                        {selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar ({selectedIds.length})
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setShowColumnMenu(!showColumnMenu)}
                                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2 whitespace-nowrap"
                            >
                                Columnas <MoreVertical className="w-4 h-4" />
                            </button>
                            {showColumnMenu && (
                                <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-2 animate-fade-in-up">
                                    <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Mostrar</div>
                                    {Object.entries({
                                        vehicle: 'Vehículo',
                                        client: 'Cliente',
                                        dates: 'Fechas',
                                        total: 'Total',
                                        status: 'Estado'
                                    }).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-sm text-slate-700 select-none">
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns[key]}
                                                onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                                                className="rounded border-slate-300 w-4 h-4 accent-brand-blue"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="p-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 w-4 h-4 accent-brand-blue cursor-pointer"
                                        onChange={handleSelectAll}
                                        checked={paginatedBookings.length > 0 && selectedIds.length === paginatedBookings.length}
                                    />
                                </th>
                                <th className="px-6 py-4">Vehículo</th>
                                {visibleColumns.client && <th className="px-6 py-4">Cliente</th>}
                                {visibleColumns.dates && <th className="px-6 py-4">Fechas</th>}
                                {visibleColumns.total && <th className="px-6 py-4">Total</th>}
                                {visibleColumns.status && <th className="px-6 py-4">Estado</th>}
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedBookings.map((booking) => (
                                <tr key={booking.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(booking.id) ? 'bg-blue-50/30' : ''}`}>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 w-4 h-4 accent-brand-blue cursor-pointer"
                                            checked={selectedIds.includes(booking.id)}
                                            onChange={() => handleSelectOne(booking.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                                <img src={booking.vehicles?.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{booking.vehicles?.make} {booking.vehicles?.model}</div>
                                                <div className="text-xs text-slate-500">{booking.vehicles?.year}</div>
                                                {/* Cancellation Reason Alert */}
                                                {booking.status === 'cancellation_requested' && (
                                                    <div className="mt-2 p-2 bg-pink-50 border border-pink-100 rounded-lg text-xs text-pink-800 max-w-[200px]">
                                                        <span className="font-bold">Motivo:</span> {booking.cancellation_reason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {visibleColumns.client && (
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 text-sm">{booking.profiles?.full_name || 'Desconocido'}</div>
                                        </td>
                                    )}
                                    {visibleColumns.dates && (
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600 flex flex-col">
                                                <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span>
                                                <span className="text-slate-400">al {new Date(booking.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                    )}
                                    {visibleColumns.total && (
                                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                                            S/ {Number(booking.total_price).toFixed(2)}
                                        </td>
                                    )}
                                    {visibleColumns.status && (
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {booking.status === 'cancellation_requested' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                        className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-xs font-medium mr-1"
                                                        title="Rechazar y mantener reserva"
                                                    >
                                                        Rechazar
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                        className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors text-xs font-medium"
                                                        title="Aprobar Cancelación"
                                                    >
                                                        Aprobar
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                                disabled={actionLoading === booking.id}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Aprobar"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                                disabled={actionLoading === booking.id}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Rechazar"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                                        >
                                                            Finalizar
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        disabled={actionLoading === booking.id}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>

                                </tr>
                            ))}
                            {paginatedBookings.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p className="text-sm">No se encontraron reservas con estos filtros.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
                    <span>
                        Mostrando {bookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} de {filteredBookings.length} reservas
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div >

            {/* Ticket Modal */}
            {
                selectedTicket && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in slide-in-from-bottom-4 duration-300">
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                            <div className="p-6">
                                <TicketReserva
                                    booking={selectedTicket}
                                    vehicle={selectedTicket.vehicles}
                                    user={selectedTicket.profiles}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const LocationsView = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Column Visibility
    const [visibleColumns, setVisibleColumns] = useState({
        name: true, region: true, actions: true
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', department: '' });
    const [isCustomRegion, setIsCustomRegion] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const { data, error } = await supabase.from('locations').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setLocations(data || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return;
        try {
            const { error } = await supabase.from('locations').delete().eq('id', id);
            if (error) throw error;
            setLocations(locations.filter(l => l.id !== id));
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase.from('locations').insert([{
                name: formData.name,
                department: formData.department
            }]);

            if (error) throw error;

            await fetchLocations();
            setIsModalOpen(false);
            setFormData({ name: '', department: '' });
            setIsCustomRegion(false);
            alert('Ubicación agregada correctamente.');
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter and Pagination
    const filteredLocations = locations.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
    const paginatedLocations = filteredLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="w-6 h-6" /> Gestión de Ubicaciones
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Añade, edita y administra las playas y lugares disponibles.</p>
                    </div>
                    <button
                        onClick={() => { setIsModalOpen(true); setIsCustomRegion(false); setFormData({ name: '', department: '' }); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="w-4 h-4" /> Añadir Ubicación
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filtrar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-brand-blue outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnMenu(!showColumnMenu)}
                            className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                        >
                            Columnas <MoreVertical className="w-4 h-4" />
                        </button>
                        {showColumnMenu && (
                            <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-2 animate-fade-in-up">
                                <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Mostrar</div>
                                {Object.entries({
                                    region: 'Región'
                                }).map(([key, label]) => (
                                    <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer text-sm text-slate-700 select-none">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[key]}
                                            onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                                            className="rounded border-slate-300 w-4 h-4 accent-brand-blue"
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="p-4 w-10 text-center">
                                    <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-brand-blue cursor-pointer" />
                                </th>
                                <th className="px-6 py-4">Nombre</th>
                                {visibleColumns.region && <th className="px-6 py-4">Región</th>}
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedLocations.map((loc) => (
                                <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-center">
                                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 accent-brand-blue cursor-pointer" />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{loc.name}</td>
                                    {visibleColumns.region && <td className="px-6 py-4 text-slate-600">{loc.department}</td>}
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(loc.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paginatedLocations.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-slate-400">
                                        No hay ubicaciones registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                    <span>
                        Mostrando {paginatedLocations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredLocations.length)} de {filteredLocations.length} filas
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Location Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Añadir Nueva Ubicación</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Máncora"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-blue outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Región</label>
                                {!isCustomRegion ? (
                                    <select
                                        required
                                        value={formData.department}
                                        onChange={(e) => {
                                            if (e.target.value === '__CUSTOM__') {
                                                setIsCustomRegion(true);
                                                setFormData({ ...formData, department: '' });
                                            } else {
                                                setFormData({ ...formData, department: e.target.value });
                                            }
                                        }}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-brand-blue outline-none transition-all bg-white"
                                    >
                                        <option value="">Selecciona una región</option>
                                        {Object.keys(COASTAL_LOCATIONS).map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                        <option value="__CUSTOM__" className="font-bold text-brand-blue">+ Nueva Región / Otra</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="Ingresa nueva región..."
                                            className="w-full px-4 py-2 rounded-lg border border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all shadow-sm"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setIsCustomRegion(false); setFormData({ ...formData, department: '' }); }}
                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                                            title="Volver a lista"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70"
                                >
                                    {submitting ? 'Guardando...' : 'Crear Ubicación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// (ReportesView logic moved to shared component)

// Helper for Audit Logging
const logAction = async (action, details) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("audit_logs").insert([{
                user_id: user.id,
                action,
                details
            }]);
        }
    } catch (e) { console.error("Log failed", e); }
};

const PanelAdministrador = () => {
    const [activeView, setActiveView] = useState('dashboard');
    // const [users, setUsers] = useState([]); <--- REMOVED
    // const [loadingUsers, setLoadingUsers] = useState(true); <--- REMOVED
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [activeMenu, setActiveMenu] = useState(null);

    // User Profile for Topbar
    const [currentUser, setCurrentUser] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        make: '', model: '', year: new Date().getFullYear(), price_per_hour: '', department: '', province: '',
        category: '4x4', image_url: '', description: '', is_offer: false
    });

    // Client Form State REMOVED

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                    setCurrentUser(profile || { full_name: 'Admin', email: user.email });
                }

                // Users fetching removed - handled by UserManagement
            } catch (error) { console.error('Error:', error); }
        };
        fetchData();
    }, []);



    const handleDeleteVehicle = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este vehículo?')) return;
        try {
            // Cascade delete for single vehicle
            const { error: bookingError } = await supabase.from('bookings').delete().eq('vehicle_id', id);
            if (bookingError) throw new Error('No se pudieron borrar las reservas asociadas: ' + bookingError.message);

            const { error } = await supabase.from('vehicles').delete().eq('id', id);
            if (error) throw error;
            await logAction('DELETE_VEHICLE', { vehicle_id: id });
            alert('¡Vehículo eliminado!');
            window.location.reload();
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    };

    const handleDeleteMultipleVehicles = async (ids) => {
        if (!confirm(`¿Estás seguro de eliminar ${ids.length} vehículos seleccionados?`)) return;
        try {
            // Cascade delete for multiple vehicles
            const { error: bookingError } = await supabase.from('bookings').delete().in('vehicle_id', ids);
            if (bookingError) throw new Error('No se pudieron borrar las reservas asociadas: ' + bookingError.message);
            if (bookingError) throw bookingError;

            const { error: vehicleError } = await supabase.from('vehicles').delete().in('id', ids);
            if (vehicleError) throw vehicleError;

            await logAction('DELETE_VEHICLES_BULK', { count: ids.length, ids });

            alert('¡Vehículos eliminados correctamente!');
            window.location.reload();
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    };








    const handleFixImages = async () => {
        if (!confirm('¿Quieres intentar reparar las imágenes faltantes o rotas basándote en el modelo del vehículo?')) return;
        setSubmitting(true);
        try {
            // 1. Fetch all vehicles
            const { data: vehicles, error } = await supabase.from('vehicles').select('*');
            if (error) throw error;

            const VEHICLE_TEMPLATES = [
                { make: 'Toyota', model: 'Hilux 4x4', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Kia', model: 'Picanto', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Jeep', model: 'Wrangler Rubicon', image_url: 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Hyundai', model: 'H1', image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Yamaha', model: 'Waverunner FX', image_url: 'https://images.unsplash.com/photo-1564052357774-6d9b4db74288?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Mitsubishi', model: 'L200', image_url: 'https://images.unsplash.com/photo-1551830691-177301c2333b?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Can-Am', model: 'Maverick X3', image_url: 'https://images.unsplash.com/photo-1588696123998-25f0254c0ce5?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Toyota', model: 'Fortuner', image_url: 'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Volkswagen', model: 'Amarok V6', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Suzuki', model: 'Jimny', image_url: 'https://images.unsplash.com/photo-1598555986386-23d242966810?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Ford', model: 'Raptor', image_url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Honda', model: 'CR-V', image_url: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Mazda', model: 'CX-5', image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79f341?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Nissan', model: 'Versa', image_url: 'https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf3?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Toyota', model: 'Corolla', image_url: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&q=80&w=1000' },
                { make: 'Polaris', model: 'RZR', image_url: 'https://images.unsplash.com/photo-1571224792671-840843232670?auto=format&fit=crop&q=80&w=1000' }
            ];

            let fixedCount = 0;
            const updates = vehicles.map(async (v) => {
                // Find matching template by model name (partial match)
                const template = VEHICLE_TEMPLATES.find(t =>
                    v.model.toLowerCase().includes(t.model.toLowerCase()) ||
                    t.model.toLowerCase().includes(v.model.toLowerCase())
                );

                if (template) {
                    await supabase.from('vehicles').update({ image_url: template.image_url }).eq('id', v.id);
                    fixedCount++;
                } else if (!v.image_url || v.image_url.length < 10) {
                    // Fallback for completely missing images if no template match
                    await supabase.from('vehicles').update({
                        image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'
                    }).eq('id', v.id);
                    fixedCount++;
                }
            });

            await Promise.all(updates);
            alert(`¡Proceso completado! Se actualizaron las imágenes de ${fixedCount} vehículos.`);
            window.location.reload();

        } catch (error) {
            alert('Error al reparar imágenes: ' + error.message);
        } finally {
            setSubmitting(false);
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
            // price_per_day removed
            price_per_hour: vehicle.price_per_hour || '',
            department: foundDept,
            city: vehicle.location_city,
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
                // price_per_day removed
                price_per_hour: Number(formData.price_per_hour) || 0,
                location_city: formData.city, category: formData.category, image_url: formData.image_url,
                description: formData.description,
                is_offer: false
            };

            if (editingId) {
                // Don't overwrite owner_id on edit to avoid permission issues
                const { error } = await supabase.from('vehicles').update(vehicleData).eq('id', editingId);
                if (error) throw error;
                await logAction('UPDATE_VEHICLE', { vehicle_id: editingId, make: vehicleData.make, model: vehicleData.model });
                alert('¡Vehículo actualizado!');
            } else {
                // Determine owner for new vehicle
                const { error } = await supabase.from('vehicles').insert([{ ...vehicleData, owner_id: user.id, rating: 5.0 }]);
                if (error) throw error;
                await logAction('CREATE_VEHICLE', { make: vehicleData.make, model: vehicleData.model });
                alert('¡Vehículo guardado!');
            }

            setIsModalOpen(false);
            setEditingId(null);
            setEditingId(null);
            setFormData({ make: '', model: '', year: new Date().getFullYear(), vehicle_type: 'playa', price_per_hour: '', department: '', city: '', category: '4x4', image_url: '', description: '', is_offer: false, stock: 1 });
            window.location.reload();
        } catch (error) { alert(error.message); }
        finally { setSubmitting(false); }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'vehicles': return <VehiclesView onAddClick={() => { setEditingId(null); setFormData({ make: '', model: '', year: new Date().getFullYear(), vehicle_type: 'playa', price_per_hour: '', department: '', city: '', category: '4x4', image_url: '', description: '', is_offer: false, stock: 1 }); setIsModalOpen(true); }} onFixImages={handleFixImages} onDelete={handleDeleteVehicle} onDeleteMultiple={handleDeleteMultipleVehicles} onEdit={handleEditVehicle} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />;
            case 'clients': return <UserManagement />;
            case 'promotions': return <PromotionsView />;
            case 'reports': return <VistaReportes />;
            case 'reservas': return <BookingsView />;
            case 'locations': return <LocationsView />;
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

export default PanelAdministrador;


