import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import BarraNavegacion from '../components/BarraNavegacion';
import { MapPin, Star, Heart, SlidersHorizontal, Map as MapIcon, List, Plus, Minus, X } from 'lucide-react';
import { COASTAL_LOCATIONS } from '../constants';

const getCapacity = (category) => {
    const caps = { 'Deportivo': 2, 'Compacto': 5, 'Sedán': 5, 'SUV': 5, '4x4': 4, 'Familiar': 7 };
    return caps[category] || 5;
};

const VehicleResultCard = ({ id, make, model, price, location, image, rating, type }) => {
    const capacity = getCapacity(type);

    return (
        <div className="group flex flex-col sm:flex-row gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="relative w-full sm:w-72 h-48 sm:h-52 flex-shrink-0 overflow-hidden rounded-xl">
                <div className="absolute top-3 right-3 z-10">
                    <button className="p-2 rounded-full bg-white/50 hover:bg-white backdrop-blur-sm transition-all text-slate-700 hover:text-rose-500">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
                {/* Tag */}
                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm uppercase tracking-wider">
                    Superanfitrión
                </div>
                <img
                    src={image}
                    alt={`${make} ${model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000';
                    }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">{type || 'Vehículo'}</p>
                            <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-brand-blue transition-colors">{make} {model}</h3>
                        </div>
                    </div>

                    <div className="w-10 h-0.5 bg-slate-200 my-3"></div>

                    <p className="text-slate-500 text-sm mb-2 flex items-center gap-1">
                        <span className="truncate">{location}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded">{capacity} pasajeros</span>
                        <span className="bg-slate-100 px-2 py-1 rounded">Aire acondicionado</span>
                        <span className="bg-slate-100 px-2 py-1 rounded">Automático</span>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-slate-900 fill-slate-900" />
                        <span className="font-bold text-sm text-slate-900">{rating} • </span>
                        <span className="text-sm text-slate-500 ml-1 underline">20 evaluaciones</span>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">S/{price || '0'}</p>
                        <p className="text-slate-500 text-sm font-light">día</p>
                    </div>
                </div>
            </div>
        </div>
    )
};

const ExplorarVehiculos = () => {
    const [searchParams] = useSearchParams();
    const destination = searchParams.get('destination') || '';
    const passengers = Number(searchParams.get('passengers')) || 1;

    // State
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter State
    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 1000,
        categories: [],
        department: '',
        city: ''
    });

    // Helper to toggle filter arrays
    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const list = prev[type] || [];
            const newList = list.includes(value)
                ? list.filter(item => item !== value)
                : [...list, value];
            return { ...prev, [type]: newList };
        });
    };

    // Department Mapping
    const DEPARTMENT_MAP = {
        "tumbes": ["Tumbes", "Contralmirante Villar", "Zarumilla", "Punta Sal", "Zorritos"],
        "piura": ["Piura", "Talara", "Paita", "Sechura", "Sullana", "Morropón", "Ayabaca", "Huancabamba", "Máncora", "Mancora", "Vichayito", "Los Organos", "Cabo Blanco"],
        "lambayeque": ["Chiclayo", "Lambayeque", "Ferreñafe", "Pimentel"],
        "la libertad": ["Trujillo", "Chepén", "Pacasmayo", "Virú", "Ascope", "Huanchaco", "Chicama"],
        "ancash": ["Santa", "Casma", "Huarmey", "Huaraz", "Chimbote", "Tortugas"],
        "lima": ["Lima", "Barranca", "Cañete", "Huaral", "Huaura", "Asia", "Lunahuaná", "Lunahuana", "Miraflores", "San Isidro"],
        "ica": ["Ica", "Chincha", "Pisco", "Nazca", "Palpa", "Paracas", "Huacachina"],
        "arequipa": ["Arequipa", "Camaná", "Islay", "Caravelí", "Mollendo", "Mejía"],
        "moquegua": ["Ilo", "Mariscal Nieto", "General Sánchez Cerro"],
        "tacna": ["Tacna", "Jorge Basadre"]
    };

    useEffect(() => {
        const fetchAndFilterVehicles = async () => {
            setLoading(true);

            // 1. Fetch
            const { data, error } = await supabase.from('vehicles').select('*');

            if (error) {
                console.error('Error fetching vehicles:', error);
                setLoading(false);
                return;
            }

            let results = data || [];

            // 1.5 Date Availability Check (New)
            if (filters.startDate && filters.endDate) {
                // Fetch bookings that overlap with selected dates
                const { data: busyBookings } = await supabase
                    .from('bookings')
                    .select('vehicle_id')
                    .neq('status', 'cancelled')
                    .or(`and(start_date.lte.${filters.endDate},end_date.gte.${filters.startDate})`);

                if (busyBookings && busyBookings.length > 0) {
                    const busyIds = busyBookings.map(b => b.vehicle_id);
                    results = results.filter(v => !busyIds.includes(v.id));
                }
            }

            // 2. Location Filtering
            if (destination) {
                const term = destination.toLowerCase().trim();
                let targetCities = [];

                // Check Department Match
                const matchedDept = Object.keys(DEPARTMENT_MAP).find(d => d.includes(term) || term.includes(d));
                if (matchedDept) {
                    targetCities = DEPARTMENT_MAP[matchedDept];
                }

                results = results.filter(vehicle => {
                    const vCity = vehicle.location_city?.toLowerCase() || '';
                    const directCityMatch = vCity.includes(term);
                    const deptMatch = targetCities.some(cityInDept => vCity.includes(cityInDept.toLowerCase()));
                    return directCityMatch || deptMatch;
                });
            }

            // 3. Advanced Filtering
            results = results.filter(v => {
                const price = v.price_per_day || 0;
                // Price Range
                if (price < filters.minPrice || price > filters.maxPrice) return false;

                if (filters.categories.length > 0) {
                    const matchesCategory = filters.categories.some(cat =>
                        v.category?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
                        cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    );
                    if (!matchesCategory) return false;
                }

                // Location Filter (New)
                if (filters.department) {
                    const deptCities = COASTAL_LOCATIONS[filters.department] || [];
                    const vehicleCity = v.location_city;
                    if (filters.city) {
                        if (vehicleCity !== filters.city) return false;
                    } else {
                        if (!deptCities.includes(vehicleCity)) return false;
                    }
                } else if (filters.city) {
                    if (v.location_city !== filters.city) return false;
                }

                // Passenger Capacity Filter
                const capacity = getCapacity(v.category);
                if (capacity < passengers) return false;

                return true;
            });

            setFilteredVehicles(results);
            setVehicles(data || []); // Store ALL vehicles for filter calculations
            setLoading(false);
        };

        fetchAndFilterVehicles();
    }, [destination, filters]); // Re-run when dependencies change

    // Calculate available locations based on ALL vehicles (not just filtered ones)
    const availableCities = new Set(vehicles.map(v => v.location_city));
    const availableDepartments = Object.keys(COASTAL_LOCATIONS).filter(dept =>
        COASTAL_LOCATIONS[dept].some(city => availableCities.has(city))
    );

    return (
        <div className="min-h-screen bg-white font-sans">
            <BarraNavegacion />

            {/* Filter Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Filtros</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>


                        <div className="mb-8">
                            <h4 className="font-bold text-slate-800 mb-4">Ubicación</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Departamento</label>
                                    <div className="relative">
                                        <select
                                            value={filters.department || ''}
                                            onChange={(e) => setFilters({ ...filters, department: e.target.value, city: '' })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none appearance-none bg-white cursor-pointer font-medium text-sm"
                                        >
                                            <option value="">Todo el Perú</option>
                                            {availableDepartments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Ciudad / Playa</label>
                                    <div className="relative">
                                        <select
                                            value={filters.city || ''}
                                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none appearance-none bg-white cursor-pointer font-medium text-sm"
                                        >
                                            <option value="">Cualquiera</option>
                                            {(!filters.department
                                                ? Array.from(availableCities).sort()
                                                : COASTAL_LOCATIONS[filters.department].filter(city => availableCities.has(city))
                                            ).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="mb-8">
                            <h4 className="font-bold text-slate-800 mb-4">Rango de Precio</h4>
                            <div className="flex gap-4">
                                <div className="flex-1 border border-slate-300 rounded-xl px-3 py-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Mínimo</label>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                                        className="w-full font-bold outline-none"
                                    />
                                </div>
                                <div className="flex-1 border border-slate-300 rounded-xl px-3 py-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase">Máximo</label>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                                        className="w-full font-bold outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="font-bold text-slate-800 mb-3">Categoría</h4>
                            <div className="flex flex-wrap gap-2">
                                {['4x4', 'Sedán', 'Deportivo', 'SUV', 'Compacto'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => toggleFilter('categories', cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border ${filters.categories.includes(cat) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-slate-100">
                            <button
                                onClick={() => setFilters({ minPrice: 0, maxPrice: 1000, categories: [], transmission: [] })}
                                className="text-slate-500 font-bold underline text-sm"
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold"
                            >
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-24 min-h-screen flex flex-col">
                <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between sticky top-[80px] bg-white z-40">
                    <p className="text-sm text-slate-600 font-medium">
                        {loading ? 'Buscando...' : `${filteredVehicles.length} alojamientos en ${filters.city || filters.department || destination || 'todo el Perú'}`}
                    </p>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-2 border border-slate-300 rounded-full px-4 py-2 hover:border-slate-800 transition-colors text-sm font-semibold"
                    >
                        <SlidersHorizontal className="w-4 h-4" /> Filtros
                        {(filters.categories.length > 0 || filters.department) && <span className="w-2 h-2 bg-brand-blue rounded-full"></span>}
                    </button>
                </div>

                <div className="flex flex-1">
                    {/* List */}
                    <div className="w-full lg:w-[60%] xl:w-[55%] px-6 py-4 overflow-y-auto h-[calc(100vh-160px)] custom-scrollbar">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>)}
                            </div>
                        ) : filteredVehicles.length > 0 ? (
                            <div className="space-y-2">
                                {filteredVehicles.map(vehicle => (
                                    <Link key={vehicle.id} to={`/vehiculo/${vehicle.id}`}>
                                        <VehicleResultCard
                                            {...vehicle}
                                            price={vehicle.price_per_day}
                                            type={vehicle.category}
                                            location={vehicle.location_city}
                                            image={vehicle.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'}
                                        />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <h3 className="text-2xl font-bold text-slate-800">No se encontraron vehículos</h3>
                                <p className="text-slate-500 mt-2">Prueba ajustando los filtros</p>
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="hidden lg:block w-[40%] xl:w-[45%] sticky top-[160px] h-[calc(100vh-160px)] bg-slate-100 border-l border-slate-200">
                        <div className="w-full h-full relative overflow-hidden bg-[#eef0f2]">
                            <iframe
                                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(filters.city || filters.department || destination || 'Perú')}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                                className="w-full h-full grayscale-[20%] contrast-[1.1]"
                            ></iframe>
                            <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
                                <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-700 pointer-events-auto cursor-pointer" onClick={() => window.open(`https://www.google.com/maps/search/${filters.city || filters.department || destination || 'Peru'}`, '_blank')}>
                                    <Plus className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplorarVehiculos;
